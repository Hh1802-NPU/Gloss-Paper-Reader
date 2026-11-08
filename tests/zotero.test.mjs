import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pathToFileURL } from 'node:url'
import { root } from './helpers.mjs'

const { apply } = await import(pathToFileURL(path.join(root, 'index.js')).href)
const api = '/api/literature/zotero'
const upstream = '/api/users/0/items'
const pdf = Buffer.from('%PDF-1.7\n%\x80\x81\x82\n%%EOF\n', 'latin1')

function setup(t, fixtures) {
  const routes = new Map()
  const requests = []
  apply({
    effect: (register) => register(),
    webServer: { register: ({ path, handler }) => routes.set(path, handler) },
  })
  t.mock.method(globalThis, 'fetch', async (value, options) => {
    const url = new URL(value)
    assert.equal(url.origin, 'http://127.0.0.1:23119')
    assert.equal(options.redirect, 'manual')
    assert.equal(options.method ?? 'GET', 'GET')
    requests.push(url.pathname)
    const valueForPath = fixtures[url.pathname]
    assert.notEqual(valueForPath, undefined, 'unexpected Zotero request ' + url.pathname)
    const [status, content, headers] = typeof valueForPath === 'function' ? valueForPath(url, options) : valueForPath
    return new Response(status === 302 ? null : Buffer.isBuffer(content) ? content : JSON.stringify(content), {
      status, headers: { 'Zotero-Server-ID': 'fixture-server', ...headers },
    })
  })
  async function request(url, body, headers = {}) {
    const req = Object.assign(Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []), {
      method: body ? 'POST' : 'GET', url, headers: { host: 'localhost:8999', ...headers },
    })
    const res = new EventEmitter()
    return new Promise((resolve) => {
      res.writeHead = (status, fields) => Object.assign(res, { status, fields, headersSent: true })
      res.end = (value) => {
        res.writableEnded = true
        resolve({ status: res.status, headers: res.fields, value })
        res.emit('close')
      }
      routes.get(url.split('?')[0])(req, res)
    })
  }
  return { request, requests }
}

function attachment(key, data = {}) {
  return { key, itemType: 'attachment', linkMode: 'imported_file', contentType: 'application/pdf', filename: '原文 PDF.pdf', ...data }
}

test('Zotero follows a local file redirect and returns the original PDF unchanged', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gloss-zotero-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const parent = { key: 'PARENT01', itemType: 'journalArticle', title: 'Synthetic paper', DOI: '10.0000/example', abstractNote: 'Synthetic abstract.' }
  const missing = attachment('MISSING1', { parentItem: parent.key })
  const original = attachment('ORIGINAL', { parentItem: parent.key })
  const standalone = attachment('STANDPDF')
  const localDir = path.join(dir, 'storage', original.key)
  const localFile = path.join(localDir, original.filename)
  await mkdir(localDir, { recursive: true })
  await writeFile(localFile, pdf)
  const { request, requests } = setup(t, {
    [upstream + '/top']: [200, [{ data: standalone }, { data: parent }, { data: { key: 'NOTE0001', itemType: 'note' } }], { 'Total-Results': '4' }],
    [upstream + '/' + parent.key]: [200, { data: parent }],
    [upstream + '/' + parent.key + '/children']: [200, [{ data: missing }, { data: original }]],
    [upstream + '/' + missing.key + '/file']: [404, {}],
    [upstream + '/' + original.key]: [200, { data: original }],
    [upstream + '/' + original.key + '/file']: [302, null, { Location: pathToFileURL(localFile).href }],
  })
  const list = JSON.parse((await request(api + '?q=synthetic')).value)
  assert.deepEqual(list.items.map((item) => item.key), [standalone.key, parent.key])
  assert.equal(list.nextStart, 3)
  const imported = JSON.parse((await request(api, { key: parent.key })).value)
  assert.equal(imported.attachmentKey, original.key)
  assert.equal(imported.pdfStatus, 'available')
  assert.equal(imported.source, 'zotero-pdf')
  assert.equal(imported.text, '')
  assert.equal(imported.meta.abstract, parent.abstractNote)
  assert.equal(imported.meta.doi, parent.DOI)
  const response = await request(api + '/file?attachment=' + original.key + '&server=' + imported.meta.zoteroServerId)
  assert.equal(response.status, 200)
  assert.equal(response.headers['content-type'], 'application/pdf')
  assert.deepEqual(response.value, pdf)
  assert.ok(!requests.some((requestPath) => requestPath.endsWith('/fulltext')))
})

test('Zotero exposes the true missing-file state and retains usable index or metadata', async (t) => {
  const item = attachment('MISSING1')
  const metadata = { key: 'PARENT01', itemType: 'journalArticle', title: 'Metadata only' }
  const { request, requests } = setup(t, {
    [upstream + '/' + item.key]: [200, { data: item }],
    [upstream + '/' + item.key + '/file']: [302, null, { Location: 'https://example.invalid/original.pdf' }],
    [upstream + '/' + item.key + '/fulltext']: [200, { content: 'Indexed text' }],
    [upstream + '/' + metadata.key]: [200, { data: metadata }],
    [upstream + '/' + metadata.key + '/children']: [200, []],
  })
  const preview = JSON.parse((await request(api, { key: item.key, previewOnly: true })).value)
  assert.equal(preview.pdfStatus, 'unavailable')
  assert.equal(preview.text, '')
  assert.ok(!requests.some((requestPath) => requestPath.endsWith('/fulltext')))
  const imported = JSON.parse((await request(api, { key: item.key })).value)
  assert.equal(imported.pdfStatus, 'unavailable')
  assert.equal(imported.attachmentKey, item.key)
  assert.equal(imported.source, 'zotero-fulltext')
  assert.equal(imported.text, 'Indexed text')
  assert.equal((await request(api + '/file?attachment=' + item.key)).status, 404)
  const fallback = JSON.parse((await request(api, { key: metadata.key })).value)
  assert.equal(fallback.pdfStatus, 'none')
  assert.equal(fallback.source, 'metadata-only')
  assert.equal(fallback.text, '')
})

test('Zotero blocks non-loopback and foreign origin, mismatched libraries and linked stored directories', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gloss-zotero-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const item = attachment('ORIGINAL')
  const localDir = path.join(dir, 'storage', item.key)
  await mkdir(path.dirname(localDir), { recursive: true })
  await symlink(dir, localDir, 'dir')
  await writeFile(path.join(dir, item.filename), pdf)
  const { request, requests } = setup(t, {
    [upstream + '/' + item.key]: [200, { data: item }],
    [upstream + '/' + item.key + '/file']: [302, null, { Location: pathToFileURL(path.join(localDir, item.filename)).href }],
  })
  const url = api + '/file?attachment=' + item.key
  assert.equal((await request(url, null, { host: 'rebinding.invalid' })).status, 403)
  assert.equal((await request(url, null, { origin: 'https://foreign.invalid' })).status, 403)
  assert.equal(requests.length, 0)
  assert.equal((await request(url + '&server=other-zotero')).status, 409)
  assert.equal((await request(url)).status, 404)
})

test('Zotero matches exact DOI beyond the first page and ranks the verified local PDF first', async (t) => {
  const doi = '10.1234/fixture'
  const metadata = { key: 'PARENT01', itemType: 'journalArticle', title: 'Metadata', DOI: doi }
  const original = { key: 'PARENT02', itemType: 'preprint', title: 'Paper with original', extra: 'DOI: 10.1234/FIXTURE' }
  const wrong = { key: 'PARENT03', itemType: 'journalArticle', title: 'Same title', DOI: '10.1234/other' }
  const file = attachment('ORIGINAL', { parentItem: original.key })
  const first = [metadata, wrong, ...Array.from({ length: 98 }, (_, i) => ({ key: 'FILL' + String(i).padStart(4, '0'), itemType: 'note' }))]
  const { request, requests } = setup(t, {
    [upstream + '/top']: (url, options) => {
      assert.equal(url.searchParams.has('q'), false)
      if (url.searchParams.get('start') === '0') return [200, first, { 'Total-Results': '101' }]
      assert.equal(url.searchParams.get('start'), '100')
      assert.equal(options.headers['Zotero-Server-ID'], 'fixture-server')
      return [200, [original], { 'Total-Results': '101' }]
    },
    [upstream + '/' + metadata.key + '/children']: [200, []],
    [upstream + '/' + original.key + '/children']: [200, [{ data: file }]],
    [upstream + '/' + file.key + '/file']: [200, pdf],
  })
  const response = await request(api + '/match', { doi: 'https://doi.org/10.1234/FIXTURE', title: wrong.title })
  assert.equal(response.status, 200)
  const payload = JSON.parse(response.value)
  assert.equal(payload.complete, true)
  assert.deepEqual(payload.items.map(({ key, match, pdfStatus }) => [key, match, pdfStatus]),
    [[original.key, 'doi', 'available'], [metadata.key, 'doi', 'none']])
  assert.equal(payload.items[0].attachmentKey, file.key)
  assert.equal(payload.items[0].zoteroUrl, 'zotero://select/library/items/' + original.key)
  assert.ok(!requests.some((url) => url.endsWith('/fulltext') || url.includes(wrong.key)))
})

test('Zotero matches the article URL and preserves identifiers in query strings', async (t) => {
  const article = { key: 'PARENT01', itemType: 'journalArticle', title: 'Synthetic Article', url: 'https://example.org/paper/?article=123&utm_medium=test' }
  const other = { key: 'PARENT02', itemType: 'journalArticle', title: 'Unrelated', url: 'https://example.org/paper/?article=456' }
  const { request } = setup(t, {
    [upstream + '/top']: [200, [article, other]],
    [upstream + '/' + article.key + '/children']: [200, []],
  })
  for (const [body, match] of [
    [{ url: 'https://example.org/paper?article=123#section' }, 'url'],
    [{ title: 'synthetic   article' }, 'title'],
  ]) {
    const response = await request(api + '/match', body)
    assert.equal(response.status, 200)
    assert.deepEqual(JSON.parse(response.value).items.map((item) => [item.key, item.match]), [[article.key, match]])
  }
  const missing = await request(api + '/match', { url: 'https://example.org/paper?article=789' })
  assert.deepEqual(JSON.parse(missing.value).items, [])
})
