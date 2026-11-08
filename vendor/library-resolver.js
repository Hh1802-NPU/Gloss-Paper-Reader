import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { lookup } from 'node:dns/promises'
import { request as httpRequest } from 'node:http'
import { Agent, request as httpsRequest } from 'node:https'
import { BlockList, isIP } from 'node:net'
import { promisify } from 'node:util'

const PDF_LIMIT = 60 * 1024 * 1024
const PREVIEW_LIMIT = 512 * 1024
const METADATA_LIMIT = 2 * 1024 * 1024
const TOKEN_TTL = 20 * 60 * 1000
const USER_AGENT = 'Gloss Literature Reader'
const CATALOGUE_HOSTS = new Set([
  'api.crossref.org', 'api.datacite.org', 'api.openalex.org', 'arxiv.org', 'www.arxiv.org', 'export.arxiv.org',
  'doi.org', 'dx.doi.org', 'www.ebi.ac.uk', 'europepmc.org', 'pmc.ncbi.nlm.nih.gov',
  'nature.com', 'www.nature.com', 'idp.nature.com',
])
const exec = promisify(execFile)
let cachedProxy

function problem(code, message, status = 422) {
  return Object.assign(new Error(message), { code, status })
}

const privateAddresses = new BlockList()
for (const [address, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) privateAddresses.addSubnet(address, prefix, 'ipv4')
for (const [address, prefix] of [['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['3fff::', 20]]) {
  privateAddresses.addSubnet(address, prefix, 'ipv6')
}
const globalIpv6 = new BlockList()
globalIpv6.addSubnet('2000::', 3, 'ipv6')
const proxyDnsAddresses = new BlockList()
proxyDnsAddresses.addSubnet('198.18.0.0', 15, 'ipv4')
proxyDnsAddresses.addSubnet('::ffff:0:c612:0', 111, 'ipv6')

export function isPublicAddress(address) {
  const family = isIP(address)
  if (family === 4) return !privateAddresses.check(address, 'ipv4')
  return family === 6 && globalIpv6.check(address, 'ipv6') && !privateAddresses.check(address, 'ipv6')
}

function publicUrl(input, base) {
  if (typeof input !== 'string' || !input || input.length > 4096) return null
  let url
  try { url = new URL(input, base) } catch { return null }
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port ||
      isIP(host.replace(/^\[|\]$/g, '')) || !host.includes('.') ||
      /(?:^|\.)(?:localhost|local|internal|home\.arpa|test|invalid|example|onion)$/i.test(host)) return null
  url.hash = ''
  return url.href
}

function withAbort(promise, signal) {
  if (signal.aborted) return Promise.reject(signal.reason)
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason)
    signal.addEventListener('abort', abort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
  })
}

function desktopProxy() {
  if (process.platform !== 'darwin') return null
  if (cachedProxy && Date.now() < cachedProxy.expires) return cachedProxy.value
  const value = exec('/usr/sbin/scutil', ['--proxy'], { timeout: 1000, maxBuffer: 32768 }).then(({ stdout }) => {
    const setting = key => stdout.match(new RegExp(`^  ${key}\\s*:\\s*([^\\r\\n]+)`, 'm'))?.[1]?.trim()
    const host = setting('HTTPSProxy')
    const port = Number(setting('HTTPSPort'))
    if (setting('HTTPSEnable') !== '1' || !['127.0.0.1', 'localhost', '::1'].includes(host) ||
        !Number.isInteger(port) || port <= 0 || port > 65535) return null
    return new Agent({ proxyEnv: { HTTPS_PROXY: `http://${host === '::1' ? '[::1]' : host}:${port}`, NO_PROXY: '' } })
  }, () => null)
  cachedProxy = { value, expires: Date.now() + 30000 }
  return value
}

async function requestOnce(url, { signal, addresses, accept, proxy }) {
  const request = url.protocol === 'https:' ? httpsRequest : httpRequest
  return new Promise((resolve, reject) => {
    const pending = request(url, {
      signal,
      agent: proxy || false,
      lookup: !proxy && addresses ? ((_host, options, callback) => options.all
        ? callback(null, addresses)
        : callback(null, addresses[0].address, addresses[0].family)) : undefined,
      headers: { accept, 'accept-encoding': 'identity', 'user-agent': USER_AGENT },
    }, resolve)
    pending.on('error', reject)
    pending.end()
  })
}

async function verifiedAddresses(host, signal, proxy) {
  const addresses = await withAbort(lookup(host, { all: true }), signal)
  if (addresses.every(({ address }) => isPublicAddress(address))) return addresses
  const proxyDns = addresses.every(({ address, family }) => proxyDnsAddresses.check(address, family === 6 ? 'ipv6' : 'ipv4'))
  if (!proxyDns) return []

  // Fixed public services can use the configured HTTPS tunnel when local DNS
  // returns only its synthetic addresses. Arbitrary hosts need public DNS proof.
  if (proxy && CATALOGUE_HOSTS.has(host)) return addresses

  // Fake-IP VPN DNS can return only benchmark addresses. Resolve the public hostname
  // through a fixed TLS endpoint before allowing the connection.
  async function resolveThrough(endpoint) {
    const dnsSignal = AbortSignal.any([signal, AbortSignal.timeout(3500)])
    const resolved = await Promise.allSettled([['A', 1, 4], ['AAAA', 28, 6]].map(async ([type, rrType, family]) => {
      const dnsUrl = new URL(endpoint)
      dnsUrl.searchParams.set('name', host)
      dnsUrl.searchParams.set('type', type)
      const response = await requestOnce(dnsUrl, { signal: dnsSignal, accept: 'application/dns-json', proxy })
      if (response.statusCode !== 200) {
        response.destroy()
        throw problem('dns-unavailable', '公开来源的域名暂时无法解析，请稍后重试', 502)
      }
      const bytes = await readResponse(response, 32 * 1024)
      const data = JSON.parse(bytes.toString('utf8'))
      if (data.Status === 3) return []
      if (data.Status !== 0 || data.TC) throw problem('dns-unavailable', '公开来源的域名暂时无法解析，请稍后重试', 502)
      return (data.Answer || []).filter(record => record.type === rrType && isIP(record.data) === family)
        .map(record => ({ address: record.data, family }))
    }))
    if (resolved.every(result => result.status === 'rejected')) return null
    return resolved.flatMap(result => result.status === 'fulfilled' ? result.value : [])
  }
  let publicResults = await resolveThrough('https://cloudflare-dns.com/dns-query')
  if (!publicResults) publicResults = await resolveThrough('https://dns.google/resolve')
  signal.throwIfAborted()
  if (!publicResults) throw problem('dns-unavailable', '公开来源的域名暂时无法解析，请检查网络连接后重试', 502)
  return publicResults.every(({ address }) => isPublicAddress(address)) ? publicResults : []
}

async function readResponse(response, limit, preview = false) {
  if (!preview && Number(response.headers['content-length']) > limit) {
    response.destroy()
    throw problem('remote-too-large', '来源文件超过可导入大小')
  }
  const chunks = []
  let size = 0
  for await (const chunk of response) {
    const remaining = limit - size
    if (chunk.length > remaining && !preview) {
      throw problem('remote-too-large', '来源文件超过可导入大小')
    }
    const piece = chunk.subarray(0, remaining)
    chunks.push(piece)
    size += piece.length
    if (preview && size === limit) break
  }
  return Buffer.concat(chunks, size)
}

async function publicRequest(input, { signal, limit, preview = false, accept }) {
  let current = publicUrl(input)
  const systemProxy = await desktopProxy()
  for (let hop = 0; current && hop <= 5; hop++) {
    signal.throwIfAborted()
    const url = new URL(current)
    const proxy = url.protocol === 'https:' ? systemProxy : null
    const addresses = await verifiedAddresses(url.hostname, signal, proxy)
    if (!addresses.length) break

    // Direct requests pin a verified address. A configured desktop proxy tunnels HTTPS
    // by hostname so its rules can route the connection, with normal TLS verification.
    const options = { signal, addresses, accept, proxy }
    let response
    try {
      response = await requestOnce(url, options)
    } catch (error) {
      if (!proxy || signal.aborted || !['ECONNRESET', 'EPIPE', 'ETIMEDOUT'].includes(error.code)) throw error
      response = await requestOnce(url, options)
    }
    if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
      const next = response.headers.location && publicUrl(response.headers.location, current)
      response.destroy()
      if (url.protocol === 'https:' && next?.startsWith('http:')) break
      current = next
      continue
    }

    if (response.statusCode !== 200) {
      response.destroy()
      return { status: response.statusCode, url: current, bytes: Buffer.alloc(0) }
    }
    if (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity') {
      response.destroy()
      throw problem('remote-content-encoding', '来源返回了不支持的压缩格式')
    }
    return {
      status: 200,
      url: current,
      type: response.headers['content-type'] || '',
      bytes: await readResponse(response, limit, preview),
    }
  }
  throw problem('unsafe-source-url', '只支持公开 HTTP 或 HTTPS 文献链接', 400)
}

const doiOf = value => {
  let raw = String(value ?? '').trim().replace(/^doi:\s*/i, '')
  if (/^https?:\/\/(?:dx\.)?doi\.org\//i.test(raw)) {
    try { raw = decodeURIComponent(new URL(raw).pathname.slice(1)) } catch { return '' }
  }
  return /^10\.\d{4,9}\/[^\s\x00-\x1f\x7f<>?#]+$/i.test(raw) ? raw.toLowerCase() : ''
}
const doiPath = doi => doi.split('/').map(encodeURIComponent).join('/')
const doiUrl = doi => 'https://doi.org/' + doiPath(doi)

function plainText(value, limit = 500) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(
    /&(?:amp|lt|gt|quot|apos|nbsp|#[0-9]{1,7}|#x[0-9a-f]{1,6});/gi,
    entity => {
      const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' }
      if (entity[1] !== '#') return named[entity.toLowerCase()] || ''
      const hex = entity[2]?.toLowerCase() === 'x'
      const code = Number.parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10)
      return code > 31 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    },
  ).replace(/\s+/g, ' ').trim().slice(0, limit)
}

function knownPdf(value) {
  const safe = publicUrl(value)
  if (!safe) return null
  const { hostname, pathname } = new URL(safe)
  if (hostname === 'arxiv.org' || hostname === 'www.arxiv.org') {
    const match = pathname.match(/^\/(?:abs|pdf|html)\/((?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?)(?:\.pdf)?\/?$/i)
    if (match) return 'https://arxiv.org/pdf/' + match[1]
  }
  return /\.pdf$/i.test(pathname) ? safe : null
}

function doiFromUrl(value) {
  const safe = publicUrl(value)
  if (!safe) return ''
  const { hostname, pathname } = new URL(safe)
  if (hostname !== 'nature.com' && hostname !== 'www.nature.com') return ''
  const item = pathname.match(/^\/articles\/([a-z]+\d[a-z\d-]*)(?:\.pdf)?\/?$/i)?.[1]
  return item ? doiOf('10.1038/' + item) : ''
}

function titleKey(value) {
  return plainText(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function titleScore(value, query) {
  const title = titleKey(value)
  if (title === query) return 3
  if (query && title.includes(query)) return 2
  const terms = query.split(' ').filter(Boolean)
  return terms.filter(term => title.includes(term)).length / Math.max(terms.length, 1)
}

function pdfHeader(bytes) {
  return /^\s*%PDF-\d\.\d[\r\n]/.test(bytes.subarray(0, 1024).toString('latin1'))
}

function yearOf(value) {
  const found = String(value ?? '').match(/^(?:18|19|20|21)\d{2}\b/)
  return found ? Number(found[0]) : null
}

function urlTitle(value) {
  const url = new URL(value)
  try {
    return plainText(decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || url.hostname).replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ')) || url.hostname
  } catch {
    return url.hostname
  }
}

function pageMetadata(page) {
  const html = page.bytes.toString('utf8')
  const meta = new Map()
  for (const tag of html.matchAll(/<meta\s[^>]*>/gi)) {
    const attrs = Object.fromEntries(Array.from(tag[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g), match =>
      [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4]],
    ))
    const key = String(attrs.name || attrs.property || '').toLowerCase()
    if (key && attrs.content) {
      if (!meta.has(key)) meta.set(key, [])
      meta.get(key).push(attrs.content)
    }
  }
  const field = (...keys) => keys.map(key => meta.get(key)?.[0]).find(Boolean)
  const pdf = field('citation_pdf_url', 'eprints.document_url')
  return {
    title: plainText(field('citation_title', 'dc.title', 'og:title') || html.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1]),
    doi: doiOf(field('citation_doi', 'dc.identifier', 'prism.doi')),
    authors: (meta.get('citation_author') || meta.get('dc.creator') || []).slice(0, 20).map(author => plainText(author, 160)),
    year: yearOf(field('citation_publication_date', 'citation_date', 'dc.date')),
    pdfUrl: pdf ? publicUrl(pdf.replace(/&amp;/gi, '&'), page.url) : knownPdf(page.url),
  }
}

function crossrefItem(work) {
  const doi = doiOf(work.DOI)
  return {
    title: work.title?.[0],
    authors: (work.author || []).map(author => author.name || [author.given, author.family].filter(Boolean).join(' ')),
    year: (work.published || work.issued)?.['date-parts']?.[0]?.[0],
    doi,
    url: work.resource?.primary?.URL || work.URL || (doi && doiUrl(doi)),
    pdfUrl: work.link?.find(link => link['content-type'] === 'application/pdf' && link['intended-application'] !== 'text-mining')?.URL,
  }
}

function dataciteItem(record) {
  const work = record.attributes || {}
  const doi = doiOf(work.doi)
  return {
    title: work.titles?.[0]?.title,
    authors: (work.creators || []).map(author => author.name),
    year: work.publicationYear,
    doi,
    url: work.url || (doi && doiUrl(doi)),
    pdfUrl: Array.isArray(work.contentUrl) ? work.contentUrl.find(link => knownPdf(link)) : null,
  }
}

function europePmcItem(work) {
  const doi = doiOf(work.doi)
  const repository = /^PMC\d+$/.test(work.pmcid || '') ? 'https://europepmc.org/articles/' + work.pmcid : null
  const fullText = work.fullTextUrlList?.fullTextUrl
  return {
    title: work.title,
    authors: work.authorList?.author?.map(author => author.fullName || author.collectiveName) || String(work.authorString || '').split(/,\s*/),
    year: work.pubYear,
    doi,
    url: repository || (doi && doiUrl(doi)),
    pdfUrl: Array.isArray(fullText) ? fullText.find(link => /^pdf$/i.test(link.documentStyle) && /^(?:open access|free)$/i.test(link.availability))?.url : null,
  }
}

function arxivItems(bytes) {
  const entries = bytes.toString('utf8').matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)
  return [...entries].flatMap(([, entry]) => {
    const source = entry.match(/<id>([^<]+)<\/id>/i)?.[1]
    const url = publicUrl(source?.trim().replace(/^http:/i, 'https:'))
    const pdfUrl = knownPdf(url)
    const arxivId = pdfUrl?.split('/pdf/')[1]?.replace(/v\d+$/i, '')
    if (!arxivId || !pdfUrl.startsWith('https://arxiv.org/pdf/')) return []
    return [{
      title: entry.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1],
      authors: [...entry.matchAll(/<author>\s*<name>([^<]+)<\/name>/gi)].map(([, author]) => author),
      year: entry.match(/<published>([^<]+)<\/published>/i)?.[1],
      doi: doiOf(entry.match(/<arxiv:doi(?:\s[^>]*)?>([^<]+)<\/arxiv:doi>/i)?.[1]) || doiOf('10.48550/arxiv.' + arxivId),
      url,
      pdfUrl,
    }]
  })
}

export function createLibraryResolver({ request = publicRequest } = {}) {
  const tokens = new Map()
  let activeDownloads = 0
  let activeArxiv = false
  let lastArxivLookup = 0

  function remember(pdfUrl, url, doi, alternates) {
    if (!pdfUrl && !url) return null
    for (const [key, saved] of tokens) if (Date.now() > saved.expires) tokens.delete(key)
    if (tokens.size >= 128) tokens.delete(tokens.keys().next().value)
    const token = randomUUID()
    tokens.set(token, { pdfUrl, url, doi, alternates, expires: Date.now() + TOKEN_TTL })
    return token
  }

  function candidate(item) {
    const url = publicUrl(item.url)
    const pdfUrl = publicUrl(item.pdfUrl) || knownPdf(url)
    const doi = doiOf(item.doi) || doiFromUrl(url)
    return {
      id: randomUUID(),
      title: plainText(item.title) || (url || pdfUrl ? urlTitle(url || pdfUrl) : '未命名文献'),
      authors: (item.authors || []).filter(Boolean).slice(0, 20).map(author => plainText(author, 160)),
      year: yearOf(item.year),
      doi,
      url,
      pdfUrl,
      pdfStatus: pdfUrl ? 'direct' : url ? 'search' : 'none',
      pdfToken: remember(pdfUrl, url, doi, item.alternates || []),
    }
  }

  async function metadataJson(url, signal) {
    const result = await request(url, { signal, accept: 'application/json', limit: METADATA_LIMIT })
    if (result.status === 404) return null
    if (result.status !== 200) throw problem('lookup-unavailable', '文献目录暂时不可用', 502)
    return JSON.parse(result.bytes.toString('utf8'))
  }

  async function arxivLookup(term, signal) {
    const url = new URL('https://export.arxiv.org/api/query')
    url.searchParams.set('search_query', 'ti:"' + term + '"')
    url.searchParams.set('max_results', '4')
    activeArxiv = true
    lastArxivLookup = Date.now()
    try {
      const result = await request(url.href, { signal, accept: 'application/atom+xml', limit: METADATA_LIMIT })
      if (result.status !== 200) throw problem('lookup-unavailable', '文献目录暂时不可用', 502)
      return arxivItems(result.bytes)
    } finally {
      activeArxiv = false
    }
  }

  async function lookupQuery(input, cancel) {
    if (typeof input !== 'string' || !input.trim() || input.trim().length > 1024) {
      throw problem('invalid-library-query', '请输入 DOI、公开链接或文献题目', 400)
    }
    const query = input.trim()
    const doi = doiOf(query)
    const signal = AbortSignal.any([cancel, AbortSignal.timeout(12000)])
    const bareUrl = /^[\w-]+(?:\.[\w-]+)+[/?#][^\s]*$/i.test(query) ? 'https://' + query : ''
    if (!doi && (bareUrl || /^[a-z][a-z\d+.-]*:\/\/|^(?:file|data|javascript):/i.test(query))) {
      const url = publicUrl(bareUrl || query)
      if (!url) throw problem('unsafe-source-url', '只支持公开 HTTP 或 HTTPS 文献链接', 400)
      let pdfUrl = knownPdf(url)
      let metadata = {}
      if (!pdfUrl || new URL(url).pathname.startsWith('/abs/')) {
        try {
          const page = await request(url, {
            signal, accept: 'text/html, application/pdf', limit: PREVIEW_LIMIT, preview: true,
          })
          if (page.status === 200) {
            if (pdfHeader(page.bytes)) pdfUrl = page.url
            else if (/html/i.test(page.type)) metadata = pageMetadata(page)
          }
        } catch (error) {
          if (error.code === 'unsafe-source-url' || cancel.aborted) throw error
        }
      }
      return [candidate({ ...metadata, url, pdfUrl: metadata.pdfUrl || pdfUrl })]
    }

    const term = query.replace(/["\\]/g, ' ').trim()
    const crossref = new URL('https://api.crossref.org/works' + (doi ? '/' + doiPath(doi) : ''))
    if (!doi) {
      crossref.searchParams.set('query.title', term)
      crossref.searchParams.set('rows', '5')
      crossref.searchParams.set('select', 'DOI,title,author,published,issued,URL,link,resource')
    }
    const datacite = new URL('https://api.datacite.org/dois' + (doi ? '/' + doiPath(doi) : ''))
    if (!doi) {
      datacite.searchParams.set('query', 'titles.title:"' + term + '"')
      datacite.searchParams.set('page[size]', '4')
    }
    const europePmc = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search')
    europePmc.searchParams.set('query', doi ? 'DOI:"' + doi.replace(/["\\]/g, '') + '"' : 'TITLE:"' + term + '"')
    europePmc.searchParams.set('resultType', 'core')
    europePmc.searchParams.set('format', 'json')
    europePmc.searchParams.set('pageSize', '4')

    const providers = [
      metadataJson(crossref.href, signal).then(result => (doi ? [result?.message] : result?.message?.items || []).filter(Boolean).map(crossrefItem)),
      metadataJson(datacite.href, signal).then(result => (doi ? [result?.data] : result?.data || []).filter(Boolean).map(dataciteItem)),
      metadataJson(europePmc.href, signal).then(result => (result?.resultList?.result || []).map(europePmcItem)),
    ]
    if (!doi && term && !activeArxiv && Date.now() - lastArxivLookup >= 3000) providers.push(arxivLookup(term, signal))
    const results = await Promise.allSettled(providers)
    cancel.throwIfAborted()
    const byWork = new Map()
    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      for (const item of result.value) {
        if (!item.title || (doi && item.doi !== doi)) continue
        const key = item.doi || titleKey(item.title)
        const previous = byWork.get(key)
        if (!previous) byWork.set(key, item)
        else if (item.pdfUrl) {
          if (!previous.pdfUrl) previous.pdfUrl = item.pdfUrl
          else if (previous.pdfUrl !== item.pdfUrl) (previous.alternates ||= []).push(item.pdfUrl)
        }
      }
    }
    if (!byWork.size && doi) {
      const arxivId = doi.match(/^10\.48550\/arxiv\.(.+)$/)?.[1]
      const arxivUrl = arxivId && 'https://arxiv.org/abs/' + arxivId
      return [candidate({ title: doi, doi, url: knownPdf(arxivUrl) ? arxivUrl : doiUrl(doi) })]
    }
    if (!byWork.size && results.every(result => result.status === 'rejected')) {
      throw problem('lookup-unavailable', '文献目录暂时不可用，请稍后重试', 502)
    }
    const works = [...byWork.values()]
    if (!doi) {
      const target = titleKey(query)
      const pdfScore = item => Number(Boolean(publicUrl(item.pdfUrl) || knownPdf(item.url)))
      works.sort((a, b) => titleScore(b.title, target) - titleScore(a.title, target) || pdfScore(b) - pdfScore(a))
    }
    return works.slice(0, 10).map(candidate)
  }

  async function download(token, cancel, onSource = () => {}) {
    const item = typeof token === 'string' && tokens.get(token)
    if (!item || Date.now() > item.expires) throw problem('expired-pdf-token', '查找结果已过期，请重新查找', 404)
    if (activeDownloads >= 2) throw problem('pdf-download-busy', '已有 PDF 正在下载，请稍后再试', 429)
    activeDownloads++
    const signal = AbortSignal.any([cancel, AbortSignal.timeout(35000)])
    const visited = new Set()
    let failure
    try {
      const getPdf = async source => {
        const url = publicUrl(source)
        if (!url || visited.has(url)) return null
        visited.add(url)
        try {
          const attempt = AbortSignal.any([signal, AbortSignal.timeout(16000)])
          const result = await request(url, { signal: attempt, accept: 'application/pdf, */*;q=0.2', limit: PDF_LIMIT })
          if (result.status !== 200 || !pdfHeader(result.bytes)) return null
          if (result.bytes.subarray(-1024).lastIndexOf('%%EOF') < 0) throw problem('incomplete-pdf', '来源返回的 PDF 不完整')
          onSource(url)
          return result.bytes
        } catch (error) {
          signal.throwIfAborted()
          failure ||= error
          return null
        }
      }
      for (const url of [item.pdfUrl, ...item.alternates]) {
        const bytes = await getPdf(url)
        if (bytes) return bytes
      }
      if (item.doi) {
        const workUrl = 'https://api.openalex.org/works/' + doiUrl(item.doi) + '?select=doi,best_oa_location,locations'
        try {
          const data = await metadataJson(workUrl, AbortSignal.any([signal, AbortSignal.timeout(7000)]))
          if (doiOf(data?.doi) === item.doi) {
            const locations = [data.best_oa_location, ...(Array.isArray(data.locations) ? data.locations : [])]
            const alternatives = [...new Set(locations.filter(location => location?.is_oa === true)
              .map(location => publicUrl(location.pdf_url) || knownPdf(location.landing_page_url)).filter(Boolean))]
            for (const url of alternatives.slice(0, 4)) {
              const bytes = await getPdf(url)
              if (bytes) return bytes
            }
          }
        } catch (error) {
          signal.throwIfAborted()
          // Catalogue unavailability should not prevent trying the article landing page.
        }
      }
      if (item.url && !visited.has(item.url)) {
        try {
          const page = await request(item.url, { signal, accept: 'text/html, application/pdf', limit: PREVIEW_LIMIT, preview: true })
          if (page.status === 200) {
            const url = pdfHeader(page.bytes) ? page.url : /html/i.test(page.type) ? pageMetadata(page).pdfUrl : null
            const bytes = await getPdf(url)
            if (bytes) return bytes
          }
        } catch (error) {
          signal.throwIfAborted()
          failure ||= error
        }
      }
      if (failure) throw failure
      throw problem('no-public-pdf', '未找到可直接下载的公开 PDF，可保留文献信息或手动上传')
    } finally {
      activeDownloads--
    }
  }

  return { lookup: lookupQuery, download }
}
