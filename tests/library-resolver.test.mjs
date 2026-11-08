import test from 'node:test'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { root } from './helpers.mjs'

const { createLibraryResolver, isPublicAddress } = await import(pathToFileURL(path.join(root, 'vendor/library-resolver.js')))
const signal = () => new AbortController().signal
const pdf = Buffer.from('%PDF-1.7\nfixture\n%%EOF\n')
const reply = (url, body, type = 'application/json', status = 200) => ({
  url, type, status,
  bytes: Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)),
})

test('title lookup ranks an exact match with a public PDF and merges results by DOI', async () => {
  const title = 'Research Fixture on Layouts'
  const resolver = createLibraryResolver({ request: async url => {
    const host = new URL(url).hostname
    if (host === 'api.crossref.org') return reply(url, { message: { items: [
      { DOI: '10.1234/similar', title: [title + ' II'] },
      { DOI: '10.1234/same-title', title: [title] },
      { DOI: '10.1234/primary', title: [title], author: [{ given: 'Jane', family: 'Doe' }], issued: { 'date-parts': [[2024]] } },
    ] } })
    if (host === 'api.datacite.org') return reply(url, { data: [{ attributes: {
      doi: '10.1234/PRIMARY', titles: [{ title }], contentUrl: ['https://publisher.example.org/fixture.pdf'],
    } }] })
    return reply(url, { resultList: { result: [] } })
  } })
  const items = await resolver.lookup(title, signal())
  assert.deepEqual(items.map(item => item.doi), ['10.1234/primary', '10.1234/same-title', '10.1234/similar'])
  assert.deepEqual(items[0].authors, ['Jane Doe'])
  assert.equal(items[0].year, 2024)
  assert.equal(items[0].pdfStatus, 'direct')
  assert.ok(items[0].pdfToken)
})

test('direct URL resolves publisher metadata and only downloads through a lookup token', async () => {
  const calls = []
  const resolver = createLibraryResolver({ request: async (url, options) => {
    calls.push([url, options])
    if (url.endsWith('/fulltext')) return reply(url, pdf, 'application/pdf')
    return reply(url, `<meta name="citation_title" content="A &amp; B"><meta name="citation_author" content="Jane Doe"><meta name="citation_doi" content="10.1234/ABC"><meta name="citation_pdf_url" content="/fulltext">`, 'text/html')
  } })
  const [item] = await resolver.lookup('publisher.example.org/article', signal())
  assert.equal(item.title, 'A & B')
  assert.equal(item.doi, '10.1234/abc')
  assert.equal(item.pdfUrl, 'https://publisher.example.org/fulltext')
  await assert.rejects(resolver.download(item.pdfUrl, signal()), { code: 'expired-pdf-token' })
  assert.deepEqual(await resolver.download(item.pdfToken, signal()), pdf)
  assert.equal(calls.length, 2)
  assert.equal(calls[0][1].preview, true)
  assert.ok(calls[1][1].limit < 64 * 1024 * 1024)
})

test('arXiv title lookup recognizes the preprint, not just same-title catalogue entries', async () => {
  const title = 'A Preprint Fixture'
  const resolver = createLibraryResolver({ request: async url => {
    const host = new URL(url).hostname
    if (host === 'api.crossref.org') return reply(url, { message: { items: [{ DOI: '10.1234/review', title: [title] }] } })
    if (host === 'export.arxiv.org') return reply(url, `<feed><title>Search</title><entry><id>http://arxiv.org/abs/1706.03762v7</id><title>${title}</title><published>2017-06-12T17:57:34Z</published><author><name>Jane Doe</name></author></entry></feed>`, 'application/atom+xml')
    return reply(url, {}, 'application/json', 404)
  } })
  const [preprint, review] = await resolver.lookup(title, signal())
  assert.equal(preprint.doi, '10.48550/arxiv.1706.03762')
  assert.equal(preprint.pdfUrl, 'https://arxiv.org/pdf/1706.03762v7')
  assert.equal(preprint.year, 2017)
  assert.equal(review.doi, '10.1234/review')
})

test('non-PDF and incomplete responses fail without retrying a known direct URL', async () => {
  for (const [content, expected] of [['<html>%PDF-1.7\n%%EOF</html>', 'no-public-pdf'], ['%PDF-1.7\nmissing', 'incomplete-pdf']]) {
    let requests = 0
    const resolver = createLibraryResolver({ request: async url => {
      requests++
      return reply(url, content, 'application/pdf')
    } })
    const [item] = await resolver.lookup('https://publisher.example.org/file.pdf', signal())
    await assert.rejects(resolver.download(item.pdfToken, signal()), { code: expected })
    assert.equal(requests, 1)
  }
})

test('publisher access failure falls back to a public repository for the same DOI', async () => {
  const publisher = 'https://www.nature.com/articles/s41586-025-09005-y.pdf'
  const repository = 'https://arxiv.org/pdf/2405.13063'
  const calls = []
  const resolver = createLibraryResolver({ request: async url => {
    calls.push(url)
    if (url === publisher) return reply(url, 'Sign in', 'text/html', 403)
    if (url === repository) return reply(url, pdf, 'application/pdf')
    return reply(url, { doi: 'https://doi.org/10.1038/s41586-025-09005-y', locations: [
      { is_oa: false, pdf_url: 'https://publisher.example.org/paywall.pdf' },
      { is_oa: true, pdf_url: 'http://127.0.0.1/internal.pdf' },
      { is_oa: true, pdf_url: publisher },
      { is_oa: true, pdf_url: repository },
    ] })
  } })
  const [item] = await resolver.lookup(publisher, signal())
  assert.equal(item.doi, '10.1038/s41586-025-09005-y')
  let source
  assert.deepEqual(await resolver.download(item.pdfToken, signal(), url => { source = url }), pdf)
  assert.equal(source, repository)
  assert.deepEqual(calls, [publisher, 'https://api.openalex.org/works/https://doi.org/10.1038/s41586-025-09005-y?select=doi,best_oa_location,locations', repository])
})

test('private, literal, encoded loopback and disallowed URLs fail before transport', async () => {
  const resolver = createLibraryResolver({ request: async () => assert.fail('unsafe URL reached transport') })
  for (const url of ['file:///etc/passwd', 'http://2130706433/file.pdf', 'https://[::1]/x', 'http://metadata.google.internal/', 'https://login@public.example.org/x', 'https://public.example.org:8443/x']) {
    await assert.rejects(resolver.lookup(url, signal()), { code: 'unsafe-source-url' })
  }
  for (const address of ['127.0.0.1', '100.64.1.1', '169.254.169.254', '198.18.0.23', '::ffff:0:c612:17', '::ffff:127.0.0.1', 'fd00::1', '2001:db8::1']) {
    assert.equal(isPublicAddress(address), false, address)
  }
  assert.equal(isPublicAddress('1.1.1.1'), true)
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true)
})
