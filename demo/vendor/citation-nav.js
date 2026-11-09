/* Local literature reader: conservative, source-bound citation navigation. */
(function (scope) {
  'use strict'

  const YEAR = '\\b(?:19|20)\\d{2}[a-z]?(?![a-z\\d])'
  const YEAR_LIST = YEAR + '(?:\\s*[,，]\\s*(?:' + YEAR + '|[a-z](?![A-Za-z])))*'
  const HEADING = /^\s*(?:(?:\d+(?:\.\d+)*[.)]?)\s+)?(?:references|bibliography|works cited|参\s*考\s*文\s*献)\s*$/gim
  const UNSUFFIXED_YEAR_REASON = '文末条目未标注该年份后缀，请核对候选。'
  const NUMBER_PREFIX = /^(?:[\[［]\s*[0-9０-９]{1,3}\s*[\]］]|\d{1,3}[.)](?=\s|$))/
  const BRACKET_CITATIONS = /[\[［]\s*([0-9０-９]{1,3}(?:\s*[-–—−－,，;；]\s*[0-9０-９]{1,3})*)\s*[\]］]/g

  function compact(value) { return String(value || '').replace(/\s+/g, ' ').trim() }
  function keyOf(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s\u00ad\-‐‑–—−'’]/g, '')
  }
  function keyMap(value) {
    let key = ''
    const map = []
    const raw = String(value || '')
    for (let i = 0; i < raw.length; i += 1) {
      const part = raw[i].normalize('NFKD').replace(/[\u0300-\u036f\s\u00ad\-‐‑–—−'’]/g, '').toLowerCase()
      for (const char of part) { key += char; map.push(i) }
    }
    return { key, map }
  }
  function stableId(prefix, value) {
    let hash = 2166136261
    for (const char of String(value || '')) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
    return prefix + '-' + (hash >>> 0).toString(36)
  }
  function cleanDoi(raw) {
    const readable = String(raw || '').replace(/[\u200b\u200c\u200d\u2060\ufeff\u00ad]/g, '')
    const hit = readable.match(/10\.\d{4,9}\/[^\s<>"]+/i)
    if (!hit) return ''
    const after = readable.slice(hit.index + hit[0].length)
    if (/^\s+\d/.test(after) && !/[.,;]$/.test(hit[0]) || /[-_/=?#&%]$/.test(hit[0]) && /^\s+[A-Za-z0-9_%./?#=&-]+(?:\s|$)/.test(after)) return ''
    let doi = hit[0].replace(/[.,;:]+$/, '')
    while ((doi.endsWith(')') && (doi.match(/\)/g) || []).length > (doi.match(/\(/g) || []).length) || doi.endsWith(']')) doi = doi.slice(0, -1)
    return doi
  }
  function stripNumber(raw) { return compact(raw).replace(NUMBER_PREFIX, '').trimStart() }
  function referenceCardNumber(reference) {
    const entry = reference || {}, raw = String(entry.raw || entry.text || '').trim(), found = raw.match(NUMBER_PREFIX)
    return found && entry.number && Number(found[0].normalize('NFKC').replace(/\D/g, '')) === Number(entry.number) ? found[0] : entry.number ? entry.label || '[' + entry.number + ']' : ''
  }
  function referenceCardText(reference) {
    const entry = reference || {}, raw = String(entry.raw || entry.text || entry.quote || '').trim(), marker = referenceCardNumber(entry)
    return raw ? marker && raw.startsWith(marker) ? raw.slice(marker.length).trimStart() : raw : compact(entry.title) || '引用内容暂缺'
  }
  function referenceLinks(value) {
    const entry = value || {}, raw = String(entry.raw || entry.text || ''), links = []
    const supplied = (Array.isArray(entry.links) ? entry.links : []).filter(link => link && typeof link === 'object')
    const denied = link => link.verified === false || link.confirmed === false || /^(?:unverified|unconfirmed|rejected|invalid|not-found)$/i.test(String(link.verificationStatus || link.linkVerificationStatus || ''))
    const confirmed = link => !denied(link) && (link.verified === true || link.confirmed === true || /^(?:verified|confirmed)$/i.test(String(link.verificationStatus || link.linkVerificationStatus || '')))
    const cleanUrl = value => {
      let url = String(value || '').trim().replace(/[.,;:]+$/, '')
      while ((url.endsWith(')') && (url.match(/\)/g) || []).length > (url.match(/\(/g) || []).length) || url.endsWith(']')) url = url.slice(0, -1)
      return /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}(?::\d+)?(?:[/?#][^\s<>"\u0000-\u001f]*)?$/i.test(url) ? url : ''
    }
    const search = (url, link) => /search|query|lookup/i.test(String(link && (link.kind || link.origin) || '')) || /^https?:\/\/(?:(?:(?:www|scholar)\.)?google\.[^/]+\/(?:search|scholar)|(?:www\.)?bing\.com\/search|(?:www\.)?duckduckgo\.com\/?\?)/i.test(url)
    const blocked = new Set(supplied.filter(denied).map(link => cleanUrl(link.url || link.href)).filter(Boolean))
    if (entry.urlVerified === false && entry.url) blocked.add(cleanUrl(entry.url))
    if (entry.doiVerified === false && entry.doi) blocked.add('https://doi.org/' + encodeURIComponent(cleanDoi(entry.doi)).replace(/%2F/gi, '/'))
    const add = (kind, label, value, origin, identityEvidence) => { const url = cleanUrl(value); if (url && !blocked.has(url) && !search(url) && !links.some(link => link.url === url)) links.push({ kind, label, url, origin: origin || 'reference-entry', identityEvidence: identityEvidence || 'extracted', ...(identityEvidence === 'confirmed' ? { confirmed: true } : {}), availabilityVerified: false }) }
    const rawDoi = cleanDoi(raw), doi = rawDoi || (entry.doiVerified === true || confirmed(entry) ? cleanDoi(entry.doi) : '')
    if (doi) add('doi', 'DOI 出版页', 'https://doi.org/' + encodeURIComponent(doi).replace(/%2F/gi, '/'), rawDoi ? 'reference-entry' : 'confirmed-metadata', rawDoi ? 'extracted' : 'confirmed')
    const arxivPattern = /\barxiv(?:\.org\/(?:abs|pdf)\/|:\s*)(\d{4}\.\d{4,5}(?:v\d+)?|[a-z-]+(?:\.[A-Z]{2})?\/\d{7}(?:v\d+)?)/i
    const rawArxiv = raw.match(arxivPattern), metadataArxiv = entry.arxivVerified === true || confirmed(entry) ? String(entry.arxiv || '').match(/^(\d{4}\.\d{4,5}(?:v\d+)?|[a-z-]+(?:\.[A-Z]{2})?\/\d{7}(?:v\d+)?)$/i) : null
    const arxiv = rawArxiv || metadataArxiv
    if (arxiv) add('arxiv', 'arXiv 原文页', 'https://arxiv.org/abs/' + arxiv[1], rawArxiv ? 'reference-entry' : 'confirmed-metadata', rawArxiv ? 'extracted' : 'confirmed')
    const candidates = []
    if (entry.urlVerified === true || confirmed(entry)) for (const url of [entry.url, ...(Array.isArray(entry.urls) ? entry.urls : [])].filter(Boolean)) candidates.push({ url, origin: 'confirmed-metadata', identityEvidence: 'confirmed' })
    for (const link of supplied) if (confirmed(link) && !search(link.url || link.href || '', link)) candidates.push({ url: link.url || link.href, kind: link.kind, origin: 'confirmed-metadata', identityEvidence: 'confirmed' })
    const original = raw.replace(/[\u200b\u200c\u200d\u2060\ufeff\u00ad]/g, '').replace(/(https?):\s*\/\//gi, '$1://')
    for (const match of original.matchAll(/https?:\/\/[^\s<>"]+/gi)) {
      // Broken OCR hosts are not repaired into an invented URL.
      if (/^\s+\./.test(original.slice(match.index + match[0].length))) continue
      if (/\/$/.test(match[0]) && /^\s+[a-z0-9_%.-]+[/?#&=\-]/i.test(original.slice(match.index + match[0].length))) continue
      if (/[-_/=?#&%]$/.test(match[0]) && /^\s+[A-Za-z0-9_%./?#=&-]+(?:\s|$)/.test(original.slice(match.index + match[0].length))) continue
      candidates.push({ url: match[0], origin: 'reference-entry' })
    }
    for (const candidate of candidates) {
      const url = cleanUrl(candidate.url)
      if (!url) continue
      if (/^https?:\/\/(?:dx\.)?doi\.org\//i.test(url) && !cleanDoi(url)) continue
      if (/^https?:\/\/(?:dx\.)?doi\.org\//i.test(url) && (doi || candidate.origin === 'reference-entry')) continue
      if (/^https?:\/\/arxiv\.org\/(?:abs|pdf)\//i.test(url) && arxiv) continue
      const kind = candidate.kind === 'doi' && cleanDoi(url) ? 'doi' : candidate.kind === 'arxiv' && arxivPattern.test(url) ? 'arxiv' : 'original-url'
      add(kind, kind === 'doi' ? 'DOI 出版页' : kind === 'arxiv' ? 'arXiv 原文页' : '原条目链接', url, candidate.origin, candidate.identityEvidence)
    }
    return links.slice(0, 5)
  }
  function referenceDetails(value) {
    const entry = value || {}, raw = stripNumber(entry.raw || entry.text), rawKey = keyOf(raw)
    const year = /^(?:19|20)\d{2}[a-z]?$/.test(String(entry.year || '')) ? String(entry.year) : (raw.match(/\b(?:19|20)\d{2}[a-z]?\b/) || [''])[0]
    const providedTitle = compact(entry.title)
    const providedAuthors = compact(Array.isArray(entry.authors) ? entry.authors.map((item) => typeof item === 'string' ? item : item.name || '').join(', ') : entry.authors)
    if (providedTitle.length >= 5 && providedTitle.length < raw.length * .85 && rawKey.includes(keyOf(providedTitle))) return { authors: providedAuthors && rawKey.includes(keyOf(providedAuthors)) ? providedAuthors : '', title: providedTitle, publication: compact(entry.publication || entry.venue), year, parseStatus: 'parsed', basis: '原条目中可核对的结构字段' }
    let authors = '', tail = '', basis = '', title = '', publication = ''
    const quoted = raw.match(/[“"]([^”"]{8,700})[”"]/)
    if (quoted && quoted.index > 2 && quoted.index < 800) {
      authors = raw.slice(0, quoted.index).replace(/[,，.\s]+$/, '')
      title = quoted[1].replace(/[,，]+$/, '').trim()
      publication = raw.slice(quoted.index + quoted[0].length).replace(/^[,，.\s]+/, '')
      basis = '原文引号界定题名'
    } else {
      const acm = raw.match(/^(.{3,1200}?)\.\s*((?:19|20)\d{2}[a-z]?)\.\s+(.+)$/)
      const apa = raw.match(/^(.{3,1200}?)\s*\(((?:19|20)\d{2}[a-z]?)\)\.\s*(.+)$/)
      const plainYear = raw.match(/^(.{3,1200}?)\s+\(((?:19|20)\d{2}[a-z]?)\)\s+(.+)$/)
      const webDate = raw.match(/^(.{2,800}?)\.\s*\(((?:19|20)\d{2}),\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?(?:\s+\d{1,2})?\)\s+(.+)$/i)
      const plainAuthors = plainYear && /^(?:[\p{L}'’\-]+\s+(?:[A-Z]{1,5}|(?:[A-Z]\.){1,5})(?:\s*[,，]\s*|\s+(?:and|&)\s*|$)){1,40}$/u.test(plainYear[1].trim().replace(/\s+et\s+al\.?$/i, ''))
      const colon = raw.indexOf(':')
      const colonPrefix = colon > 0 ? raw.slice(0, colon).trim() : ''
      const authorColon = /(?:[A-Z]\.|et\s+al\.?)$/i.test(colonPrefix) || /^(?:[A-Z][A-Z0-9&.\-]{1,30}|[A-Z][a-z]+[A-Z][A-Za-z]*)$/.test(colonPrefix) || /(?:Organization|University|Institute|Agency|Centre|Center|Office|Service|Council|Administration|Group|Committee|Corporation)$/.test(colonPrefix)
      if (webDate) { authors = webDate[1]; tail = webDate[3]; basis = '原条目作者及年月后的题名' }
      else if (acm) { authors = acm[1]; tail = acm[3]; basis = '作者—年份—题名格式' }
      else if (colon > 1 && colon < 1000 && authorColon) { authors = colonPrefix; tail = raw.slice(colon + 1).trim(); basis = '作者冒号后的原文题名' }
      else if (apa) { authors = apa[1].replace(/[.\s]+$/, ''); tail = apa[3]; basis = '作者（年份）题名格式' }
      else if (plainAuthors) { authors = plainYear[1]; tail = plainYear[3]; basis = '姓氏缩写作者（年份）后原文题名' }
      else {
        const gbt = raw.match(/[\[［](?:J|M|D|C|R|S|P|N|EB|DB|CP)(?:[/／]OL)?[\]］]/i)
        if (gbt) {
          const prefix = raw.slice(0, gbt.index)
          const authorEnd = /\bet\s+al\./i.exec(prefix)
          const point = authorEnd ? authorEnd.index + authorEnd[0].length - 1 : prefix.indexOf('.')
          if (point > 1) { authors = prefix.slice(0, point); title = prefix.slice(point + 1).trim(); publication = raw.slice(gbt.index); basis = '文献类型标记前的原文题名' }
        }
        if (!title) {
          const initials = raw.match(/^((?:[\p{L}'’\-]+,\s*(?:[A-Z]\.\s*){1,4}(?:[,;]\s*|\s+(?:and|&)\s*)?)+)\s*(.+)$/u)
          if (initials) { authors = initials[1].replace(/[,;\s]+$/, ''); tail = initials[2]; basis = '姓氏与缩写作者后的原文题名' }
        }
      }
      if (tail) {
        const boundary = Array.from(tail.matchAll(/[.?!]\s+(?=[\p{L}[(])/gu)).find((hit) => hit[0][0] !== '.' || !/(?:\b(?:e\.g|i\.e|vs|etc|fig|eq|no|vol|dr|prof|inc|jr|sr)|\b[A-Z]|(?:[A-Z]\.)+[A-Z])$/i.test(tail.slice(0, hit.index)))
        if (boundary) { title = tail.slice(0, boundary.index + (boundary[0][0] === '.' ? 0 : 1)); publication = tail.slice(boundary.index + 1).trim() }
        else {
          const finalYear = tail.match(/\s+\((?:19|20)\d{2}[a-z]?\)(?:[.,]|$)/)
          if (finalYear) { title = tail.slice(0, finalYear.index); publication = tail.slice(finalYear.index).trim() }
        }
      }
    }
    title = compact(title).replace(/\u00ad\s*/g, '').replace(/[.。]+$/, '')
    authors = compact(authors).replace(/[,，;；\s]+$/, '')
    publication = compact(publication).replace(/[\u200b\u200c\u200d\u2060\ufeff]/g, '').replace(/\s*(?:https?:|doi\s*:|arxiv\s*:).*$/i, '').trim()
    const reliable = title.length >= 5 && title.length <= 700 && title.length < raw.length * .9 && authors.length > 1 && !/^https?:|^doi:|^arxiv:/i.test(title)
    return reliable ? { authors, title, publication, year, parseStatus: 'parsed', basis } : { authors: '', title: '', publication: '', year, parseStatus: 'unparsed', basis: '条目格式未可靠拆分，保留完整原文' }
  }
  function expandYears(raw) {
    const parts = String(raw || '').replace(/，/g, ',').split(',').map((part) => part.trim()).filter(Boolean)
    const out = []
    let previous = ''
    for (const part of parts) {
      if (/^(?:19|20)\d{2}[a-z]?$/.test(part)) { previous = part; out.push(part) }
      else if (/^[a-z]$/.test(part) && previous) out.push(previous.slice(0, 4) + part)
    }
    return Array.from(new Set(out))
  }
  function firstAuthor(raw) {
    const text = stripNumber(raw)
    const surnameInitials = text.match(/^([\p{L}'’\-]+)\s+[A-Z]{1,5}(?=\s*(?:[,，]|\((?:19|20)\d{2}))/u)
    if (surnameInitials) return { display: surnameInitials[1], key: keyOf(surnameInitials[1]), basis: 'surname-initials' }
    let match = text.match(/^([\p{L}'’\-]+(?:\s+[\p{L}'’\-]+){0,2}),\s*(?:[A-Z]\.?\b|[A-Z]\.)/u)
    if (match) return { display: match[1], key: keyOf(match[1]), basis: 'surname-first' }
    match = text.match(/^([A-Z][A-Za-z0-9&.\-]{1,30}):/) || text.match(/^([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*){0,4}\s+(?:Organization|University|Institute|Agency|Centre|Center|Office|Service|Council|Administration|Group|Committee|Corporation)):/)
    if (match) return { display: match[1], key: keyOf(match[1]), basis: 'corporate' }
    match = text.match(/^([\p{Script=Han}]{2,4})(?:[,，、]|等|\s)/u)
    if (match) return { display: match[1], key: keyOf(match[1]), basis: 'cjk' }
    const authorPart = text.split(/\s+(?:and|&)\s+|,(?!\s*[A-Z]\.)/i)[0].split(/\.\s+(?=(?:19|20)\d{2})/)[0]
    const tokens = authorPart.match(/[\p{L}'’\-]+/gu) || []
    if (tokens.length >= 2 && tokens.length <= 5 && /^[A-Z]/.test(tokens[0])) {
      const family = tokens[tokens.length - 1]
      if (family.length > 1 && !/^(al|jr|sr)$/i.test(family)) return { display: family, key: keyOf(family), basis: 'given-name-first' }
    }
    match = text.match(/^([A-Z][A-Za-z0-9&\-]{1,25})[.,:]?\s*\(?((?:19|20)\d{2})/)
    return match ? { display: match[1], key: keyOf(match[1]), basis: 'single-author-token' } : { display: '', key: '', basis: 'unavailable' }
  }

  function bibliographyRegions(paperText, structure) {
    const text = String(paperText || '')
    const headings = Array.from(text.matchAll(HEADING))
    const sectionHeads = (structure && structure.sections || []).map((section) => compact(section.heading)).filter((heading) => heading && !/^(references|bibliography|参考文献)/i.test(heading))
    return headings.map((heading, index) => {
      const start = heading.index
      const contentStart = start + heading[0].length
      let end = index + 1 < headings.length ? headings[index + 1].index : text.length
      const tail = text.slice(contentStart, end)
      const explicit = tail.match(/^\s*(?:Appendix(?:\s+[A-Z])?\b[^\n]*|Supplementary(?:\s+(?:material|information|appendix))\b[^\n]*|附录[^\n]*)$/im)
      if (explicit) end = contentStart + explicit.index
      for (const title of sectionHeads) {
        const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const next = text.slice(contentStart, end).match(new RegExp('^\\s*' + escaped + '\\s*$', 'm'))
        if (next) end = Math.min(end, contentStart + next.index)
      }
      return { start, contentStart, end }
    }).filter((region) => region.end > region.contentStart)
  }

  function splitReferenceBlock(raw) {
    const lines = String(raw || '').split(/\r?\n/)
    const entries = []
    let current = []
    function push() { const value = compact(current.join(' ')); if (value.length >= 20) entries.push({ raw: value }); current = [] }
    for (const line of lines) {
      const value = line.trim()
      if (!value || /^\d{1,3}$/.test(value) || /^(?:references|bibliography|参考文献)$/i.test(value)) continue
      const numbered = NUMBER_PREFIX.test(value) && !!stripNumber(value)
      const named = /^[\p{L}'’\-]+(?:\s+[\p{L}'’\-]+){0,2},\s*[A-Z]\./u.test(value) || /^(?:[A-Z][A-Z0-9&.\-]{1,30}|[A-Z][a-z]+[A-Z][A-Za-z]*):\s*\S/.test(value) || /^[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*){0,4}\s+(?:Organization|University|Institute|Agency|Centre|Center|Office|Service|Council|Administration|Group|Committee|Corporation):/.test(value)
      if (numbered || (named && !/[,，]$/.test(current[current.length - 1] || ''))) { if (current.length) push(); current.push(value) }
      else if (current.length) current.push(value)
    }
    if (current.length) push()
    return entries
  }

  function parseReferences(rawOrStructure, paperText) {
    let entries = []
    let origin = 'structure'
    if (Array.isArray(rawOrStructure)) entries = rawOrStructure
    else if (rawOrStructure && Array.isArray(rawOrStructure.references)) entries = rawOrStructure.references
    else if (typeof rawOrStructure === 'string') { entries = splitReferenceBlock(rawOrStructure); origin = 'text-fallback' }
    if (!entries.length && paperText) {
      const regions = bibliographyRegions(paperText, rawOrStructure)
      entries = regions.flatMap((region) => splitReferenceBlock(paperText.slice(region.contentStart, region.end)))
      origin = 'text-fallback'
    }
    const out = []
    const seen = new Set()
    const usedIds = new Set()
    for (const [order, entry] of entries.entries()) {
      const value = typeof entry === 'string' ? { raw: entry } : entry
      if (!value || typeof value !== 'object') continue
      const originalRaw = String(value.raw || value.text || value.quote || '').trim(), raw = compact(originalRaw)
      if (!raw || origin === 'text-fallback' && raw.length < 16) continue
      const rawKey = keyOf(raw)
      const anchor = value.anchor || null
      const place = value.id || (value.page != null ? 'page-' + value.page : anchor && anchor.page != null ? 'page-' + anchor.page : '')
      const seenKey = rawKey + '/' + place
      if (seen.has(seenKey)) continue
      seen.add(seenKey)
      const numberMatch = raw.match(NUMBER_PREFIX)
      const rawNumber = numberMatch?.[0].normalize('NFKC').replace(/\D/g, '') || ''
      const explicitNumber = value.number != null && /^\d{1,3}$/.test(String(value.number)) ? String(Number(value.number)) : ''
      const number = rawNumber ? String(Number(rawNumber)) : explicitNumber
      const code = value.segmentation === 'alphanumeric' ? raw.match(/^\[[A-Za-z]{1,8}\d{1,4}[a-z]?\]/)?.[0] : null
      const years = raw.match(/\b(?:19|20)\d{2}[a-z]?\b/g) || []
      const providedYear = String(value.year || '').trim()
      const year = /^(?:19|20)\d{2}[a-z]?$/.test(providedYear) ? providedYear : years[0] || ''
      const author = firstAuthor(raw)
      const baseId = String(value.id || stableId('ref', rawKey + '/' + place))
      const id = usedIds.has(baseId) ? baseId + '-' + order : baseId
      usedIds.add(id)
      const doi = cleanDoi(raw) || (value.doiVerified === true || value.verified === true ? cleanDoi(value.doi) : '')
      const displayNumber = rawNumber || number
      const details = referenceDetails({ ...value, raw, year })
      out.push({ id, order, number, label: code || (displayNumber ? '[' + displayNumber + ']' : (author.display || '未识别作者') + (year ? ' · ' + year : '')), ...(code ? { code: code.toLowerCase(), segmentation: 'alphanumeric' } : {}), raw: originalRaw, year, author, doi, ...details, links: referenceLinks({ ...value, raw: originalRaw, doi }), page: value.page != null ? value.page : anchor && anchor.page, bbox: value.bbox || null, anchor, segmentationConfidence: value.segmentationConfidence || '', origin })
    }
    const rawGroups = new Map()
    for (const reference of out) { const key = keyOf(reference.raw); if (!rawGroups.has(key)) rawGroups.set(key, []); rawGroups.get(key).push(reference.id) }
    for (const reference of out) reference.duplicateIds = (rawGroups.get(keyOf(reference.raw)) || []).filter((id) => id !== reference.id)
    return out
  }

  function expandNumbers(raw) {
    const out = []
    for (const part of String(raw || '').split(/[,，;；]/)) {
      const range = part.trim().match(/^(\d{1,3})\s*[-–—−－]\s*(\d{1,3})$/)
      if (range) {
        const a = Number(range[1]), b = Number(range[2])
        if (a < 1 || b < a || b - a > 30) return null
        for (let number = a; number <= b; number += 1) out.push(String(number))
      } else if (/^\s*\d{1,3}\s*$/.test(part)) {
        const number = Number(part)
        if (number < 1) return null
        out.push(String(number))
      } else return null
    }
    return out.length <= 60 ? Array.from(new Set(out)) : null
  }

  function citationFamily(authorText) {
    const clean = compact(authorText).replace(/^[,，:\s]+/, '').replace(/^(?:see|cf\.?|e\.?g\.?|compare|参见|见)\s*[,，:]?\s*/i, '').replace(/[,，:\s]+$/, '')
    if (!clean || clean.length > 110 || /[\d=+*/^<>≤≥]/.test(clean)) return null
    const first = clean.replace(/\s+et\s+al\.?$/i, '').replace(/等$/, '').split(/[,，]|\s+(?:and|&)\s+/i)[0].trim()
    if (!/^(?:[A-ZÀ-ÖØ-Þ][\p{L}'’\-]+(?:\s+[\p{L}'’\-]+){0,2}|[\p{Script=Han}]{2,4})$/u.test(first)) return null
    return { key: keyOf(first), display: first, full: clean }
  }

  function citationContext(text, start, end) {
    const previous = text.lastIndexOf('\n\n', start)
    const next = text.indexOf('\n\n', end)
    let from = Math.max(previous < 0 ? 0 : previous + 2, start - 130)
    let to = Math.min(next < 0 ? text.length : next, end + 160)
    // Avoid cutting through a word at the edges of the locator's continuous quote.
    while (from > 0 && from < start && /[\p{L}\p{N}]/u.test(text[from - 1])) from -= 1
    while (to < text.length && to > end && /[\p{L}\p{N}]/u.test(text[to])) to += 1
    return text.slice(from, to).trim()
  }

  function findParagraph(context, structure, prepared) {
    const key = keyOf(context)
    if (key.length < 20) return null
    const matches = []
    const candidates = prepared || (structure && structure.sections || []).flatMap((section) => (section.paragraphs || []).map((paragraph) => ({ paragraph, key: keyOf(paragraph.text || paragraph.quote || '') })))
    for (const item of candidates) {
      if (item.key.length >= 20 && (item.key.includes(key) || key.includes(item.key))) matches.push(item.paragraph)
    }
    return matches.length === 1 ? matches[0] : null
  }

  function buildIndex(paperText, structure) {
    const text = String(paperText || '')
    const references = parseReferences(structure, text)
    const regions = bibliographyRegions(text, structure)
    const paragraphIndex = (structure && structure.sections || []).flatMap((section) => (section.paragraphs || []).map((paragraph) => ({ paragraph, key: keyOf(paragraph.text || paragraph.quote || '') })))
    const byNumber = new Map(), byAuthorYear = new Map(), byCode = new Map()
    for (const reference of references) {
      if (reference.number) { if (!byNumber.has(reference.number)) byNumber.set(reference.number, []); byNumber.get(reference.number).push(reference) }
      if (reference.code) { if (!byCode.has(reference.code)) byCode.set(reference.code, []); byCode.get(reference.code).push(reference) }
      if (reference.author.key && reference.year) {
        const key = reference.author.key + '/' + reference.year
        if (!byAuthorYear.has(key)) byAuthorYear.set(key, [])
        byAuthorYear.get(key).push(reference)
      }
    }
    // Also mask exact reference entries when an OCR/import loses the bibliography
    // heading. Their own [n] and publication year are never body citations.
    const sourceMap = keyMap(text)
    for (const reference of references) {
      const referenceKey = keyOf(reference.raw)
      if (referenceKey.length < 30) continue
      let position = sourceMap.key.indexOf(referenceKey)
      while (position >= 0) {
        regions.push({ start: sourceMap.map[position], end: sourceMap.map[position + referenceKey.length - 1] + 1 })
        position = sourceMap.key.indexOf(referenceKey, position + referenceKey.length)
      }
    }
    const inBibliography = (start) => regions.some((region) => start >= region.start && start < region.end)
    const citations = []
    const occupied = []
    const seen = new Set()
    function target(label, candidates, basis, unverifiedYearSuffix = false) {
      const needsVerification = unverifiedYearSuffix || (candidates.length === 1 && candidates[0].segmentationConfidence === 'low')
      const repeatedLocations = !unverifiedYearSuffix && candidates.length > 1 && candidates.every((reference) => keyOf(reference.raw) === keyOf(candidates[0].raw))
      const status = candidates.length === 1 && !needsVerification ? 'matched' : candidates.length ? 'ambiguous' : 'unmatched'
      return {
        label, referenceIds: candidates.map((reference) => reference.id), status, needsVerification, repeatedLocations,
        ...(unverifiedYearSuffix ? { unverifiedYearSuffix } : {}),
        basis: unverifiedYearSuffix ? UNSUFFIXED_YEAR_REASON : needsVerification ? '参考文献条目分组置信度低，需在原文核对' : repeatedLocations ? '同一原始引用在多个参考文献位置出现，请选择位置' : status === 'matched' ? basis : status === 'ambiguous' ? '同一编号或作者年份对应多条文献，未自动选择' : '参考文献中没有可核对的对应条目',
      }
    }
    function authorYearTarget(family, year, basis) {
      const label = family.display + ' ' + year
      const exact = byAuthorYear.get(family.key + '/' + year) || []
      if (/[a-z]$/.test(year)) {
        if (exact.length) return target(label, exact, basis)
        const unsuffixed = byAuthorYear.get(family.key + '/' + year.slice(0, 4)) || []
        return target(label, unsuffixed, basis, unsuffixed.length > 0)
      }
      const sameYear = references.filter((reference) => reference.author.key === family.key && reference.year.slice(0, 4) === year)
      return target(label, sameYear.length > exact.length ? sameYear : exact, basis)
    }
    function add(start, end, raw, style, targets) {
      if (inBibliography(start) || !targets.length) return
      const unique = start + ':' + end + ':' + targets.map((item) => item.label).join('|')
      if (seen.has(unique)) return
      seen.add(unique)
      const context = citationContext(text, start, end)
      const paragraph = findParagraph(context, null, paragraphIndex)
      const status = targets.every((item) => item.status === 'matched') ? 'matched' : targets.some((item) => item.status === 'ambiguous') ? 'ambiguous' : 'unmatched'
      citations.push({ id: stableId('cite', unique), raw: compact(raw), style, start, end, context, status, targets, referenceIds: Array.from(new Set(targets.flatMap((item) => item.referenceIds))), anchor: paragraph && paragraph.anchor || null, page: paragraph && paragraph.page, paragraphId: paragraph && paragraph.id || null })
      occupied.push({ start, end })
    }
    for (const match of text.matchAll(BRACKET_CITATIONS)) {
      if (inBibliography(match.index)) continue
      const before = text.slice(Math.max(0, match.index - 50), match.index)
      const previous = text[match.index - 1] || ''
      const after = text.slice(match.index + match[0].length, match.index + match[0].length + 4)
      if (/[\p{L}\p{N}_]/u.test(previous) && !/\p{Script=Han}/u.test(previous)) continue
      if (/[=+*/^＝]$/.test(before.trim()) || /^\s*[=＝]/.test(after)) continue
      if (/\b(?:vector|matrix|tensor|indices|index|array|shape|coordinates?|equation|eq\.?)[^.!?\n]{0,28}$/i.test(before)) continue
      if (/(?:数组|矩阵|张量|向量|下标|索引|维度|坐标|公式|方程)\s*$/.test(before)) continue
      const numbers = expandNumbers(match[1].normalize('NFKC'))
      if (!numbers) continue
      add(match.index, match.index + match[0].length, match[0], 'numeric', numbers.map((number) => target('[' + number + ']', byNumber.get(number) || [], '原文引文编号与参考文献编号一致')))
    }
    if (byCode.size) for (const match of text.matchAll(/\[[A-Za-z]{1,8}\d{1,4}[a-z]?\]/g)) {
      const candidates = byCode.get(match[0].toLowerCase())
      if (!candidates?.length) continue
      add(match.index, match.index + match[0].length, match[0], 'alphanumeric', [target(match[0], candidates, '原文引文标识与参考文献一致')])
    }
    for (const group of text.matchAll(/[[(（]([^\])）]{3,480})[\])）]/g)) {
      if (inBibliography(group.index)) continue
      const inner = group[1]
      const targets = []
      for (const clause of inner.split(/[;；]/)) {
        let cursor = 0
        for (const yearMatch of clause.matchAll(new RegExp(YEAR_LIST, 'g'))) {
          const family = citationFamily(clause.slice(cursor, yearMatch.index))
          cursor = yearMatch.index + yearMatch[0].length
          if (!family) continue
          for (const year of expandYears(yearMatch[0])) targets.push(authorYearTarget(family, year, '作者首姓与年份（含后缀）一致'))
        }
      }
      add(group.index, group.index + group[0].length, group[0], 'author-year', targets)
    }
    const narrative = new RegExp("([A-ZÀ-ÖØ-Þ][\\p{L}'’\\-]+(?:\\s+(?:et\\s+al\\.?|and\\s+[A-ZÀ-ÖØ-Þ][\\p{L}'’\\-]+|&\\s*[A-ZÀ-ÖØ-Þ][\\p{L}'’\\-]+))?)\\s*\\(\\s*(" + YEAR_LIST + ")\\s*\\)", 'gu')
    for (const match of text.matchAll(narrative)) {
      if (occupied.some((entry) => match.index >= entry.start && match.index < entry.end)) continue
      const family = citationFamily(match[1])
      if (!family) continue
      const targets = expandYears(match[2]).map((year) => authorYearTarget(family, year, '叙述式作者首姓与年份一致'))
      add(match.index, match.index + match[0].length, match[0], 'author-year', targets)
    }
    citations.sort((a, b) => a.start - b.start)
    const occurrences = Object.create(null)
    for (const reference of references) occurrences[reference.id] = []
    for (const citation of citations) {
      for (const item of citation.targets) {
        if (item.status !== 'matched' && !item.repeatedLocations) continue
        for (const id of item.referenceIds) if (!occurrences[id].includes(citation.id)) occurrences[id].push(citation.id)
      }
    }
    return { references, citations, occurrences, stats: { references: references.length, citations: citations.length, matched: citations.filter((item) => item.status === 'matched').length, unmatched: citations.filter((item) => item.status === 'unmatched').length, ambiguous: citations.filter((item) => item.status === 'ambiguous').length }, warnings: [!references.length ? '尚未提取到参考文献，请先解析章节或核对文献的参考文献区。' : '', references.some((item) => item.origin === 'text-fallback') ? '部分参考文献来自文本拆分；只对能核对编号或作者年份的条目建立对应。' : '', references.some((item) => item.duplicateIds.length) ? '相同原始引用在不同位置重复出现时分别保留；正文关系可共享，但具体文末位置需选择。' : '', '未识别的上标引用、图片文字、公式索引及不完整作者信息不会自动关联。'].filter(Boolean) }
  }

  function normalizeState(value, paperId) {
    const id = String(paperId || '')
    const input = value && typeof value === 'object' && (!value.paperId || value.paperId === id) && (!value.documentId || value.documentId === id) ? value : {}
    const ids = (raw) => Array.from(new Set((Array.isArray(raw) ? raw : []).filter((item) => typeof item === 'string'))).slice(0, 600)
    return { paperId: id, view: input.view === 'citations' ? 'citations' : 'references', query: String(input.query || '').slice(0, 300), filter: ['matched', 'unmatched', 'ambiguous'].includes(input.filter) ? input.filter : 'all', expandedIds: ids(input.expandedIds), occurrenceIds: ids(input.occurrenceIds), selectedReferenceId: typeof input.selectedReferenceId === 'string' ? input.selectedReferenceId : null, selectedCitationId: typeof input.selectedCitationId === 'string' ? input.selectedCitationId : null, detailReferenceId: typeof input.detailReferenceId === 'string' ? input.detailReferenceId : null, detailOccurrenceIndex: Number.isFinite(input.detailOccurrenceIndex) ? Math.max(0, Math.min(10000, Math.floor(input.detailOccurrenceIndex))) : 0, scrollTop: Number.isFinite(input.scrollTop) ? Math.max(0, Math.min(10000000, input.scrollTop)) : 0 }
  }

  function resolveActiveReference(index, active, paperId) {
    if (!active || typeof active !== 'object') return { status: 'none', referenceIds: [], reason: '' }
    if (active.documentId && paperId && active.documentId !== paperId) return { status: 'mismatched-document', referenceIds: [], reason: '该引用来自另一篇文献，未在本篇中选中条目。' }
    const references = index && index.references || []
    let candidates = []
    let unverifiedYearSuffix = false
    if (active.referenceId) candidates = references.filter((reference) => reference.id === active.referenceId)
    else if (/^\[[A-Za-z]{1,8}\d{1,4}[a-z]?\]$/.test(compact(active.quote))) candidates = references.filter(reference => reference.code === compact(active.quote).toLowerCase())
    else {
      let numbers = active.number != null ? expandNumbers(String(active.number).normalize('NFKC').replace(/^\[|\]$/g, '')) : null
      if (!numbers) { const bracket = compact(active.quote).normalize('NFKC').match(/^\[\s*(\d{1,3}(?:\s*[-–—−－,，;；]\s*\d{1,3})*)\s*\]$/); if (bracket) numbers = expandNumbers(bracket[1]) }
      if (numbers) candidates = references.filter((reference) => numbers.includes(reference.number))
      else if (active.quote && /(?:19|20)\d{2}/.test(active.quote)) {
        const probe = buildIndex(String(active.quote), { references })
        const ids = new Set(probe.citations.flatMap((citation) => citation.referenceIds))
        candidates = references.filter((reference) => ids.has(reference.id))
        unverifiedYearSuffix = probe.citations.some((citation) => citation.targets.some((item) => item.unverifiedYearSuffix))
      }
    }
    const low = candidates.length === 1 && candidates[0].segmentationConfidence === 'low'
    const status = candidates.length === 1 && !low && !unverifiedYearSuffix ? 'matched' : candidates.length ? 'ambiguous' : 'unmatched'
    return { status, referenceIds: candidates.map((reference) => reference.id), reason: unverifiedYearSuffix ? UNSUFFIXED_YEAR_REASON : status === 'matched' ? '已对应本篇参考文献条目。' : low ? '条目分组尚不可靠，请核对原始引用。' : status === 'ambiguous' ? '对应多条候选或多个原文位置，请选择具体条目。' : '本篇参考文献中没有找到可核对的对应条目。' }
  }

  function referenceDestination(reference) {
    const entry = reference || {}, built = referenceLinks(entry)
    const candidates = Array.isArray(entry.links) ? built.filter(link => entry.links.some(given => given && (given.url || given.href) === link.url && given.verified !== false && given.confirmed !== false && !/search|query|lookup/i.test(String(given.kind || given.origin || '')))) : built
    const reliable = candidates.find(link => ['doi', 'arxiv', 'original-url'].includes(link.kind) && ['extracted', 'confirmed'].includes(link.identityEvidence))
    return reliable ? { ...reliable, label: '跳转文献' } : null
  }

  function referenceLocations(index, reference) {
    if (!reference) return []
    const citations = new Map((index && index.citations || []).map((citation) => [citation.id, citation]))
    const body = (index && index.occurrences && index.occurrences[reference.id] || []).map((id) => citations.get(id)).filter(Boolean).map((citation) => ({ id: citation.id, kind: 'citation', quote: citation.context, page: citation.page, anchor: citation.anchor || null, label: '正文引用', marker: citation.raw }))
    if (body.length) return body
    return [{ id: reference.id, kind: 'reference', quote: reference.anchor && reference.anchor.quote || reference.raw, page: reference.page, bbox: reference.bbox || null, anchor: reference.anchor || null, label: '文末参考文献', fallback: true }]
  }

  function create(React) {
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React
    function Icon(props) { const paths = { close: ['M5 5l10 10M15 5 5 15'], copy: ['M7 6V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2', 'M4 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z'], left: ['m12 4-6 6 6 6'], right: ['m8 4 6 6-6 6'], external: ['M11 3h6v6M17 3l-9 9', 'M8 4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3'], locate: ['M10 2v3M10 15v3M2 10h3M15 10h3', 'M15 10a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z'] }; return h('svg', { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, ...(paths[props.name] || []).map((d, i) => h('path', { key: i, d }))) }
    function Component(props) {
      const paperId = String(props.paperId || '')
      const index = useMemo(() => buildIndex(props.paperText, props.structure && props.structure.documentId && paperId && props.structure.documentId !== paperId ? null : props.structure), [paperId, props.paperText, props.structure])
      const [local, setLocal] = useState(() => normalizeState(props.state, paperId)), [location, setLocation] = useState(null), [copied, setCopied] = useState(null), [activation, setActivation] = useState({ status: 'none', referenceIds: [] })
      const ui = local.paperId === paperId ? local : normalizeState(props.state, paperId)
      const uiRef = useRef(ui); uiRef.current = ui
      const paper = useRef(paperId); paper.current = paperId
      const list = useRef(null), rows = useRef(new Map()), pendingScroll = useRef(null), dialog = useRef(null), layer = useRef(null), focusFrame = useRef(null)
      const request = useRef(0), copyRequest = useRef(0), detailRef = useRef(null)
      const refs = useMemo(() => new Map(index.references.map((reference) => [reference.id, reference])), [index])
      const detail = refs.get(ui.detailReferenceId) || null
      detailRef.current = detail && detail.id
      const points = detail ? referenceLocations(index, detail) : [], occurrence = Math.min(ui.detailOccurrenceIndex, Math.max(0, points.length - 1)), point = points[occurrence]
      function update(patch) {
        if (paper.current !== paperId) return
        const next = normalizeState({ ...uiRef.current, ...patch, paperId }, paperId)
        if (JSON.stringify(next) === JSON.stringify(uiRef.current)) return
        uiRef.current = next; setLocal(next)
        if (typeof props.onStateChange === 'function') props.onStateChange(next, { paperId })
      }
      function closeDetail(restoreFocus) {
        const id = detailRef.current, owner = paperId
        request.current += 1; copyRequest.current += 1; setLocation(null); setCopied(null)
        update({ detailReferenceId: null })
        if (restoreFocus && typeof scope.requestAnimationFrame === 'function') focusFrame.current = scope.requestAnimationFrame(() => { focusFrame.current = null; const row = rows.current.get(id); if (paper.current === owner && !detailRef.current && row && typeof row.focus === 'function') row.focus({ preventScroll: true }) })
      }
      function selectReference(reference) {
        if (!reference) return
        request.current += 1; copyRequest.current += 1; setLocation(null); setCopied(null)
        pendingScroll.current = reference.id
        update({ view: 'references', query: '', selectedReferenceId: reference.id, detailReferenceId: reference.id, detailOccurrenceIndex: 0 })
      }
      useEffect(() => {
        request.current += 1; copyRequest.current += 1
        setLocal(normalizeState(props.state, paperId)); setLocation(null); setCopied(null); setActivation({ status: 'none', referenceIds: [] }); rows.current.clear(); pendingScroll.current = null
        return () => { request.current += 1; copyRequest.current += 1; if (focusFrame.current != null && typeof scope.cancelAnimationFrame === 'function') scope.cancelAnimationFrame(focusFrame.current) }
      }, [paperId])
      useEffect(() => { if (props.state && typeof props.state === 'object') { const next = normalizeState(props.state, paperId); if (JSON.stringify(next) !== JSON.stringify(uiRef.current)) { uiRef.current = next; setLocal(next) } } }, [paperId, props.state])
      const activeKey = JSON.stringify(props.activeReference ? [props.activeReference.documentId, props.activeReference.referenceId, props.activeReference.number, props.activeReference.quote, props.activeReference.context] : null)
      useEffect(() => {
        const resolved = resolveActiveReference(index, props.activeReference, paperId)
        setActivation(resolved)
        if (resolved.status === 'matched') selectReference(refs.get(resolved.referenceIds[0]))
        else if (resolved.status !== 'none') { request.current += 1; update({ view: 'references', query: '', selectedReferenceId: null, detailReferenceId: null, scrollTop: 0 }) }
      }, [paperId, index, activeKey, props.activeReference])
      useEffect(() => {
        const host = list.current
        if (!host) return
        if (pendingScroll.current) { const row = rows.current.get(pendingScroll.current); if (row && typeof row.scrollIntoView === 'function') { row.scrollIntoView({ block: 'nearest', behavior: 'auto' }); pendingScroll.current = null } }
        else if (Math.abs(host.scrollTop - ui.scrollTop) > 1) host.scrollTop = ui.scrollTop
      }, [paperId, ui.scrollTop, ui.selectedReferenceId, index])
      useEffect(() => {
        if (!detail) return undefined
        const doc = scope.document || null, element = dialog.current, owner = paperId, id = detail.id
        const focus = element && typeof element.querySelector === 'function' && element.querySelector('.lrc-detail-close')
        if (focus && typeof focus.focus === 'function') focus.focus({ preventScroll: true })
        if (!doc || typeof doc.addEventListener !== 'function') return undefined
        function outside(event) { if (paper.current !== owner || detailRef.current !== id || element && element.contains(event.target) || layer.current && layer.current.contains(event.target)) return; closeDetail(false) }
        function keyboard(event) {
          if (paper.current !== owner || detailRef.current !== id) return
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeDetail(true); return }
          if (event.key !== 'Tab' || !element || typeof element.querySelectorAll !== 'function') return
          const controls = Array.from(element.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]')).filter(node => !node.hidden && (!node.getClientRects || node.getClientRects().length))
          const first = controls[0], last = controls[controls.length - 1]
          if (!first) { event.preventDefault(); element.focus(); return }
          if (event.shiftKey && (doc.activeElement === first || !element.contains(doc.activeElement))) { event.preventDefault(); last.focus() }
          else if (!event.shiftKey && (doc.activeElement === last || !element.contains(doc.activeElement))) { event.preventDefault(); first.focus() }
        }
        doc.addEventListener('pointerdown', outside, true); doc.addEventListener('keydown', keyboard, true)
        return () => { doc.removeEventListener('pointerdown', outside, true); doc.removeEventListener('keydown', keyboard, true) }
      }, [paperId, detail && detail.id])
      async function locateDetail() {
        if (!detail || !point) return
        const stamp = ++request.current, owner = paperId, id = detail.id
        const alive = () => request.current === stamp && paper.current === owner && detailRef.current === id
        const locate = async candidate => { if (typeof props.onLocate !== 'function') return false; try { return Boolean(await props.onLocate(candidate.quote, { id: candidate.id, kind: candidate.kind, documentId: owner, referenceId: id, page: candidate.page, bbox: candidate.bbox || null, anchor: candidate.anchor || null })) } catch { return false } }
        setLocation({ referenceId: id, state: 'loading', text: '正在定位原文位置…' })
        const found = await locate(point)
        if (!alive()) return
        if (found) { setLocation({ referenceId: id, state: 'found', text: point.kind === 'citation' ? '已定位这处正文引用。' : '未匹配到正文引用；已定位文末参考文献条目。' }); return }
        if (point.kind === 'citation') {
          const fallback = { id, kind: 'reference', quote: detail.anchor && detail.anchor.quote || detail.raw, page: detail.page, bbox: detail.bbox, anchor: detail.anchor }
          const fallbackFound = await locate(fallback)
          if (!alive()) return
          setLocation({ referenceId: id, state: fallbackFound ? 'fallback' : 'missing', text: fallbackFound ? '未找到这处正文引用；已定位文末参考文献条目。' : '正文与文末条目均未找到可靠位置，请核对原始论文。' })
        } else setLocation({ referenceId: id, state: 'missing', text: '未找到可靠原文位置，请核对文末参考文献。' })
      }
      async function copyDetail() {
        if (!detail) return
        const stamp = ++copyRequest.current, owner = paperId, id = detail.id
        setCopied({ id, state: 'copying' })
        try {
          if (typeof props.onCopy === 'function') { if (await props.onCopy(detail.raw) === false) throw Error('copy-rejected') }
          else if (scope.navigator && scope.navigator.clipboard && typeof scope.navigator.clipboard.writeText === 'function') await scope.navigator.clipboard.writeText(detail.raw)
          else throw Error('clipboard-unavailable')
          if (copyRequest.current === stamp && paper.current === owner && detailRef.current === id) setCopied({ id, state: 'copied' })
        } catch { if (copyRequest.current === stamp && paper.current === owner && detailRef.current === id) setCopied({ id, state: 'failed' }) }
      }
      const destination = detail && referenceDestination(detail), titleId = 'lrc-detail-title-' + stableId('title', paperId), activeLocation = location && detail && location.referenceId === detail.id ? location : null
      const hint = activation.status !== 'none' && activation.status !== 'matched' ? h('p', { className: 'lrc-activation', role: 'status' }, activation.status === 'ambiguous' ? '有多条对应记录，请选择条目。' : activation.status === 'mismatched-document' ? '此引用属于另一篇论文。' : '没有找到对应条目。') : null
      return h('section', { className: 'lrc-root lrc-cards', 'aria-label': '本篇参考文献', 'data-paper-id': paperId },
        hint,
        h('div', { className: 'lrc-list', ref: list, 'aria-label': '文末原始参考文献列表', onScroll: event => update({ scrollTop: Math.round(event.currentTarget.scrollTop) }) },
          index.references.length ? index.references.map(reference => {
            const selected = ui.selectedReferenceId === reference.id, candidate = activation.status === 'ambiguous' && activation.referenceIds.includes(reference.id)
            const label = referenceCardText(reference), marker = referenceCardNumber(reference)
            return h('button', { type: 'button', key: reference.id, ref: node => { if (node) rows.current.set(reference.id, node); else rows.current.delete(reference.id) }, className: 'lrc-card' + (reference.number ? '' : ' is-unnumbered') + (selected ? ' is-selected' : '') + (candidate ? ' is-candidate' : ''), 'data-reference-id': reference.id, 'aria-current': selected ? 'true' : undefined, 'aria-haspopup': 'dialog', 'aria-expanded': detail && detail.id === reference.id ? 'true' : 'false', onClick: () => selectReference(reference) },
              marker ? h('span', { className: 'lrc-card-number' }, marker) : null,
              h('span', { className: 'lrc-card-content' }, h('span', { className: 'lrc-card-title lrc-card-raw' }, label)))
          }) : h('p', { className: 'lrc-empty', role: 'status' }, '尚未提取到参考文献。请先解析论文结构。')),
        detail ? h('div', { className: 'lrc-detail-layer', ref: layer, onPointerDown: event => { if (event.target === event.currentTarget) closeDetail(true) } },
          h('section', { className: 'lrc-detail', ref: dialog, role: 'dialog', 'aria-modal': true, 'aria-labelledby': titleId, tabIndex: -1, 'data-reference-id': detail.id },
            h('div', { className: 'lrc-detail-bar' }, h('span', { className: 'lrc-detail-number' }, detail.number ? detail.label : '参考文献'),
              h('div', { className: 'lrc-detail-icons' }, h('button', { type: 'button', className: 'lrc-detail-copy', 'aria-label': '复制完整引用', title: '复制完整引用', onClick: copyDetail }, h(Icon, { name: 'copy' })), h('button', { type: 'button', className: 'lrc-detail-close', 'aria-label': '关闭文献详情', title: '关闭文献详情', onClick: () => closeDetail(true) }, h(Icon, { name: 'close' })))),
            h('div', { className: 'lrc-detail-scroll' },
              h('h2', { className: 'lrc-detail-title', id: titleId }, detail.title || '原始参考文献'),
              detail.authors ? h('p', { className: 'lrc-detail-authors' }, detail.authors) : null,
              detail.year ? h('p', { className: 'lrc-detail-year' }, detail.year) : null,
              detail.publication ? h('p', { className: 'lrc-detail-publication' }, detail.publication) : null,
              detail.doi ? h('p', { className: 'lrc-detail-doi' }, 'DOI ', detail.doi) : null,
              h('details', { className: 'lrc-detail-raw', open: detail.parseStatus !== 'parsed' }, h('summary', null, '原始引文'), h('p', null, detail.raw)),
              points.length > 1 ? h('div', { className: 'lrc-detail-position-control' }, h('button', { type: 'button', className: 'lrc-position-prev', 'aria-label': '上一处正文引用', disabled: occurrence === 0, onClick: () => { request.current += 1; setLocation(null); update({ detailOccurrenceIndex: occurrence - 1 }) } }, h(Icon, { name: 'left' })), h('span', { 'aria-live': 'polite' }, '正文引用 ' + (occurrence + 1) + ' / ' + points.length), h('button', { type: 'button', className: 'lrc-position-next', 'aria-label': '下一处正文引用', disabled: occurrence === points.length - 1, onClick: () => { request.current += 1; setLocation(null); update({ detailOccurrenceIndex: occurrence + 1 }) } }, h(Icon, { name: 'right' }))) : null,
              h('p', { className: 'lrc-detail-location-hint' }, point && point.kind === 'citation' ? '正文引用' + (point.page != null ? ' · 第 ' + (point.page + 1) + ' 页' : '') : '未匹配到正文引用，将定位文末条目。'),
              point && point.kind === 'citation' ? h('blockquote', { className: 'lrc-detail-context' }, point.quote) : null,
              detail.duplicateIds.length ? h('p', { className: 'lrc-detail-note' }, '同一原始引用在文末另有 ' + detail.duplicateIds.length + ' 个位置，本卡保留当前条目位置。') : null,
              activeLocation ? h('p', { className: 'lrc-detail-status ' + activeLocation.state, role: 'status', 'data-locate-kind': activeLocation.state }, activeLocation.text) : null,
              copied && copied.id === detail.id ? h('p', { className: 'lrc-detail-copy-state', role: 'status' }, copied.state === 'copied' ? '已复制完整引用' : copied.state === 'copying' ? '正在复制…' : '复制失败，可展开原始引文后手动复制。') : null),
            h('div', { className: 'lrc-detail-actions' + (destination ? '' : ' is-single') }, destination ? h('a', { className: 'lrc-detail-jump', href: destination.url, target: '_blank', rel: 'noopener noreferrer', 'data-link-kind': destination.kind, title: '打开文献链接' }, h(Icon, { name: 'external' }), destination.label) : null, h('button', { type: 'button', className: 'lrc-detail-locate', disabled: activeLocation && activeLocation.state === 'loading', onClick: locateDetail }, h(Icon, { name: 'locate' }), '定位原文位置')))) : null)
    }
    return { Component, CSS }
  }

  const CSS = `
.lrc-root.lrc-cards{position:relative;display:flex;flex-direction:column;min-width:0;min-height:0;height:100%;font:inherit;line-height:1.6;color:var(--lr-shell-ink,var(--dsw-alias-label-primary,#24262b));container-type:inline-size}
.lrc-root.lrc-cards button,.lrc-root.lrc-cards a{font:inherit;-webkit-tap-highlight-color:transparent}.lrc-root.lrc-cards button{cursor:pointer}.lrc-root.lrc-cards button:disabled{cursor:default;opacity:.35}.lrc-root.lrc-cards :is(button,a,summary):focus-visible{outline:2px solid var(--lr-shell-focus,var(--dsw-alias-brand-primary,#007aff));outline-offset:3px}
.lrc-root.lrc-cards>.lrc-list{display:flex;flex:1;flex-direction:column;min-height:0;min-width:0;gap:7px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;padding:3px 4px 14px 0}
.lrc-root.lrc-cards .lrc-card{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:9px;flex:none;width:100%;min-width:0;min-height:54px;box-sizing:border-box;padding:10px 11px;border:1px solid color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 5%,transparent);border-radius:12px;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff)) 88%,transparent);color:inherit;text-align:left;box-shadow:none;transition:background .16s ease,border-color .16s ease}
.lrc-root.lrc-cards .lrc-card.is-unnumbered{grid-template-columns:minmax(0,1fr)}.lrc-root.lrc-cards .lrc-card:hover{background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff)) 92%,var(--lr-shell-ink,var(--dsw-alias-label-primary)))}.lrc-root.lrc-cards .lrc-card.is-selected{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#007aff) 10%,var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff)));border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#007aff) 34%,transparent)}.lrc-root.lrc-cards .lrc-card.is-candidate{border-style:dashed;border-color:var(--lr-shell-control,var(--dsw-alias-border-l2,#abb0ba))}
.lrc-card-number{font-size:11px;line-height:1.8;font-weight:550;white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary,#656a73));padding-top:1px}.lrc-card-content{display:block;min-width:0}.lrc-card-title{display:block;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12.3px;font-weight:440;line-height:1.7;letter-spacing:0}
.lrc-activation,.lrc-empty{font-size:12px;line-height:1.7;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary,#656a73));margin:4px 0 12px}.lrc-activation{padding:7px 2px}
.lrc-detail-layer{position:absolute;inset:0;z-index:35;display:grid;place-items:center;min-width:0;padding:10px;box-sizing:border-box;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff)) 14%,transparent)}
.lrc-root.lrc-cards .lrc-detail{position:relative;isolation:isolate;display:flex;flex-direction:column;width:100%;max-width:480px;max-height:100%;min-width:0;min-height:0;box-sizing:border-box;border:1px solid color-mix(in srgb,var(--gloss-thin-rim,#fff) 50%,transparent);border-radius:20px;background:color-mix(in srgb,var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff)) 88%,transparent);backdrop-filter:blur(20px) saturate(1.08);-webkit-backdrop-filter:blur(20px) saturate(1.08);box-shadow:0 2px 10px color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 4%,transparent);overflow:hidden;animation:lrc-detail-in .18s cubic-bezier(.16,1,.3,1)}
.lrc-detail::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;display:none}@supports(mask-composite:exclude) or (-webkit-mask-composite:xor){.lrc-detail::after{display:block;box-sizing:border-box;padding:3px;background:linear-gradient(160deg,color-mix(in srgb,var(--gloss-thin-rim,#fff) 65%,transparent),transparent 50%,color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 3%,transparent));mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask-composite:xor;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}}
.lrc-detail-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;padding:10px 11px 4px 20px}.lrc-detail-number{font-size:11px;font-weight:550;font-variant-numeric:tabular-nums;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary))}.lrc-detail-icons{display:flex;gap:3px}.lrc-detail-icons button,.lrc-detail-position-control button{display:inline-flex;align-items:center;justify-content:center;flex:none;width:30px;height:30px;padding:0;border:0;border-radius:50%;background:transparent;color:inherit}.lrc-detail-icons button:hover,.lrc-detail-position-control button:not(:disabled):hover{background:color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 6%,transparent)}.lrc-detail :is(button,a)>svg{width:16px;height:16px;flex:none}
.lrc-detail-scroll{min-height:0;overflow:auto;overscroll-behavior:contain;padding:8px 20px 12px;scrollbar-width:thin}.lrc-detail-title{font-size:17px;font-weight:620;line-height:1.5;letter-spacing:-.015em;margin:0 0 12px;overflow-wrap:anywhere}.lrc-detail-authors,.lrc-detail-publication{font-size:12px;line-height:1.7;margin:0 0 7px;overflow-wrap:anywhere}.lrc-detail-authors{color:var(--lr-shell-ink,var(--dsw-alias-label-primary))}.lrc-detail-year,.lrc-detail-publication,.lrc-detail-doi{color:var(--lr-shell-muted,var(--dsw-alias-label-secondary))}.lrc-detail-year{font-size:11px;margin:0 0 9px;font-variant-numeric:tabular-nums}.lrc-detail-doi{font-size:11px;line-height:1.7;margin:10px 0;overflow-wrap:anywhere}.lrc-detail-raw{font-size:11px;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary));margin-top:14px}.lrc-detail-raw summary{cursor:pointer;width:fit-content;padding:3px 0}.lrc-detail-raw p{margin:7px 0 3px;line-height:1.8;overflow-wrap:anywhere;user-select:text}
.lrc-detail-position-control{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:17px;font-size:10.8px;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary));font-variant-numeric:tabular-nums}.lrc-detail-location-hint,.lrc-detail-note,.lrc-detail-status,.lrc-detail-copy-state{font-size:10.8px;line-height:1.7;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary));margin:10px 0 0}.lrc-detail-status.missing,.lrc-detail-status.fallback{color:var(--dsw-alias-state-warn-primary,#936c26)}.lrc-detail-context{margin:7px 0 0;padding:0;font-size:11.2px;line-height:1.8;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary));overflow-wrap:anywhere}
.lrc-detail-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:none;padding:10px 15px 14px}.lrc-detail-actions.is-single{grid-template-columns:minmax(0,1fr)}.lrc-detail-actions>a,.lrc-detail-actions>button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:0;min-height:38px;box-sizing:border-box;border:0;border-radius:11px;padding:8px 10px;background:color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 6%,transparent);color:inherit;text-decoration:none;text-align:center;font-size:11.5px;line-height:1.5;overflow-wrap:anywhere}.lrc-detail-actions>a:hover,.lrc-detail-actions>button:not(:disabled):hover{background:color-mix(in srgb,var(--lr-shell-ink,var(--dsw-alias-label-primary)) 10%,transparent)}
@keyframes lrc-detail-in{from{opacity:.3;transform:translateY(5px) scale(.985)}to{opacity:1;transform:none}}@container(max-width:320px){.lrc-root.lrc-cards .lrc-card{padding:10px;gap:7px}.lrc-detail-layer{padding:4px}.lrc-detail-scroll{padding-left:14px;padding-right:14px}.lrc-detail-actions{padding-left:10px;padding-right:10px;gap:6px}.lrc-detail-actions>a,.lrc-detail-actions>button{font-size:10.8px;padding-inline:7px}.lrc-detail-title{font-size:15px}}@media(pointer:coarse){.lrc-detail-icons button,.lrc-detail-position-control button{width:40px;height:40px}.lrc-detail-actions>a,.lrc-detail-actions>button{min-height:44px}}@media(prefers-reduced-motion:reduce){.lrc-root.lrc-cards .lrc-card{transition:none}.lrc-root.lrc-cards .lrc-detail{animation:none}}@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lrc-root.lrc-cards .lrc-detail{background:var(--lr-shell-ground,var(--dsw-alias-bg-base,#fff));backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none}.lrc-detail::after{display:none}.lrc-detail-layer{background:transparent}.lrc-root.lrc-cards .lrc-card{border-color:var(--lr-shell-control,var(--dsw-alias-border-l2))}}
`

  scope.LiteratureReaderCitations = { version: 4, parseReferences, buildIndex, expandNumbers, expandYears, keyOf, referenceDetails, referenceLinks, referenceCardNumber, referenceCardText, normalizeState, resolveActiveReference, referenceDestination, referenceLocations, create }
})(typeof window === 'undefined' ? globalThis : window)
