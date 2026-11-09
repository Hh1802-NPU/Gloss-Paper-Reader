/* Deterministic, source-bound chapter context. No I/O, network or model calls. */
const MAX_CONTEXT_CHARS = 24000
const MAX_SOURCES = 48
const PASSAGE_CHARS = 1300
const MAX_ASSET_SOURCES = 12

const string = value => typeof value === 'string' ? value : ''
const compact = value => string(value).replace(/\s+/g, ' ').trim()
function matchKey(value) {
  // Context-only exact canonicalization. Preserve semantic hyphens/minus signs;
  // no fuzzy matching and no in-word/Chinese dash deletion.
  return string(value).normalize('NFKC').replace(/[\u00ad\u200b-\u200f\u2060\ufeff]/g, '')
    .replace(/['’‘]/g, "'").replace(/[“”]/g, '"').replace(/[‐‑–—−]/g, '-')
    .replace(/\s+/g, '').toLowerCase()
}
function levelOf(section) { return Math.max(1, Math.min(8, Number(section && section.level) || 1)) }
function sectionId(section) { return string(section && section.id) || string(section && section.anchorId) }
function nodeId(section) { return string(section && section.anchorId) || string(section && section.id) }
function pageOf(value) {
  const page = value && value.anchor && value.anchor.page != null ? value.anchor.page : value && value.page
  return Number.isInteger(page) && page >= 0 ? page : null
}
function reliableAnchor(anchor, documentId) {
  return anchor && anchor.documentId === documentId && anchor.status === 'located' && anchor.quoteVerified === true ? anchor : null
}
function kindOf(heading) {
  if (/related|prior work|相关|文献回顾/i.test(heading)) return 'related'
  if (/introduction|abstract|background|引言|绪论|前言|摘要/i.test(heading)) return 'intro'
  if (/experiment|evaluat|result|benchmark|实验|评估|结果|消融|验证/i.test(heading)) return 'experiment'
  if (/discussion|limitation|future|讨论|局限|展望/i.test(heading)) return 'discussion'
  if (/conclusion|总结|结论/i.test(heading)) return 'conclusion'
  if (/theor|proof|lemma|theorem|理论|推导|定理/i.test(heading)) return 'theory'
  if (/method|approach|model|architect|framework|algorithm|方法|模型|架构|框架|算法/i.test(heading)) return 'method'
  return 'other'
}
function isBackmatter(heading) { return /^(?:\d+[.)]?\s*)?(?:references|bibliography|works cited|参考\s*文献|acknowledg(?:e)?ments?|致谢)\s*[:：]?$/i.test(compact(heading)) }
function prose(value) {
  const raw = compact(value)
  if (raw.length < 20) return false
  const han = (raw.match(/[\u3400-\u9fff]/g) || []).length
  const words = raw.match(/\p{L}{3,}/gu) || []
  return han >= 8 || words.length >= 4 && raw.length >= 30
}
// PDF formula text may contain few natural-language words. This only classifies
// a line already verified against the same paper; it does not reconstruct TeX.
function formulaLine(value) {
  const raw = compact(value)
  const equal = raw.indexOf('='), left = raw.slice(0, equal).replace(/^(?:where|with)\s+/i, '').trim()
  return raw.length >= 8 && raw.length <= 1200
    && equal > 0 && left.length <= 80
    && /^[A-Za-z\u0370-\u03ff][A-Za-z0-9_{}^]*(?:\s+[A-Za-z0-9_{}^]+){0,3}(?:\([^=]*\))?$/.test(left)
    && /[A-Za-z\u0370-\u03ff]/.test(raw.slice(equal + 1))
}
function pageNumberArtifact(paragraph, raw, structure, documentId) {
  const page = pageOf(paragraph), anchor = reliableAnchor(paragraph && paragraph.anchor, documentId)
  if (page == null || !/^\d{1,4}$/.test(raw) || Number(raw) !== page + 1 || !anchor) return false
  const geometry = (Array.isArray(structure.pageGeometry) ? structure.pageGeometry : []).find(item => item && item.page === page)
  const box = anchor.bbox
  return Boolean(geometry && geometry.height > 0 && Array.isArray(box) && box.length === 4
    && box.every(Number.isFinite) && box[1] >= geometry.height * .9 && box[3] <= geometry.height + 1)
}
function exactClip(value, limit) {
  const raw = string(value).trim()
  if (raw.length <= limit) return raw
  let at = -1
  const pattern = /[。！？.!?;；](?:[\s\n]|$)/g
  for (const found of raw.matchAll(pattern)) {
    if (found.index + 1 > limit) break
    if (found.index + 1 >= limit * .45) at = found.index + 1
  }
  if (at < 0) at = raw.lastIndexOf(' ', limit)
  if (at < limit * .45) at = limit
  return raw.slice(0, at).trim()
}
function passages(value) {
  const chunks = []
  let remaining = string(value).trim()
  while (remaining.length > PASSAGE_CHARS) {
    const quote = exactClip(remaining, PASSAGE_CHARS)
    if (!quote) break
    chunks.push(quote)
    remaining = remaining.slice(quote.length).trimStart()
  }
  if (remaining) chunks.push(remaining)
  return chunks
}
function evenly(length, count) {
  if (count >= length) return Array.from({ length }, (_, index) => index)
  if (count === 1) return [0]
  return Array.from({ length: count }, (_, index) => Math.round(index * (length - 1) / (count - 1)))
}
function fairSources(groups, limit) {
  const active = groups.filter(group => group.sources.length)
  const participating = active.length > limit ? evenly(active.length, limit).map(index => active[index]) : active
  const quotas = new Map(participating.map(group => [group, 0]))
  let left = limit
  while (left > 0) {
    let assigned = false
    for (const group of participating) if (left && quotas.get(group) < group.sources.length) {
      quotas.set(group, quotas.get(group) + 1); left -= 1; assigned = true
    }
    if (!assigned) break
  }
  return participating.flatMap(group => evenly(group.sources.length, quotas.get(group)).map(index => group.sources[index]))
}
function quoteBudgets(lengths, budget) {
  const amounts = lengths.map(() => 0)
  let active = lengths.map((_, index) => index), remaining = Math.max(0, budget)
  while (active.length) {
    const share = Math.floor(remaining / active.length)
    const small = active.filter(index => lengths[index] <= share)
    if (!small.length) {
      for (const index of active) { amounts[index] = share; remaining -= share }
      for (const index of active) if (remaining > 0) { amounts[index] += 1; remaining -= 1 }
      break
    }
    for (const index of small) { amounts[index] = lengths[index]; remaining -= lengths[index] }
    active = active.filter(index => !small.includes(index))
  }
  return amounts
}
function labelPattern(label, kind) {
  const number = compact(label).match(/(?:fig(?:ure)?s?\.?|tables?|equations?|eqs?\.?|图|表|公式)\s*\(?([A-Z]?\d+(?:\.\d+)*)\)?/i)
  if (!number) return null
  const escaped = number[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const family = kind === 'figure' ? '(?:fig(?:ure)?s?\\.?|图)' : kind === 'table' ? '(?:tables?|表)' : '(?:equations?|eqs?\\.?|公式)'
  return new RegExp(family + '\\s*\\(?' + escaped + '\\)?(?!\\d|\\.\\d)', 'i')
}

/** Resolve only the requested structured chapter; caller-supplied prose is ignored. */
export function buildChapterReadingContext({ paper = {}, structure = null, chapter = null } = {}) {
  const documentId = string(paper.id)
  const warnings = []
  const limits = { maxContextChars: MAX_CONTEXT_CHARS, maxSources: MAX_SOURCES, maxAssetSources: MAX_ASSET_SOURCES, fullTextIncluded: false, externalRequestsMade: false }
  const reject = message => ({ documentId, status: 'rejected', chapter: null, sources: [], text: '', limits, warnings: [message] })
  if (!documentId || !structure || structure.documentId !== documentId || !Array.isArray(structure.sections)) return reject('本章结构未绑定当前论文，已拒绝生成上下文。')
  const requestedId = string(chapter && chapter.id) || string(chapter && chapter.anchorId)
  if (!requestedId) return reject('缺少当前章节的可靠标识，未回退到其他章节。')
  const all = structure.sections.filter(section => section && typeof section === 'object')
  const found = all.map((section, index) => ({ section, index })).filter(({ section }) => section.id === requestedId || section.anchorId === requestedId)
  if (found.length !== 1) return reject(found.length ? '章节标识存在多个候选，未选择第一项。' : '当前章节不在本篇结构中，未回退到其他章节。')
  const { section: root, index: start } = found[0]
  if (isBackmatter(root.heading)) return reject('参考文献或致谢不作为正文精读章节。')
  const descendants = [root]
  for (let index = start + 1; index < all.length && levelOf(all[index]) > levelOf(root); index += 1) if (!isBackmatter(all[index].heading)) descendants.push(all[index])
  const chapterMeta = { id: nodeId(root), sectionId: sectionId(root), anchorId: string(root.anchorId) || null, requestedId,
    heading: string(root.heading), kind: kindOf(string(root.heading)), level: levelOf(root), page: pageOf(root),
    anchor: reliableAnchor(root.anchor, documentId), sectionIds: descendants.map(sectionId),
    subsections: descendants.slice(1).map(section => ({ id: nodeId(section), sectionId: sectionId(section), heading: string(section.heading), level: levelOf(section), page: pageOf(section) })) }
  const paperText = string(paper.text), paperKey = matchKey(paperText)
  const empty = message => ({ documentId, status: 'empty', chapter: chapterMeta, sources: [], text: '', limits, warnings: [message] })
  if (!paperKey) return empty('当前论文没有可核对全文，本章未提供任何作者原文来源。')
  const verified = (quote, minimum = 12) => { const value = matchKey(quote); return value.length >= minimum && paperKey.includes(value) }
  const body = [], groups = [], seen = new Set()
  const counts = { unmatchedParagraphs: 0, skippedFragments: 0, duplicatePassages: 0, unverifiedAssets: 0, ignoredPageNumbers: 0 }
  for (const [order, section] of descendants.entries()) {
    const group = { section, order, sources: [], verifiedParagraphs: [] }
    for (const [paragraphIndex, paragraph] of (Array.isArray(section.paragraphs) ? section.paragraphs : []).entries()) {
      const raw = string(paragraph && (paragraph.text || paragraph.quote)).trim()
      if (!raw) continue
      if (pageNumberArtifact(paragraph, raw, structure, documentId)) { counts.ignoredPageNumbers += 1; continue }
      const formula = formulaLine(raw), readable = prose(raw)
      if (!verified(raw, readable && !formula ? 12 : 2)) {
        counts.unmatchedParagraphs += 1
        const parentAnchor = reliableAnchor(paragraph.anchor, documentId)
        const segments = parentAnchor && Array.isArray(parentAnchor.segments) ? parentAnchor.segments : []
        // Refuse the whole group if any segment is forged, crosses owner/page,
        // lacks a precise location, or cannot be exact-verified in this paper.
        const consistent = segments.length && segments.every(segment =>
          segment.page === pageOf(paragraph) && string(segment.quote).trim() && verified(string(segment.quote), 1)
          && Array.isArray(segment.lineIds) && segment.lineIds.length && segment.lineIds.every(id => typeof id === 'string' && id)
          && Array.isArray(segment.bbox) && segment.bbox.length === 4 && segment.bbox.every(Number.isFinite))
        if (!consistent || !readable) continue
        // Keep readable literal lines only. One-character matrix glyphs are not
        // reconstructed into equations or silently joined with nearby prose.
        const lines = segments.filter(segment => prose(string(segment.quote)))
        if (!lines.length) continue
        const clusters = []; let cluster = [], size = 0
        for (const segment of lines) {
          const next = string(segment.quote).trim()
          if (cluster.length && size + next.length + 14 > PASSAGE_CHARS) { clusters.push(cluster); cluster = []; size = 0 }
          cluster.push(segment); size += next.length + 14
        }
        if (cluster.length) clusters.push(cluster)
        for (const [part, fragments] of clusters.entries()) {
          const first = fragments[0], originalId = string(paragraph.id) || sectionId(section) + '-paragraph-' + paragraphIndex
          const quote = string(first.quote).trim(), id = originalId + '-lines-' + (part + 1)
          const anchor = { ...parentAnchor, id, precision: 'line', bbox: first.bbox, pdfBBox: first.pdfBBox,
            segments: [first], quote, sourceText: quote, bboxScope: 'verified-first-line', quoteVerified: true }
          const source = { id, paragraphId: originalId, documentId, quote,
            text: fragments.map((line, i) => '【原文行 ' + (i + 1) + '】' + string(line.quote).trim()).join('\n'),
            anchor, page: first.page, sectionId: sectionId(section), sectionAnchorId: string(section.anchorId) || null,
            sectionTitle: string(section.heading), sourceKind: 'paragraph-line-fragments', identity: '作者原文行片段', origin: 'paper',
            anchorScope: 'verified-source-line', contiguity: 'non-contiguous-not-reconstructed',
            lineFragments: fragments.map(line => ({ quote: string(line.quote).trim(), page: line.page, bbox: line.bbox,
              pdfBBox: line.pdfBBox, lineIds: line.lineIds, quoteVerified: true })),
            omittedLineFragments: segments.length - lines.length, sectionOrder: order, paragraphOrder: paragraphIndex,
            chunkIndex: part, chunkCount: clusters.length }
          group.sources.push(source); body.push(source)
        }
        continue
      }
      group.verifiedParagraphs.push({ paragraph, raw })
      if (!readable && !formula) { counts.skippedFragments += 1; continue }
      const chunks = passages(raw)
      for (const [chunkIndex, quote] of chunks.entries()) {
        const key = matchKey(quote)
        if (seen.has(key)) { counts.duplicatePassages += 1; continue }
        seen.add(key)
        const originalId = string(paragraph.id) || sectionId(section) + '-paragraph-' + paragraphIndex
        const source = { id: originalId + (chunks.length > 1 ? '-part-' + (chunkIndex + 1) : ''), paragraphId: originalId,
          documentId, quote, text: quote, anchor: reliableAnchor(paragraph.anchor, documentId), page: pageOf(paragraph),
          sectionId: sectionId(section), sectionAnchorId: string(section.anchorId) || null, sectionTitle: string(section.heading),
          sourceKind: formula ? 'formula' : 'paragraph', identity: '作者原文', origin: 'paper', anchorScope: 'original-paragraph',
          ...(formula ? { mathNotation: 'pdf-linearized', regionStatus: 'formula-text-linearized' } : {}),
          sectionOrder: order, paragraphOrder: paragraphIndex, chunkIndex, chunkCount: chunks.length }
        group.sources.push(source); body.push(source)
      }
    }
    groups.push(group)
  }
  // A literal mention can span a paragraph that was excluded as a continuous
  // sentence. Recover its owner only from existing source-line evidence, never
  // from the caption position or from matching a chapter title/asset label.
  const boxValid = box => Array.isArray(box) && box.length === 4 && box.every(Number.isFinite) && box[2] > box[0] && box[3] > box[1]
  const idsValid = ids => Array.isArray(ids) && ids.length && ids.every(id => typeof id === 'string' && id)
  const sameIds = (a, b) => idsValid(a) && idsValid(b) && new Set(a).size === a.length && new Set(b).size === b.length && a.length === b.length && a.every(id => b.includes(id))
  const sourceLineOwner = mention => {
    const mentionAnchor = reliableAnchor(mention && mention.anchor, documentId), quote = string(mention && (mention.text || mention.quote)), page = pageOf(mention)
    const segments = mentionAnchor && Array.isArray(mentionAnchor.segments) ? mentionAnchor.segments : []
    if (!mentionAnchor || page == null || mention.page != null && mention.page !== page || !verified(quote) || matchKey(mentionAnchor.quote) !== matchKey(quote) || !segments.length) return null
    const ids = segments.flatMap(line => Array.isArray(line.lineIds) ? line.lineIds : [])
    if (new Set(ids).size !== ids.length || !segments.every(line => line && line.page === page && idsValid(line.lineIds) && boxValid(line.bbox) && verified(string(line.quote), 1))) return null
    const covers = group => segments.every(segment => group.sources.some(source => {
      if (source.documentId !== documentId || source.sectionId !== sectionId(group.section) || pageOf(source) !== page || !reliableAnchor(source.anchor, documentId)) return false
      const lines = source.sourceKind === 'paragraph-line-fragments' ? source.lineFragments : source.anchor.segments
      return Array.isArray(lines) && lines.some(line => line && line.page === page && line.quoteVerified !== false && sameIds(line.lineIds, segment.lineIds)
        && boxValid(line.bbox) && line.bbox.every((value, index) => value === segment.bbox[index])
        && verified(string(line.quote), 1) && matchKey(line.quote) === matchKey(segment.quote))
    }))
    const owners = groups.filter(covers)
    if (owners.length !== 1) return null
    const owner = owners[0], id = sectionId(owner.section)
    if (mention.sectionId && mention.sectionId !== id || Array.isArray(mention.sectionIds) && (mention.sectionIds.length !== 1 || mention.sectionIds[0] !== id)) return null
    // The same physical line IDs must not be claimed by another section, even
    // outside the requested subtree. These raw anchors only veto ambiguity;
    // they never supply missing evidence or establish a fallback owner.
    if (all.some(section => sectionId(section) !== id && (Array.isArray(section.paragraphs) ? section.paragraphs : []).some(paragraph => {
      const anchor = reliableAnchor(paragraph && paragraph.anchor, documentId)
      return anchor && anchor.page === page && Array.isArray(anchor.segments) && anchor.segments.some(line => line && line.page === page && Array.isArray(line.lineIds) && line.lineIds.some(value => ids.includes(value)))
    }))) return null
    return owner
  }
  const assetSources = [], assetSeen = new Set()
  for (const [kind, entries] of [['figure', structure.figures], ['table', structure.tables], ['formula', structure.formulas]]) {
    const labelCounts = new Map()
    for (const entry of Array.isArray(entries) ? entries : []) if (compact(entry && entry.label)) {
      const label = compact(entry.label).toLowerCase()
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
    }
    for (const [assetIndex, entry] of (Array.isArray(entries) ? entries : []).entries()) {
      if (!entry || typeof entry !== 'object') continue
      const quote = string(kind === 'formula' ? entry.text || entry.quote : entry.caption || entry.text || entry.quote).trim()
      const anchor = reliableAnchor(kind === 'formula' ? entry.anchor : entry.captionAnchor || entry.anchor, documentId)
      if (!quote || !anchor || matchKey(anchor.quote) !== matchKey(quote) || !verified(quote, kind === 'formula' ? 2 : 12)) { counts.unverifiedAssets += 1; continue }
      const pattern = labelPattern(entry.label, kind)
      const mentions = (Array.isArray(entry.mentions) ? entry.mentions : []).filter(mention => mention && (!mention.matchStatus || mention.matchStatus === 'matched') && (!Array.isArray(mention.candidateCaptionIds) || mention.candidateCaptionIds.length === 1 && mention.candidateCaptionIds[0] === entry.id) && reliableAnchor(mention.anchor, documentId) && matchKey(mention.anchor.quote) === matchKey(string(mention.text || mention.quote)) && verified(string(mention.text || mention.quote)))
      const uniqueLabel = labelCounts.get(compact(entry.label).toLowerCase()) === 1
      const samePage = (paragraph, target) => pageOf(paragraph) == null || pageOf(paragraph) === pageOf(target)
      const lineOwners = new Map(mentions.map(mention => [mention, sourceLineOwner(mention)]))
      const owner = groups.find(group => group.verifiedParagraphs.some(({ paragraph, raw }) => matchKey(raw).includes(matchKey(quote)) && samePage(paragraph, { anchor }) || uniqueLabel && pattern && pattern.test(raw) || mentions.some(mention => samePage(paragraph, mention) && matchKey(raw).includes(matchKey(string(mention.text || mention.quote))))))
        || groups.find(group => mentions.some(mention => lineOwners.get(mention) === group))
      if (!owner) continue
      const key = kind + ':' + matchKey(quote)
      if (assetSeen.has(key)) continue
      assetSeen.add(key)
      const id = string(entry.id) || string(entry.anchorId) || kind + '-' + assetIndex
      const label = compact(entry.label) || (kind === 'figure' ? '图题注' : kind === 'table' ? '表题注' : '原文公式')
      const base = { documentId, assetId: id, assetLabel: label, sectionId: sectionId(owner.section), sectionAnchorId: string(owner.section.anchorId) || null,
        sectionTitle: string(owner.section.heading), identity: '作者原文', origin: 'paper', relation: '本章正文提及', sectionOrder: owner.order }
      const mention = mentions.find(value => owner.verifiedParagraphs.some(({ paragraph, raw }) => samePage(paragraph, value) && matchKey(raw).includes(matchKey(string(value.text || value.quote)))) || lineOwners.get(value) === owner)
      const captionLocation = { documentId, assetId: id, quote, text: quote, anchor, page: anchor.page,
        sourceKind: kind === 'formula' ? 'formula' : kind + '-caption', anchorScope: kind === 'formula' ? 'original-formula' : 'original-caption' }
      const preferredLocation = mention ? { documentId, assetId: id, quote: string(mention.text || mention.quote).trim(), text: string(mention.text || mention.quote).trim(),
        anchor: mention.anchor, page: pageOf(mention), sourceKind: kind + '-mention', anchorScope: 'original-body-mention' } : null
      // Default chart navigation should return to the sentence that cites it.
      // Its physical caption and linearized cells retain independent anchors.
      if (mention) assetSources.push({ ...base, ...preferredLocation, id: string(mention.id) || id + '-mention',
        relation: '正文提及句', captionLocation })
      assetSources.push({ ...base, ...captionLocation, id, quote, text: quote,
        regionStatus: kind === 'formula' ? 'formula-text' : 'caption-only', graphicRegion: null, preferredLocation, captionLocation })
      if (kind === 'table' && entry.content && entry.content.sourceKind === 'table-content-linearized') {
        const content = entry.content, contentQuote = string(content.text || content.quote).trim()
        const contentAnchor = reliableAnchor(content.anchor, documentId)
        if (contentQuote && contentAnchor && verified(contentQuote) && matchKey(contentAnchor.quote) === matchKey(contentQuote) &&
            contentAnchor.page === anchor.page && content.layout === 'pdf-text-order' && content.columnsVerified === false) {
          assetSources.push({ ...base, id: string(content.id) || id + '-content', quote: contentQuote, text: contentQuote,
            anchor: contentAnchor, page: contentAnchor.page, sourceKind: 'table-content', anchorScope: 'original-table-text',
            relation: '本章正文提及的表格线性文字', layout: 'pdf-text-order', columnsVerified: false,
            regionStatus: 'text-line-fragments', graphicRegion: null, preferredLocation, captionLocation })
        } else counts.unverifiedAssets += 1
      }
    }
  }
  if (!body.length && !assetSources.length) return empty(counts.unmatchedParagraphs ? '本章段落未能在当前论文全文中核对，没有可用作者原文来源。' : '本章没有可用正文或公式来源，未用其他章节替代。')
  const assets = assetSources.slice(0, Math.min(MAX_ASSET_SOURCES, Math.max(0, MAX_SOURCES - Math.min(16, body.length))))
  const selectedBody = fairSources(groups, MAX_SOURCES - assets.length)
  const selected = [...selectedBody, ...assets]
  const coveredSections = new Set(selectedBody.map(source => source.sectionId))
  const omittedSections = groups.filter(group => group.sources.length && !coveredSections.has(sectionId(group.section))).map(group => sectionId(group.section))
  const outline = descendants.slice(0, 32).map(section => '- ' + sectionId(section).slice(0, 80) + ' · ' + compact(section.heading).slice(0, 180)).join('\n')
  const prefix = '【本篇当前章节】\n' + compact(paper.title).slice(0, 240) + '\n' + compact(root.heading).slice(0, 240) + '\n'
    + '仅以以下已核对原文讲解本章及其子节。C编号只能指向本次提供的来源；不能把其他章节、AI建议或未给出的公式写成本章事实。图表优先引用正文提及句，默认返回正文引用位置；题注位置另作补充入口，不代表图像区域坐标。表格线性文字未恢复二维列对应，不能把相邻数字擅自解释成某一行或列的结果；须结合作者正文核对。公式来源可能是PDF线性提取，须结合相邻原文核对上下标与分式；不能确定的二维结构不得猜补。\n'
    + '原文行片段逐行核对，但不代表连续作者原句；不得把标签之间重排、拼接成作者原段落，不得据公式碎片猜补公式。\n'
    + '【本章层级】\n' + outline + (descendants.length > 32 ? '\n（其余小节见结构，不在本次列出）' : '') + '\n\n【已核对原文】'
  const typeLabels = { 'paragraph-line-fragments': '原文行片段（非连续原句，未重建段落）', paragraph: '正文', 'figure-caption': '图题注', 'table-caption': '表题注', 'table-content': '表格线性文字（列对应未核对）', formula: '原文公式', 'figure-mention': '正文提图', 'table-mention': '正文提表', 'formula-mention': '正文提公式' }
  const headers = selected.map((source, index) => '[C' + (index + 1) + '] ' + (typeLabels[source.sourceKind] || '原文') + (source.assetLabel ? ' · ' + compact(source.assetLabel).slice(0, 120) : '') + ' · ' + compact(source.sectionTitle).slice(0, 160)
    + (source.page == null ? ' · 页码待核对' : ' · 第 ' + (source.page + 1) + ' 页') + '\n')
  const overhead = prefix.length + headers.reduce((sum, header) => sum + header.length + 2, 0)
  const budgets = quoteBudgets(selected.map(source => (source.text || source.quote).length), MAX_CONTEXT_CHARS - overhead)
  const sources = [], parts = [prefix]
  let clipped = false
  for (const [index, candidate] of selected.entries()) {
    if (candidate.sourceKind === 'paragraph-line-fragments') {
      const kept = []; let used = 0
      for (const line of candidate.lineFragments) {
        const entry = '【原文行 ' + (kept.length + 1) + '】' + line.quote
        const cost = entry.length + (kept.length ? 1 : 0)
        if (used + cost > budgets[index]) break
        if (!verified(line.quote, 12)) continue
        kept.push(line); used += cost
      }
      if (!kept.length) continue
      const first = kept[0], quote = first.quote, text = kept.map((line, i) => '【原文行 ' + (i + 1) + '】' + line.quote).join('\n')
      const partial = kept.length < candidate.lineFragments.length
      clipped ||= partial
      sources.push({ ...candidate, sourceId: 'C' + (index + 1), quote, text, lineFragments: kept,
        quoteVerified: true, excerpted: true, locationStatus: 'located',
        sourceLabel: candidate.sectionTitle + ' · 原文行片段 · 第 ' + (candidate.page + 1) + ' 页' })
      parts.push(headers[index] + text)
      continue
    }
    const quote = exactClip(candidate.quote, budgets[index])
    if (!quote || !verified(quote, candidate.sourceKind === 'formula' ? 2 : 12)) continue
    const partial = quote !== candidate.quote
    if (partial) clipped = true
    const sourceId = 'C' + (index + 1)
    const sourceLabel = [candidate.assetLabel || candidate.sectionTitle || '原文', candidate.page == null ? '' : '第 ' + (candidate.page + 1) + ' 页'].filter(Boolean).join(' · ')
    sources.push({ ...candidate, sourceId, quote, text: quote, sourceLabel, quoteVerified: true, excerpted: partial || candidate.chunkCount > 1,
      locationStatus: candidate.anchor ? 'located' : 'text-only' })
    parts.push(headers[index] + quote)
  }
  const omittedPassages = Math.max(0, body.length - selectedBody.length)
  if (counts.unmatchedParagraphs) warnings.push(counts.unmatchedParagraphs + ' 个结构段落未能作为连续原句核对；仅保留另行逐行核对的原文行片段，其他已排除。')
  if (counts.skippedFragments) warnings.push(counts.skippedFragments + ' 个短片段或公式碎片未作为正文解释来源。')
  if (omittedPassages || clipped) warnings.push('本章超出单次上下文或来源数量预算，已按小节分配并抽取原文；不能声称覆盖全部细节。')
  if (omittedSections.length) warnings.push(omittedSections.length + ' 个小节未进入本次预算，请分别阅读。')
  if (assetSources.length > assets.length) warnings.push('本章图表或公式来源较多，仅列出本次预算内的相关来源。')
  const resultText = parts.join('\n\n')
  const complete = !omittedPassages && !clipped && !counts.unmatchedParagraphs && !counts.skippedFragments && !omittedSections.length && assetSources.length <= assets.length
  return { documentId, status: complete ? 'ready' : 'partial', chapter: { ...chapterMeta, coveredSectionIds: [...coveredSections], omittedSectionIds: omittedSections },
    sources, text: resultText, limits: { ...limits, contextChars: resultText.length, complete, bodyPassagesAvailable: body.length, bodyPassagesIncluded: selectedBody.length,
      assetSourcesAvailable: assetSources.length, assetSourcesIncluded: assets.length, unmatchedParagraphs: counts.unmatchedParagraphs, skippedFragments: counts.skippedFragments, ignoredPageNumbers: counts.ignoredPageNumbers }, warnings }
}
