import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readdir, readFile, rm, symlink } from 'node:fs/promises'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { root } from './helpers.mjs'

const { apply } = await import(pathToFileURL(path.join(root, 'index.js')).href)

test('library storage lists directories and round-trips the same PDF without overwrites', async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gloss-library-'))
  t.after(() => rm(directory, { force: true, recursive: true }))
  const routes = new Map()
  apply({ effect: (fn) => fn(), webServer: { register: ({ path, handler }) => routes.set(path, handler) } })
  const server = createServer((req, res) => routes.get(req.url)(req, res))
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => server.close())
  const base = 'http://127.0.0.1:' + server.address().port
  const json = (route, body, origin = base) => fetch(base + route, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-gloss-local-operation': '1', ...(origin && { origin }) }, body: JSON.stringify(body),
  })
  const folder = '/api/literature/library/directory'
  const storage = '/api/literature/library/local-pdf'
  assert.equal((await json(folder, { path: directory }, 'https://foreign.invalid')).status, 403)
  assert.equal((await json(folder, { path: directory }, null)).status, 200)
  assert.equal((await json(folder, { path: 'relative' })).status, 400)
  const location = await (await json(folder, { path: directory, validate: true })).json()
  assert.equal(location.ok, true)
  const listing = await (await json(folder, { path: directory })).json()
  assert.equal(listing.path, location.path)
  assert.deepEqual(listing.directories, [])

  const bytes = Buffer.from('%PDF-1.7\nSynthetic transport fixture\n%%EOF')
  const hash = createHash('sha256').update(bytes).digest('hex')
  const id = 'pdf-' + hash
  const target = path.join(directory, 'Gloss-' + hash + '.pdf')
  const upload = (body = bytes) => fetch(base + storage, {
    method: 'POST', headers: { origin: base, 'content-type': 'application/pdf', 'x-gloss-local-operation': '1', 'x-gloss-pdf-directory': encodeURIComponent(directory), 'x-gloss-document-id': id }, body,
  })
  assert.equal((await upload()).status, 200)
  assert.equal((await upload()).status, 200)
  assert.equal((await upload(Buffer.from('%PDF-1.7\nDifferent file'))).status, 400)
  assert.deepEqual(await readdir(directory), [path.basename(target)])
  const restored = await json(storage, { path: directory, id })
  assert.match(restored.headers.get('content-type'), /application\/pdf/)
  assert.deepEqual(Buffer.from(await restored.arrayBuffer()), bytes)
  assert.deepEqual(await readFile(target), bytes)

  const other = path.join(directory, 'unmanaged.pdf')
  await rm(target)
  await symlink(other, target)
  assert.equal((await json(storage, { path: directory, id })).status, 400)
  assert.equal((await upload()).status, 400)
})
