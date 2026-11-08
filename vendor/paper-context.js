/* Source-bound paper context for local chat. No I/O and no model calls. */
const MAX_CONTEXT_CHARS = 14000
const MAX_SOURCES = 7
const MAX_REFERENCES = 8
const MAX_RESEARCH_TEXT_CHARS = 1000000
const MAX_RESEARCH_PAGES = 2000
const REFERENCE_HEADING = /^\s*(?:(?:\d+(?:\.\d+)*[.)]?)\s+)?(?:references|bibliography|works cited|参\s*考\s*文\s*献)\s*$/gim
const YEAR_PATTERN = '(?:19|20)\\d{2}[a-z]?'
const CODE_REFERENCE = /^\[([A-Za-z]{1,8}\d{1,4}[a-z]?)\]/
const STOP = new Set(('this that these those there their with from into than then them they which what when where would could should about paper article study research work find original please show explain result results method methods model models 这个 那个 这篇 论文 文献 请问 请帮 帮我 什么 为什么 怎么 如何 一下 这里 那里 这些 那些 本文 原文 找到 查找 解释 分析 是否 可以 一个 主要 进行 相关').split(/\s+/))
const INTENT_TERMS = [
  [/局限|不足|缺点|限制|边界|limitations?|drawbacks?/i, ['limitation', 'limitations', 'constraint', 'failure', 'future work']],
  [/方法|原理|结构|架构|method|architecture|mechanism/i, ['method', 'approach', 'architecture', 'algorithm', 'encoder', 'decoder']],
  [/改进|改良|优化|提升空间|改造|improv(?:e|ement)|optimi[sz]/i, ['improvement', 'improvements', 'future research', 'future work', 'still rely', 'limitation', 'method', 'ablation']],
  [/验证|检验|方案|复现|对照|消融|指标|可执行|validation|verification|reproduc|ablation/i, ['experimental setup', 'evaluation', 'baseline', 'ablation', 'metric', 'validation', 'results', 'dataset']],
  [/贡献|创新|新颖|novel|contribution/i, ['contribution', 'novel', 'introduce', 'propose']],
  [/实验|性能|结果|比较|experiment|performance|comparison/i, ['experiment', 'evaluation', 'performance', 'benchmark', 'result']],
  [/数据|训练|dataset|training/i, ['dataset', 'data', 'training', 'pretraining', 'fine-tuning']],
  [/显著性|误报|虚警|可信区间|置信区间|不确定性/, ['significance', 'false alarm', 'credible interval', 'confidence interval', 'posterior', 'uncertainty', 'median']],
  [/效应量|样本量|可重复性/, ['effect size', 'sample size', 'replicability', 'regression', 'both predictors', 'joint model']],
  [/物种|菌种|菌株|跨种|不同生物/, ['species', 'strain', 'another', 'other species', 'taxa', 'cross-species', 'host range']],
  [/压力源|暴露|脆弱性|累积风险/, ['stressor', 'exposure', 'vulnerability', 'intensity', 'cumulative impact']],
  [/如何构成|如何计算|如何汇总|怎么计算|计算公式/, ['calculated', 'estimated', 'product of', 'summing', 'sum across']],
  [/定理|引理|推论|证明|上界/, ['theorem', 'lemma', 'corollary', 'proof', 'upper bound', 'proposition']],
  [/预测|forecast|prediction/i, ['forecast', 'forecasting', 'prediction']],
  [/总结|概述|介绍|主旨|问题|summary|overview|objective/i, ['abstract', 'introduction', 'conclusion', 'objective', 'aim']],
]

function compact(value) { return String(value || '').replace(/\s+/g, ' ').trim() }
function cleanText(value, max = 400000) { return String(value || '').replace(/\u0000/g, '').slice(0, max) }
function keyOf(value) { return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f\s\u00ad\-‐‑–—−'’]/g, '').toLowerCase() }
function hash(value) { let n = 2166136261; for (const char of String(value || '')) n = Math.imul(n ^ char.charCodeAt(0), 16777619); return (n >>> 0).toString(36) }
function keyMap(value) {
  const raw = String(value || ''), map = []
  let key = ''
  for (let i = 0; i < raw.length; i += 1) {
    const part = raw[i].normalize('NFKD').replace(/[\u0300-\u036f\s\u00ad\-‐‑–—−'’]/g, '').toLowerCase()
    for (const char of part) { key += char; map.push(i) }
  }
  return { key, map }
}
function searchText(value) { return compact(String(value || '').normalize('NFKC').replace(/\u00ad\s*/g, '').replace(/([\p{L}])-\s+([\p{L}])/gu, '$1$2').replace(/[\u200b-\u200f\u2060\ufeff]/g, '')).toLowerCase() }
function currentHistory(history, paperId) {
  return (Array.isArray(history) ? history : []).slice(-6).filter((item) => item && typeof item === 'object' && (!item.paperId || item.paperId === paperId) && (!item.documentId || item.documentId === paperId))
}
function researchIntent(question, history, paperId) {
  const previous = currentHistory(history, paperId).filter((item) => !item.role || item.role === 'user').map((item) => item.question || item.content || item.text || '').join(' ')
  const continuation = /整理|方案|验证|继续|刚才|上面|上述|这些|这个|下一步|plan|validat|continue/i.test(question)
  const value = question + (continuation ? ' ' + previous : '')
  const improvement = /改进|改良|优化|提升空间|改造|improv(?:e|ement)|optimi[sz]/i.test(value)
  const validation = /验证|检验|方案|复现|对照|消融|指标|可执行|validation|verification|reproduc|ablation/i.test(question)
  const limitation = /局限|不足|缺点|限制|边界|未解决|limitations?|drawbacks?/i.test(value)
  const method = improvement || validation || /方法|原理|结构|架构|method|architecture|mechanism/i.test(value)
  const results = improvement || validation || /实验|性能|结果|比较|experiment|performance|comparison/i.test(value)
  return { improvement, validation, limitation, method, results, research: improvement || validation || limitation }
}
const OWN_LIMIT = /(?:does? still rely|still rel(?:y|ies)|still requires?|remain(?:s)? dependent|limited (?:to|by)|limitations? (?:of|in) (?:our|this|the proposed)|(?:our|this|the current|the proposed) (?:model|method|approach|framework|system).{0,90}(?:cannot|unable|fails? to|does not support|lacks?)|unfair advantage|only possible because|we (?:cannot|do not yet (?:support|model|consider|include)|have not yet (?:evaluated|tested|considered|included|addressed)))/i
// Generic own-method Chinese constraint cues, not title/page-specific.
function chineseOwnLimitation(value, closing) {
  const clauses = value.split(/[。！？;；]/);
  return clauses.some(clause => {
    const subject = clause.match(/本文|本研究|本方法|本模型|本系统|本框架|我们/);
    if (!subject) return false;
    const tail = clause.slice(subject.index + subject[0].length, subject.index + subject[0].length + 180);
    const cue = /(?:仍|尚|还).{0,8}(?:不够|不足|有限|基础|简化|依赖)|尚未|未(?:能|考虑|建模|验证|解决|覆盖)|难以|无法|不能|依赖.{0,6}(?:经验|实验规律)|使用.{0,6}(?:实验规律|经验公式)/.exec(tail);
    if (!cue || /已有|现有|传统|前人|相关工作/.test(tail.slice(0, cue.index))
        || /(?:并非|并不|不是|不再|不必|无需|无须|不需要|不)$/.test(tail.slice(0, cue.index))) return false;
    return closing || /本(?:方法|模型|系统|框架)|我们/.test(subject[0]);
  });
}
const FUTURE_WORK = /improvements? are possible|future (?:research|work|studies?)|could be extended|(?:we|research) (?:plan|will focus)|will be further|further (?:research|work)|后续研究|未来工作|未来研究|后续工作/i
const OUTCOME = /outperform|outperformed|reduces?|reduced|improv(?:es|ed)|achieves?|we (?:find|found|observe)|shows? that|better than|error reduction|performance gains|显著提高|实验表明|优于|降低/i
const BACKMATTER = /^(?:keywords?\s*[:：]|authors?[’']? contributions?\b|author contributions?\b|acknowledg(?:e)?ments?\b|abbreviations?\b|funding\b|competing interests?\b|declarations\b|publisher[’']s note\b|关键词|作者贡献|致谢|基金资助)/i
function evidenceFeatures(source) {
  const value = searchText(source.text), heading = searchText(source.sectionTitle || source.section).replace(/^(?:[a-z]|\d+)(?:\.\d+)*[.)]?\s+/i, '')
  const closing = /discussion|conclusion|limitations?|future work|讨论|结论|局限/.test(heading)
  const methodHeading = /^(?:materials and )?methods?$|methodology|approach|architecture|optimization|模型|方法|encoder|decoder|backbone|framework/.test(heading)
  const resultHeading = /results?|ablation|comparison|sensitivity|结果|消融/.test(heading)
  const setupHeading = /experimental setup|experiment settings?|training methods|datasets?|setup|训练|数据集|实验设置/.test(heading)
  const ownLimit = chineseOwnLimitation(value, closing) || /limitations?|局限/.test(heading) && /limitations?|lack|cannot|fail|limited|requires?|无法|受限|局限/.test(value) || OWN_LIMIT.test(value) && (closing || /(?:our|this|current|proposed) (?:model|method|approach|framework|system)|we (?:cannot|do not yet|have not yet)/i.test(value))
  const future = closing && FUTURE_WORK.test(value)
  const background = /introduction|related|background|引言|绪论|相关工作/.test(heading)
  const caption = source.sourceKind === 'figure-caption' || source.sourceKind === 'table-caption'
  const tokens = value.match(/[a-z]{2,}/g) || []
  const prose = tokens.length >= 14 && value.length >= 100 || (value.match(/[\u3400-\u9fff]/g) || []).length >= 30 && value.length >= 60
  const dense = (value.match(/\d/g) || []).length > Math.max(35, value.length * .11)
  return {
    methods: (methodHeading ? 5 : 0) + (/(?:encoder|decoder|backbone|framework|algorithm|architecture|we propose|our model|proposed method|proposed approach)/.test(value) ? 2 : 0),
    results: (resultHeading ? 5 : /verification|evaluation|评估|验证/.test(heading) ? 2 : 0) + (OUTCOME.test(value) ? 3 : 0) + (OUTCOME.test(value) && /\d/.test(value) ? 1 : 0),
    setup: (setupHeading ? 5 : 0) + (/baseline|evaluation protocol|control(?:led)? experiment|iterations?|learning rate|batch size/.test(value) ? 2 : 0),
    limitations: ownLimit ? 12 : future ? 10 : closing && /limitation|cannot|remains? challenging|bottleneck/.test(value) ? 5 : 0,
    ownLimit, future, background, caption, prose, dense,
  }
}
function selectionInfo(selection) {
  if (selection && typeof selection === 'object') return { ...selection, text: cleanText(selection.text || selection.quote || '', 4000), context: cleanText(selection.context || selection.surroundingText || '', 4000) }
  return { text: cleanText(selection, 4000), context: '' }
}
function referenceRegions(text, structure) {
  const headings = Array.from(text.matchAll(REFERENCE_HEADING))
  const otherHeads = (structure && structure.sections || []).map((section) => compact(section.heading)).filter((heading) => heading && !/^(?:references|bibliography|参\s*考\s*文\s*献)$/i.test(heading))
  return headings.map((heading, i) => {
    const start = heading.index, contentStart = start + heading[0].length
    let end = i + 1 < headings.length ? headings[i + 1].index : text.length
    const explicit = text.slice(contentStart, end).match(/^\s*(?:Appendix(?:\s+[A-Z])?\b[^\n]*|Supplementary(?:\s+(?:material|information|appendix))\b[^\n]*|附录[^\n]*)$/im)
    if (explicit) end = contentStart + explicit.index
    for (const title of otherHeads) {
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const hit = text.slice(contentStart, end).match(new RegExp('^\\s*' + escaped + '\\s*$', 'm'))
      if (hit) end = Math.min(end, contentStart + hit.index)
    }
    return { start, contentStart, end }
  }).filter((region) => region.end > region.contentStart)
}
function splitReferenceBlock(raw) {
  const entries = []
  let current = []
  const push = () => { const text = compact(current.join(' ')); if (text.length >= 20) entries.push({ raw: text, segmentationConfidence: 'medium', origin: 'paper-text' }); current = [] }
  for (const line of String(raw || '').split(/\r?\n/)) {
    const value = line.trim()
    if (!value || /^\d{1,3}$/.test(value)) continue
    const numbered = /^\[\d{1,3}\]\s*\S|^\d{1,3}[.)]\s+\S/.test(value)
    const named = /^[\p{L}'’\-]+(?:\s+[\p{L}'’\-]+){0,2},\s*[A-Z]\./u.test(value) || /^(?:[A-Z][A-Z0-9&.\-]{1,30}|[A-Z][a-z]+[A-Z][A-Za-z]*):\s*\S/.test(value) || /^[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*){0,4}\s+(?:Organization|University|Institute|Agency|Centre|Center|Office|Service|Council|Administration|Group|Committee|Corporation):/.test(value)
    if (numbered || (named && !/[,，]$/.test(current[current.length - 1] || ''))) { if (current.length) push(); current.push(value) }
    else if (current.length) current.push(value)
  }
  if (current.length) push()
  return entries
}
function firstAuthor(raw) {
  const text = compact(raw).replace(/^\[\d+\]\s*|^\d+[.)]\s*/, '')
  let hit = text.match(/^([\p{L}'’\-]+(?:\s+[\p{L}'’\-]+){0,2}),\s*(?:[A-Z]\.\b|[A-Z]\.)/u)
  if (hit) return hit[1]
  hit = text.match(/^([A-Z][A-Za-z0-9&.\-]{1,30}):/) || text.match(/^([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*){0,4}\s+(?:Organization|University|Institute|Agency|Centre|Center|Office|Service|Council|Administration|Group|Committee|Corporation)):/)
  if (hit) return hit[1]
  hit = text.match(/^([\p{Script=Han}]{2,4})(?:[,，、]|等|\s)/u)
  if (hit) return hit[1]
  const authorPart = text.split(/\s+(?:and|&)\s+|,(?!\s*[A-Z]\.)/i)[0].split(/\.\s+(?=(?:19|20)\d{2})/)[0]
  const names = authorPart.match(/[\p{L}'’\-]+/gu) || []
  if (names.length >= 2 && names.length <= 5 && /^[A-Z]/.test(names[0])) return names[names.length - 1]
  return ''
}
function cleanDoi(raw) {
  const hit = String(raw || '').match(/10\.\d{4,9}\/[^\s<>"]+/i)
  if (!hit) return ''
  let doi = hit[0].replace(/[.,;:]+$/, '')
  while ((doi.endsWith(')') && (doi.match(/\)/g) || []).length > (doi.match(/\(/g) || []).length) || doi.endsWith(']')) doi = doi.slice(0, -1)
  return doi
}
function originalLinks(entry) {
  const links = []
  const add = (kind, label, url, origin) => { if (url && !links.some((link) => link.url === url)) links.push({ kind, label, url, origin, availabilityVerified: false }) }
  const raw = cleanText(entry.raw, 4000)
  const doi = cleanDoi(entry.doi || raw)
  if (doi) add('doi', 'DOI 出版页', 'https://doi.org/' + encodeURIComponent(doi).replace(/%2F/gi, '/'), 'reference-entry')
  const arxivText = [entry.arxiv || '', raw].join(' ')
  const arxiv = arxivText.match(/\barxiv(?:\.org\/(?:abs|pdf)\/|:\s*)(\d{4}\.\d{4,5}(?:v\d+)?|[a-z-]+(?:\.[A-Z]{2})?\/\d{7}(?:v\d+)?)/i) || String(entry.arxiv || '').match(/^(\d{4}\.\d{4,5}(?:v\d+)?|[a-z-]+(?:\.[A-Z]{2})?\/\d{7}(?:v\d+)?)$/i)
  if (arxiv) add('arxiv', 'arXiv 原文页', 'https://arxiv.org/abs/' + arxiv[1], 'reference-entry')
  const givenUrls = [entry.url, ...(Array.isArray(entry.urls) ? entry.urls : [])].filter(Boolean)
  const extracted = raw.replace(/(https?):\s*\/\//gi, '$1://').match(/https?:\/\/[^\s<>"]+/gi) || []
  for (const rawUrl of [...givenUrls, ...extracted]) {
    let url = String(rawUrl).trim().replace(/[.,;:]+$/, '')
    while ((url.endsWith(')') && (url.match(/\)/g) || []).length > (url.match(/\(/g) || []).length) || url.endsWith(']')) url = url.slice(0, -1)
    if (!/^https?:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(url) || /[\u0000-\u001f]/.test(url)) continue
    if (/^https?:\/\/(?:dx\.)?doi\.org\//i.test(url) && doi) continue
    if (/^https?:\/\/arxiv\.org\/(?:abs|pdf)\//i.test(url) && arxiv) continue
    add('original-url', '参考文献中的原文入口', url, 'reference-entry')
  }
  if (!links.length) add('search', '检索原文（Google Scholar）', 'https://scholar.google.com/scholar?q=' + encodeURIComponent(raw.slice(0, 450)), 'search-query')
  return links.slice(0, 5)
}
function parseReferences(text, structure, paperId, regions, trustedStructure) {
  let entries = structure && Array.isArray(structure.references) ? structure.references : []
  const textKey = !trustedStructure ? keyOf(text) : ''
  if (entries.length && !trustedStructure) entries = entries.filter((entry) => { const raw = keyOf(entry.raw || entry.text || ''); return raw.length >= 20 && textKey.includes(raw) })
  if (!entries.length) entries = regions.flatMap((region) => splitReferenceBlock(text.slice(region.contentStart, region.end)))
  const refs = [], seen = new Set(), workIds = new Set()
  for (const entry of entries.slice(0, 600)) {
    if (!entry || typeof entry !== 'object') continue
    const raw = compact(entry.raw || entry.text || entry.quote).slice(0, 2400)
    if (raw.length < 16) continue
    const rawKey = keyOf(raw)
    if (seen.has(rawKey)) continue
    seen.add(rawKey)
    const numberHit = raw.match(/^\[(\d{1,3})\]\s*|^(\d{1,3})[.)]\s+/)
    const number = numberHit ? String(Number(numberHit[1] || numberHit[2])) : entry.number != null && /^\d{1,3}$/.test(String(entry.number)) ? String(Number(entry.number)) : ''
    const code = entry.segmentation === 'alphanumeric' ? CODE_REFERENCE.exec(raw)?.[0] : null
    const providedYear = String(entry.year || '')
    const year = /^(?:19|20)\d{2}[a-z]?$/.test(providedYear) ? providedYear : (raw.match(/\b(?:19|20)\d{2}[a-z]?\b/) || [''])[0]
    const author = firstAuthor(raw)
    const doi = cleanDoi(entry.doi || raw)
    const arxiv = raw.match(/arxiv[:/\s]*(\d{4}\.\d{4,5})(?:v\d+)?/i)
    const workKey = !number && (doi ? 'doi:' + doi.toLowerCase() : arxiv ? 'arxiv:' + arxiv[1] : '')
    if (workKey && workIds.has(workKey)) continue
    if (workKey) workIds.add(workKey)
    const anchor = trustedStructure && entry.anchor && entry.anchor.documentId === paperId ? entry.anchor : null
    const reference = { id: String(entry.id || 'ref-' + hash(rawKey)), documentId: paperId || '', number, label: code || (number ? '[' + number + ']' : [author, year].filter(Boolean).join(' · ')), ...(code ? { code: code.toLowerCase() } : {}), raw, text: raw, year, author, authorKey: keyOf(author), doi, anchor, page: anchor ? anchor.page : null, segmentationConfidence: entry.segmentationConfidence || '', origin: entry.origin || (trustedStructure ? 'document-structure' : 'paper-text') }
    reference.links = originalLinks({ ...entry, raw, doi })
    refs.push(reference)
  }
  return refs
}
function expandNumbers(raw) {
  const out = []
  for (const part of String(raw || '').split(/[,，;；]/)) {
    const range = part.trim().match(/^(\d{1,3})\s*[-–—−－]\s*(\d{1,3})$/)
    if (range) {
      const a = Number(range[1]), b = Number(range[2])
      if (a < 1 || b < a || b - a > 20) return []
      for (let n = a; n <= b; n += 1) out.push(String(n))
    } else if (/^\s*\d{1,3}\s*$/.test(part) && Number(part) > 0) out.push(String(Number(part)))
    else return []
  }
  return Array.from(new Set(out)).slice(0, 30)
}
function authorQueries(raw) {
  const out = []
  const normalized = compact(raw).replace(/^[[(（]|[\])）]$/g, '')
  let cursor = 0
  let previousAuthor = ''
  for (const yearHit of normalized.matchAll(new RegExp('\\b' + YEAR_PATTERN + '(?![a-z\\d])', 'g'))) {
    const prefix = normalized.slice(cursor, yearHit.index).replace(/^[,，;；:\s]+/, '').replace(/[,，:(（\s]+$/, '')
    cursor = yearHit.index + yearHit[0].length
    const author = prefix ? prefix.replace(/\s+et\s+al\.?$/i, '').replace(/等$/, '').split(/[,，]|\s+(?:and|&)\s+/i)[0].trim() : previousAuthor
    if (!/^(?:[A-ZÀ-ÖØ-Þ][\p{L}'’\-]+(?:\s+[\p{L}'’\-]+){0,3}|[\p{Script=Han}]{2,4})$/u.test(author)) continue
    previousAuthor = author
    out.push({ kind: 'author-year', author, authorKey: keyOf(author), year: yearHit[0], label: author + ' ' + yearHit[0] })
    const suffixTail = normalized.slice(cursor).match(/^\s*[,，]\s*([a-z])(?=[,，;；\s\])）]|$)/)
    if (suffixTail) { out.push({ kind: 'author-year', author, authorKey: keyOf(author), year: yearHit[0].slice(0, 4) + suffixTail[1], label: author + ' ' + yearHit[0].slice(0, 4) + suffixTail[1] }); cursor += suffixTail[0].length }
  }
  return out
}
function hasMathOrQuantityContext(text, selection) {
  const normalized = compact(text)
  const escaped = String(selection || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (!escaped) return false
  const near = new RegExp('(?:' + escaped + ')\\s*(?:GPUs?|CPUs?|cores?|GB|MB|TB|卡|块|张|个|次|小时|分钟|层|维|维度|参数|样本|设备|节点)|(?:GPU|CPU|数量|维度|参数|样本|页码|第|page|index|indices|array|tensor|vector|matrix)[^。.!?]{0,16}(?:' + escaped + ')', 'i')
  return near.test(normalized) || /(?:\b\w|[=+*/^])\s*\[\s*\d+(?:\s*[,，]\s*\d+)*\s*\]|\[\s*\d+\s*\]\s*=/.test(normalized)
}
function referenceQueries(selection, question, paperText, references) {
  const chosen = compact(selection.text).normalize('NFKC')
  const query = compact(question).normalize('NFKC')
  const explicit = /参考文献|引文|引用(?:的)?(?:文献|论文|条目|编号|序号)|文献(?:编号|序号)|\b(?:citation|reference)s?\b/i.test(query)
  const contextual = compact(selection.context || [selection.before || '', chosen, selection.after || ''].join(' ')).normalize('NFKC')
  const contextVerified = contextual.length >= chosen.length + 2 && keyOf(paperText).includes(keyOf(contextual))
  const metadataCitation = selection.kind === 'citation' || selection.kind === 'reference' || selection.isCitation === true
  const numericChosen = chosen.replace(/^\[\s*|\s*\]$/g, '')
  const contextCitation = contextVerified && new RegExp('\\[\\s*' + numericChosen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\]').test(contextual)
  const queries = []
  let bareUncertain = false
  const addNumbers = (raw, basis) => { for (const number of expandNumbers(raw)) queries.push({ kind: 'number', number, label: '[' + number + ']', basis }) }
  const before = String(selection.before || '').slice(-55).normalize('NFKC')
  const after = String(selection.after || '').slice(0, 55).normalize('NFKC')
  const indexPrefix = /^\[/.test(chosen) ? before : before.replace(/\[\s*$/, '')
  const adjacentIdentifier = /(?:(?!\p{Script=Han})[\p{L}\p{N}_])$/u.test(indexPrefix)
  const directIndex = (adjacentIdentifier && (/^\[/.test(chosen) || indexPrefix !== before))
    || /\b(?:array|vector|tensor|matrix|indices|index|shape|coordinates?)\s*(?:\[\s*)?$/i.test(before)
  const directQuantity = /^\d{1,3}$/.test(chosen) && /^\s*(?:GPUs?|CPUs?|cores?|GB|MB|TB|卡|块|张|个|次|小时|分钟|层|维|参数|样本|设备|节点)\b/i.test(after)
  const mathContext = contextVerified && (directIndex || directQuantity || (!contextCitation && hasMathOrQuantityContext(contextual, chosen)))
  if (!mathContext || explicit || metadataCitation) {
    for (const hit of chosen.matchAll(/\[\s*(\d{1,3}(?:\s*[-–—−－,，;；]\s*\d{1,3})*)\s*\]/g)) addNumbers(hit[1], '选区具有引文括号格式')
    if (/^\d{1,3}$/.test(chosen)) {
      if (explicit || metadataCitation || contextCitation) addNumbers(chosen, explicit ? '问题明确提及参考文献' : metadataCitation ? '选区来自引文导航' : '当前论文中的选区上下文含引文括号')
      else if (/原文|原始论文|source|original|paper|full.?text/i.test(query)) bareUncertain = true
    }
    if (metadataCitation && selection.referenceNumber != null) addNumbers(String(selection.referenceNumber), '选区来自引文导航')
    if (chosen.length < 300 && (/(?:19|20)\d{2}/.test(chosen) && (/[[(（]/.test(chosen) || /et\s+al\.?|[,，]\s*(?:19|20)\d{2}/i.test(chosen) || metadataCitation))) queries.push(...authorQueries(chosen))
  }
  for (const hit of query.matchAll(/(?:参考文献|引用(?:的)?(?:文献|论文|条目|编号|序号)|引文|文献(?:编号|序号)|references?|citations?)\s*(?:第|编号|序号|#)?\s*([\[［(（]?)\s*(\d{1,3}(?:\s*[-–—−－,，;；]\s*\d{1,3})*)/gi)) {
    addNumbers(hit[2], '问题明确指定参考文献编号')
    if (!hit[1]) continue
    let rest = query.slice(hit.index + hit[0].length)
    let next
    while ((next = rest.match(/^\s*[\]］)）]\s*(?:[,，、;；]|和|及|与|以及|\band\b|&)\s*[\[［(（]\s*(\d{1,3}(?:\s*[-–—−－,，;；]\s*\d{1,3})*)(?=\s*[\]］)）])/i))) {
      addNumbers(next[1], '问题明确指定参考文献编号')
      rest = rest.slice(next[0].length)
    }
  }
  for (const hit of query.matchAll(/第\s*(\d{1,3})\s*(?:篇|条)\s*(?:参考文献|文献|引用)/g)) addNumbers(hit[1], '问题明确指定第几篇文献')
  if (explicit) for (const group of query.matchAll(/[[(（]([^\])）]{3,300})[\])）]/g)) queries.push(...authorQueries(group[1]))
  const addCode = label => {
    const code = label.toLowerCase()
    if (references.some(ref => ref.code === code)) queries.push({ kind: 'code', code, label })
  }
  if (!mathContext || explicit || metadataCitation) {
    if (CODE_REFERENCE.exec(chosen)?.[0] === chosen) addCode(chosen)
  }
  if (explicit) for (const match of query.matchAll(/\[[A-Za-z]{1,8}\d{1,4}[a-z]?\]/g)) addCode(match[0])
  const unique = [], seen = new Set()
  for (const item of queries) { const key = item.kind === 'number' ? 'n:' + item.number : item.kind === 'code' ? 'c:' + item.code : 'a:' + item.authorKey + '/' + item.year; if (!seen.has(key)) { seen.add(key); unique.push(item) } }
  return { queries: unique, bareUncertain, mathContext: mathContext && !explicit && !metadataCitation, contextVerified, explicit }
}
function resolveReferences(refs, request) {
  const resolutions = []
  const chosen = []
  for (const query of request.queries) {
    const hasYearSuffix = query.kind === 'author-year' && /[a-z]$/.test(query.year)
    let candidates = query.kind === 'number'
      ? refs.filter(ref => ref.number === query.number)
      : query.kind === 'code' ? refs.filter(ref => ref.code === query.code)
        : refs.filter(ref => ref.authorKey === query.authorKey && (ref.year === query.year || (!hasYearSuffix && ref.year.slice(0, 4) === query.year)))
    let missingYearSuffix = false
    if (hasYearSuffix && !candidates.length) {
      candidates = refs.filter(ref => ref.authorKey === query.authorKey && ref.year === query.year.slice(0, 4))
      missingYearSuffix = candidates.length > 0
    }
    const low = candidates.length === 1 && candidates[0].segmentationConfidence === 'low'
    const status = candidates.length === 1 && !low && !missingYearSuffix ? 'matched' : candidates.length ? 'ambiguous' : 'unmatched'
    const reason = missingYearSuffix ? '参考文献条目未印年份后缀，仅列出同作者同年候选' : low ? '参考文献条目分组不稳定，需要核对' : status === 'matched' ? { number: '原始编号一致', code: '原始标识一致', 'author-year': '首位作者完整姓氏与年份后缀一致' }[query.kind] : status === 'ambiguous' ? '有多条同编号或同名同年候选，未自动选择' : '当前论文的参考文献中未找到可靠条目'
    resolutions.push({ query: query.label, status, reason, referenceIds: candidates.map((ref) => ref.id) })
    for (const ref of candidates) {
      if (!chosen.some((item) => item.id === ref.id)) chosen.push({ ...ref, matchStatus: status, matchReason: reason, query: query.label })
    }
  }
  let status = !resolutions.length ? request.mathContext ? 'not-reference' : request.bareUncertain ? 'needs-context' : 'not-requested' : resolutions.every((item) => item.status === 'matched') ? 'matched' : resolutions.some((item) => item.status === 'ambiguous') ? 'ambiguous' : resolutions.some((item) => item.status === 'matched') ? 'partial' : 'unmatched'
  const truncated = chosen.length > MAX_REFERENCES
  if (truncated && status === 'matched') status = 'partial'
  return { references: chosen.slice(0, MAX_REFERENCES), status, resolutions, truncated }
}
function chunksOf(text, max = 1100) {
  const out = []
  let value = String(text || '').trim()
  while (value.length > max) {
    let cut = value.lastIndexOf('\n', max)
    if (cut < max * .45) cut = Math.max(value.lastIndexOf('。', max), value.lastIndexOf('. ', max), value.lastIndexOf('; ', max)) + 1
    if (cut < max * .45) cut = value.lastIndexOf(' ', max)
    if (cut < max * .45) cut = max
    out.push(value.slice(0, cut).trim())
    value = value.slice(cut).trim()
  }
  if (value) out.push(value)
  return out
}
function bodyCandidates(text, structure, paperId, regions, trusted) {
  const out = [], seen = new Map(), textKey = !trusted ? keyOf(text) : ''
  const push = (raw, section, anchor, page, id, extra = {}) => {
    for (const [part, chunk] of chunksOf(raw).entries()) {
      const key = keyOf(chunk)
      if (key.length < 25 || /^(?:a1{6,})+$/i.test(key) || BACKMATTER.test(compact(chunk))) continue
      const verifiedAnchor = anchor && anchor.documentId === paperId ? anchor : null
      const metadata = { section: compact(section || ''), sectionTitle: compact(section || ''), sectionId: extra.sectionId || null,
        sourceKind: extra.sourceKind || 'paragraph', identity: '作者原文', origin: 'paper', ...extra }
      if (seen.has(key)) {
        if (extra.sourceKind === 'figure-caption' || extra.sourceKind === 'table-caption') Object.assign(seen.get(key), metadata, { id: id || seen.get(key).id, anchor: verifiedAnchor || seen.get(key).anchor })
        continue
      }
      const candidate = { id: (id || 'text-' + hash(key)) + (part ? '-' + part : ''), documentId: paperId || '', text: chunk, ...metadata,
        page: Number.isFinite(page) ? page : verifiedAnchor && Number.isFinite(verifiedAnchor.page) ? verifiedAnchor.page : null,
        anchor: verifiedAnchor, locationStatus: verifiedAnchor && verifiedAnchor.status === 'located' && verifiedAnchor.quoteVerified ? 'located' : verifiedAnchor ? 'partial' : 'unavailable', key }
      seen.set(key, candidate); out.push(candidate)
    }
  }
  if (structure && Array.isArray(structure.sections)) {
    for (const section of structure.sections) {
      if (/^(?:\d+[.)]?\s*)?(?:references|bibliography|参\s*考\s*文\s*献|table of contents|目录|declarations)(?:\s|$|[：:])/i.test(compact(section.heading))) continue
      const heading = trusted || textKey.includes(keyOf(section.heading)) ? section.heading : ''
      for (const paragraph of section.paragraphs || []) {
        const value = cleanText(paragraph.text || paragraph.quote, 30000)
        if (!trusted && !textKey.includes(keyOf(value))) continue
        push(value, heading, trusted ? paragraph.anchor : null, trusted ? paragraph.page : null, paragraph.id, { sectionId: trusted ? section.id || null : null })
      }
    }
  }
  if (trusted) for (const [kind, entries] of [['figure', structure.figures || []], ['table', structure.tables || []]]) {
    for (const entry of entries) {
      const caption = cleanText(entry.caption || '', 4000), captionKey = keyOf(caption)
      const anchor = entry.captionAnchor || entry.anchor
      if (!captionKey || !anchor || anchor.documentId !== paperId || anchor.status !== 'located' || anchor.quoteVerified !== true) continue
      const owner = (structure.sections || []).find((section) => (section.paragraphs || []).some((paragraph) => keyOf(paragraph.text).includes(captionKey)))
      const labelKey = kind === 'figure' ? 'figureLabel' : 'tableLabel'
      for (const candidate of out) {
        if (candidate.key.includes(captionKey) || (candidate.key.length > 40 && captionKey.includes(candidate.key)) || (entry.mentions || []).some((mention) => keyOf(mention.text).length > 25 && candidate.key.includes(keyOf(mention.text)))) {
          if (!candidate[labelKey]) candidate[labelKey] = compact(entry.label)
        }
      }
      push(caption, owner && owner.heading || '', anchor, entry.page, entry.id, { sectionId: owner && owner.id || null, sourceKind: kind + '-caption', [labelKey]: compact(entry.label) })
    }
  }
  if (!out.length) {
    let cursor = 0
    const pieces = []
    for (const region of regions.slice().sort((a, b) => a.start - b.start)) { if (region.start > cursor) pieces.push(text.slice(cursor, region.start)); cursor = Math.max(cursor, region.end) }
    if (cursor < text.length) pieces.push(text.slice(cursor))
    for (const piece of pieces) for (const paragraph of piece.split(/\n\s*\n/)) push(paragraph, '', null, null, null)
  }
  return out
}
function queryTerms(question, selection, history, paperId) {
  const weights = new Map()
  const add = (text, weight) => {
    for (const token of String(text || '').toLowerCase().match(/[a-z][a-z0-9-]{2,}|[\p{Script=Han}]{2,}/gu) || []) {
      if (/^[\p{Script=Han}]+$/u.test(token)) {
        if (token.length <= 4 && !STOP.has(token)) weights.set(token, Math.max(weights.get(token) || 0, weight))
        for (let i = 0; i < token.length - 1; i += 1) { const pair = token.slice(i, i + 2); if (!STOP.has(pair)) weights.set(pair, Math.max(weights.get(pair) || 0, weight * .7)) }
      } else if (!STOP.has(token)) weights.set(token, Math.max(weights.get(token) || 0, weight))
    }
  }
  add(question, 1)
  add(selection.text, .8)
  for (const item of currentHistory(history, paperId)) {
    if (item.role && item.role !== 'user') continue
    add(cleanText(item.question || item.content || item.text, 500), .25)
  }
  for (const [pattern, aliases] of INTENT_TERMS) if (pattern.test(question)) for (const term of aliases) weights.set(term, Math.max(weights.get(term) || 0, .7))
  return Array.from(weights, ([term, weight]) => ({ term, weight })).slice(0, 70)
}
const CHINESE_ORDINAL = '[一二两三四五六七八九十]+'
const SECTION_IDENTIFIER = String.raw`(?:\d+(?:\.\d+)*|[IVXLCDM]+|` + CHINESE_ORDINAL + ')'
const SIMPLE_SECTION_TARGET = String.raw`(?:(?:这篇|本篇|本|该篇|该)?论文(?:里的?|中的?|的)?\s*)?(第\s*|(?:section|part|chapter)\s+|§\s*)?(` + SECTION_IDENTIFIER + String.raw`)(\s*(?:小节|节|章|部分))?`
const SIMPLE_SECTION_PREFIX = String.raw`(?:请(?:帮我|问)?|帮我|我想知道|能(?:不能)?|(?:可不)?可以|please)?\s*`
const SIMPLE_SECTION_END = String.raw`\s*(?:吗|呢)?[\s.。?？!！]*$`
const SIMPLE_SECTION_TOPIC = String.raw`(?:主要\s*)?(?:在\s*)?(?:讲解?|介绍|说明|说|写)(?:了|的(?:是)?)?`
const SIMPLE_SECTION_QUESTIONS = [
  new RegExp('^' + SIMPLE_SECTION_PREFIX + SIMPLE_SECTION_TARGET + String.raw`[\s.:：,，]*(?:的?\s*内容\s*)?(?:` + SIMPLE_SECTION_TOPIC + String.raw`\s*|(?:意思|含义)\s*)?(?:是\s*)?(?:啥|什么)(?:内容|意思)?` + SIMPLE_SECTION_END, 'i'),
  new RegExp('^' + SIMPLE_SECTION_PREFIX + String.raw`(?:讲解?|讲讲|解释|概述|介绍|总结|说明|explain|summari[sz]e)\s*(?:一下\s*)?` + SIMPLE_SECTION_TARGET + String.raw`(?:\s*的内容)?` + SIMPLE_SECTION_END, 'i'),
]
const SECTION_REFERENCE_ALONE = new RegExp('^' + SIMPLE_SECTION_TARGET + SIMPLE_SECTION_END, 'i')
function simpleSectionQuestion(input) {
  for (const pattern of SIMPLE_SECTION_QUESTIONS) {
    const match = pattern.exec(input)
    if (match && (match[1] || match[3] || match[2].includes('.') || /^[IVXLCDM]{2,}$/.test(match[2]))) return ordinalNumber(match[2])
  }
  const explicit = SECTION_REFERENCE_ALONE.exec(input)
  return explicit && (explicit[1] || explicit[3]) ? ordinalNumber(explicit[2]) : null
}
function ordinalNumber(value) {
  if (/^\d+(?:\.\d+)*$/.test(value)) return value
  const digits = '一二三四五六七八九', chinese = value.replace(/两/g, '二')
  if (/^[一二三四五六七八九]$/.test(chinese)) return String(digits.indexOf(chinese) + 1)
  const tens = /^([一二三四五六七八九]?)十([一二三四五六七八九]?)$/.exec(chinese)
  if (tens) return String((tens[1] ? digits.indexOf(tens[1]) + 1 : 1) * 10 + (tens[2] ? digits.indexOf(tens[2]) + 1 : 0))
  const roman = value.toUpperCase(), weights = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  if (!roman || !/^M{0,4}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/.test(roman)) return null
  return String([...roman].reduce((total, char, index) => total + weights[char] * (weights[char] < (weights[roman[index + 1]] || 0) ? -1 : 1), 0))
}
function sectionNumber(heading) {
  const title = compact(heading).normalize('NFKC')
  const decimal = /^(\d+(?:\.\d+)*)(?:[.、)]?\s+|[.、)](?=\p{L})|[、)]\s*|(?=\p{Script=Han}))/u.exec(title)?.[1]
  const roman = /^([IVXLCDM]+)[.、)](?:\s|(?=\p{L}))/u.exec(title)?.[1]
  const chinese = /^第\s*([一二两三四五六七八九十百\d]+)\s*(?:部分|小节|节|章)/.exec(title)?.[1]
  return decimal || (roman || chinese ? ordinalNumber(roman || chinese) : null)
}
function requestedSection(input, structure, simpleNumber) {
  if (!Array.isArray(structure.sections)) return null
  const numbers = new Set()
  for (const pattern of [
    new RegExp(String.raw`第\s*(` + SECTION_IDENTIFIER + String.raw`)\s*(?:小节|节|章|部分)`, 'gi'),
    new RegExp(String.raw`(?:\b(?:section|part|chapter)\s+|§\s*)(` + SECTION_IDENTIFIER + String.raw`)(?![\w]|\.\d)`, 'gi'),
  ]) {
    for (const match of input.matchAll(pattern)) {
      const value = ordinalNumber(match[1])
      if (value) numbers.add(value)
    }
  }
  if (simpleNumber) numbers.add(simpleNumber)
  if (numbers.size !== 1) return null
  const [number] = numbers
  const matches = structure.sections.filter(section => sectionNumber(section.heading) === number)
  const section = matches.length === 1 && matches[0]
  if (!section?.id || structure.sections.filter(item => item.id === section.id).length !== 1) return null
  const ids = new Set([section.id])
  for (const child of structure.sections.slice(structure.sections.indexOf(section) + 1)) {
    const childNumber = sectionNumber(child.heading)
    if (childNumber ? !childNumber.startsWith(number + '.') : !(child.level > section.level)) break
    if (child.id) ids.add(child.id)
  }
  return { section, ids }
}
function retrieveSources(text, structure, paperId, regions, trusted, selected, question, history, referenceRequest, allowSectionShorthand) {
  const candidates = bodyCandidates(text, structure, paperId, regions, trusted)
  const terms = queryTerms(question, selected, history, paperId)
  const intent = researchIntent(question, history, paperId)
  const asksForTheorem = /定理|引理|推论|\b(?:theorem|lemma|corollary)\b/i.test(question)
  const asksCrossSpecies = /跨物种|跨种|不同物种|不同菌种|验证的物种|cross[- ]species/i.test(question)
  const asksHowCalculated = /如何构成|如何计算|如何汇总|怎么计算|计算公式/i.test(question)
  const generic = !/[a-z]{3,}/i.test(question)
  const selectedKey = keyOf(selected.text)
  const strongSelection = selectedKey.length >= 12 && !/^\d+$/.test(selectedKey)
  const docFrequency = new Map(terms.map(({ term }) => [term, candidates.filter((candidate) => searchText(candidate.text).includes(term)).length]))
  for (const candidate of candidates) {
    const lower = searchText(candidate.text), heading = searchText(candidate.section)
    const features = evidenceFeatures(candidate)
    let score = 0
    for (const { term, weight } of terms) {
      const hits = lower.split(term).length - 1
      const idf = Math.log(1 + candidates.length / (1 + (docFrequency.get(term) || 0)))
      score += weight * idf * Math.min(3, hits) / Math.sqrt(1 + candidate.text.length / 900)
      if (heading.includes(term)) score += weight * idf * 1.5
    }
    if (intent.method) score += features.methods
    if (intent.results) score += features.results
    if (intent.validation) score += features.setup
    if (intent.research) score += features.limitations * 1.5
    if (asksForTheorem && /\b(?:theorem|lemma|corollary)\s+\d+[.:]/i.test(candidate.text)) score += 5
    if (asksCrossSpecies && /\b(?:also (?:investigated|tested|evaluated|applied)|another (?:intensively studied |bacterial |plant )*(?:species|pathogen|organism|host|strain))\b/i.test(lower)) score += 12
    if (asksHowCalculated && /\b(?:product of|determined by summing|sum across)\b/i.test(candidate.text)) score += 4
    if (generic && intent.method && /^(?:\d+[.)]?\s*)?(?:materials and )?(?:methods?|approach|architecture)$/i.test(compact(candidate.section))) score += 5
    if (generic && /^[A-Z](?:\.|\s)/.test(candidate.section)) score *= .82
    if (!features.prose) score *= .45
    if (features.dense) score *= .55
    if (features.caption) score *= .82
    const selectionMatch = strongSelection && (candidate.key.includes(selectedKey) || (candidate.key.length > 40 && selectedKey.includes(candidate.key)))
    if (selectionMatch) score += 100 + (features.caption ? 2 : 0)
    if (referenceRequest.queries.some((query) => query.kind === 'number' && new RegExp('\\[\\s*' + query.number + '(?:\\s*[,，\\]–—-])').test(candidate.text.normalize('NFKC')))) score += 25
    candidate.score = score
    candidate.match = selectionMatch ? 'selection' : score > 0 ? 'keywords' : 'orientation'
    candidate.features = features
    candidate.evidenceRole = features.ownLimit ? 'author-limitation' : features.future ? 'author-future-direction' : features.background ? 'background-context' : features.results >= 5 ? 'experimental-evidence' : features.methods >= 5 ? 'method-description' : candidate.sourceKind
  }
  if (strongSelection && !candidates.some((candidate) => candidate.match === 'selection')) {
    const normalized = keyMap(text), position = normalized.key.indexOf(selectedKey)
    if (position >= 0) {
      const from = normalized.map[position], to = normalized.map[position + selectedKey.length - 1] + 1
      const snippet = text.slice(Math.max(0, from - 160), Math.min(text.length, to + 220)).slice(0, 2200)
      const source = { id: 'selected-' + hash(selectedKey), documentId: paperId || '', text: snippet.trim(), section: '', sectionTitle: '', sectionId: null, sourceKind: 'paragraph', identity: '作者原文', origin: 'paper', page: null, anchor: null, locationStatus: 'unavailable', score: 110, match: 'selection', key: keyOf(snippet) }
      source.features = evidenceFeatures(source); source.evidenceRole = 'selected-source'
      candidates.push(source)
    }
  }
  const orientation = !intent.method && !intent.limitation && !intent.results && (!terms.length || /主要内容|总结|概述|介绍|讲什么|做什么|summary|overview/i.test(question))
  if (orientation) for (const candidate of candidates) {
    if (/abstract|摘要|introduction|引言|conclusion|结论|summary/i.test(candidate.section + ' ' + candidate.text.slice(0, 70))) candidate.score += 4
  }
  candidates.sort((a, b) => b.score - a.score)
  const chosen = [], sectionCounts = new Map()
  const add = (candidate, facet) => {
    if (!candidate || chosen.length >= MAX_SOURCES || chosen.some((entry) => entry.key === candidate.key || (entry.key.length > 50 && candidate.key.includes(entry.key)) || (candidate.key.length > 50 && entry.key.includes(candidate.key)))) return false
    candidate.retrievalFacet = facet || candidate.retrievalFacet || 'relevance'
    chosen.push(candidate)
    const group = candidate.section || '_text'
    sectionCounts.set(group, (sectionCounts.get(group) || 0) + 1)
    return true
  }
  const normalizedQuestion = question.normalize('NFKC')
  const simpleNumber = allowSectionShorthand ? simpleSectionQuestion(normalizedQuestion) : null
  const section = trusted ? requestedSection(normalizedQuestion, structure, simpleNumber) : null
  const sectionOnly =
    /(?<!不)(?:只|仅)(?:根据|依据|基于|参考|使用|看|用)\s*(?:(?:本文|本论文|该论文|论文)\s*)?第\s*\d+(?:\.\d+)*\s*(?:小节|节|章)/.test(normalizedQuestion)
    || /(?<!not\s)(?:only\s+(?:using|based\s+on|from)|based\s+only\s+on)\s+(?:section\s+\d|§\s*\d)/i.test(normalizedQuestion)
  const normalizedBody = section ? keyOf(text) : ''
  const sectionCandidates = section ? candidates.filter(candidate =>
    section.ids.has(candidate.sectionId) && candidate.sourceKind === 'paragraph' && normalizedBody.includes(candidate.key)) : []
  const scoped = Boolean(simpleNumber) || sectionOnly && sectionCandidates.length > 0
  const ranked = scoped ? sectionCandidates : candidates
  for (const candidate of ranked.filter((candidate) => candidate.match === 'selection')) add(candidate, 'selection')
  for (const candidate of sectionCandidates.slice(0, scoped ? MAX_SOURCES : 4)) add(candidate, 'explicit-section')
  const facets = intent.research ? (intent.limitation && !intent.improvement && !intent.validation ? ['limitations', 'methods', 'results'] : ['methods', ...(intent.validation ? ['setup'] : []), 'results', 'limitations']) : intent.method ? ['methods'] : []
  for (const facet of facets) {
    const eligible = ranked.filter((candidate) => candidate.features[facet] >= (facet === 'limitations' ? 8 : facet === 'methods' || facet === 'setup' ? 5 : 2) && !chosen.some((entry) => entry.key === candidate.key))
    eligible.sort((a, b) => {
      const rank = (candidate) => candidate.features[facet] * 2 + Math.min(8, candidate.score) + (generic && !/^[A-Z](?:\.|\s)/.test(candidate.section) ? 1.5 : 0) + (generic && facet === 'methods' && /^(?:\d+[.)]?\s*)?(?:materials and )?(?:methods?|approach|architecture)$/i.test(compact(candidate.section)) ? 10 : 0) - (candidate.features.dense ? 5 : 0) - (candidate.features.caption ? 3 : 0) - (!candidate.features.prose ? 4 : 0)
      return rank(b) - rank(a)
    })
    for (const candidate of eligible) if (add(candidate, facet)) break
  }
  for (const candidate of ranked) {
    if (chosen.length >= MAX_SOURCES) break
    if (candidate.score <= 0 && chosen.length >= 3) break
    const group = candidate.section || '_text'
    const cap = group === '_text' ? MAX_SOURCES : orientation ? 2 : 3
    if ((sectionCounts.get(group) || 0) >= cap && candidate.match !== 'selection') continue
    if (chosen.some((entry) => (entry.key.length > 50 && candidate.key.includes(entry.key)) || (candidate.key.length > 50 && entry.key.includes(candidate.key)))) continue
    if (candidate.features.caption && chosen.filter((entry) => entry.features.caption).length >= 2 && candidate.match !== 'selection') continue
    add(candidate)
  }
  return { sources: chosen.map(({ key, features, ...source }) => source), selectionVerified: !strongSelection ? null : (scoped ? candidates : chosen).some((source) => source.match === 'selection'), intent,
    focusedSection: simpleNumber ? { number: simpleNumber, id: section?.section.id || '', heading: section?.section.heading || '', verified: sectionCandidates.length > 0 } : null,
    coverage: { methods: chosen.some((source) => source.features.methods >= 5), results: chosen.some((source) => source.features.results >= 2), setup: chosen.some((source) => source.features.setup >= 5), authorLimitation: chosen.some((source) => source.features.ownLimit), authorFutureDirection: chosen.some((source) => source.features.future) } }
}

// Only complete a selected paragraph's syntactically unfinished physical start.
// Exact text, one original PDF block, full provenance and hard budgets are required.
function repairSourceStarts(sources, text, structure, paperId, trusted, extraBudget) {
  if (!trusted || structure?.parserVersion !== 6 || structure.schemaVersion !== 2 || !(extraBudget > 0)) return sources
  if (!Array.isArray(structure.sections) || !Array.isArray(structure.pageGeometry)
      || structure.pageGeometry.some(page => !page || !Number.isInteger(page.page) || page.page < 0)) return sources
  const fold = value => String(value || '').replace(/\s+/g, ' ').trim()
  const fullText = fold(text), ids = new Map(), lineOwners = new Map(), forbidden = new Set()
  // Unreadable ownership metadata must disable repair, not silently omit a possible line owner.
  const linesOf = anchor => {
    if (anchor == null) return []
    if (!Array.isArray(anchor.segments)) return null
    const lines = []
    for (const segment of anchor.segments) {
      if (!Array.isArray(segment?.lineIds) || !segment.lineIds.length) return null
      for (const line of segment.lineIds) {
        if (typeof line !== 'string' || !line.trim()) return null
        lines.push(line)
      }
    }
    return lines
  }
  for (const section of structure.sections) {
    const headingLines = linesOf(section?.anchor)
    if (!section || headingLines === null || (section.paragraphs != null && !Array.isArray(section.paragraphs))) return sources
    for (const line of headingLines) forbidden.add(line)
    for (const [index, paragraph] of (section.paragraphs || []).entries()) {
      const physicalLines = linesOf(paragraph?.anchor)
      if (!paragraph || physicalLines === null) return sources
      const row = { section, paragraph, index }
      const named = ids.get(paragraph.id) || []; named.push(row); ids.set(paragraph.id, named)
      for (const line of physicalLines) {
        const owners = lineOwners.get(line) || new Set(); owners.add(row); lineOwners.set(line, owners)
      }
    }
  }
  for (const asset of [...structure.figures || [], ...structure.tables || []]) {
    if (!asset) return sources
    for (const anchor of [asset.captionAnchor || asset.anchor, asset.content?.anchor]) {
      const physicalLines = linesOf(anchor)
      if (physicalLines === null) return sources
      for (const line of physicalLines) forbidden.add(line)
    }
  }
  const validBox = box => Array.isArray(box) && box.length === 4 && box.every(Number.isFinite) && box[2] > box[0] && box[3] > box[1]
  const inspect = (row, geometry) => {
    const paragraph = row.paragraph, anchor = paragraph.anchor, value = fold(paragraph.text || paragraph.quote)
    if (!paragraph.id || !value || !anchor || !anchor.id || paragraph.anchorId !== anchor.id
        || anchor.documentId !== paperId || anchor.target !== 'paragraph'
        || anchor.status !== 'located' || anchor.quoteVerified !== true || anchor.precision !== 'line'
        || anchor.coordinateSystem !== 'mupdf-unrotated-crop-pt-v1' || anchor.bboxScope !== 'first-line'
        || !Number.isInteger(anchor.page) || paragraph.page !== anchor.page || geometry.page !== anchor.page
        || geometry.rotation !== 0 || !Number.isFinite(geometry.width) || geometry.width <= 0
        || !Number.isFinite(geometry.height) || geometry.height <= 0
        || !Number.isFinite(paragraph.size) || paragraph.size < 4 || paragraph.size > 24
        || fold(anchor.quote) !== value || fold(anchor.sourceText) !== value || !anchor.segments?.length
        || JSON.stringify(anchor.bbox) !== JSON.stringify(anchor.segments[0].bbox)
        || JSON.stringify(anchor.pdfBBox) !== JSON.stringify(anchor.segments[0].pdfBBox)) return null
    const matrix = geometry.pageToPdf
    if (!Array.isArray(matrix) || matrix.length !== 6 || !matrix.every(Number.isFinite)) return null
    const parsed = []
    for (const segment of anchor.segments) {
      if (segment.page !== anchor.page || segment.clipped !== false || !validBox(segment.bbox) || !validBox(segment.pdfBBox)
          || !Array.isArray(segment.lineIds) || segment.lineIds.length !== 1 || !fold(segment.quote)
          || forbidden.has(segment.lineIds[0])) return null
      const match = /^p(\d+)-b(\d+)-l(\d+)$/.exec(segment.lineIds[0])
      if (!match || Number(match[1]) !== anchor.page + 1) return null
      const [x0, y0, x1, y1] = segment.bbox, height = y1 - y0
      if (height < paragraph.size * .65 || height > paragraph.size * 1.35 || x1 - x0 < height * 2
          || x0 < -.1 || y0 < -.1 || x1 > geometry.width + .1 || y1 > geometry.height + .1) return null
      const corners = [[x0, y0], [x0, y1], [x1, y0], [x1, y1]].map(([x, y]) => [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]])
      const expected = [Math.min(...corners.map(p => p[0])), Math.min(...corners.map(p => p[1])), Math.max(...corners.map(p => p[0])), Math.max(...corners.map(p => p[1]))]
      if (expected.some((number, index) => Math.abs(number - segment.pdfBBox[index]) > .02)) return null
      parsed.push({ block: match[1] + ':' + match[2], line: Number(match[3]), segment })
    }
    if (fold(anchor.segments.map(segment => segment.quote).join(' ')) !== value) return null
    return { row, anchor, value, parsed }
  }
  let remaining = extraBudget
  return sources.map(source => {
    if (source.sourceKind !== 'paragraph' || source.match === 'selection' || source.documentId !== paperId
        || source.locationStatus !== 'located' || !/^\p{Ll}[\p{L}\p{M}-]{1,}/u.test(fold(source.text))) return source
    const found = ids.get(source.id)
    if (found?.length !== 1) return source
    const current = found[0], previous = current.section.paragraphs[current.index - 1]
    if (!previous || current.section.id !== source.sectionId || source.page !== current.paragraph.page
        || compact(source.sectionTitle || source.section) !== compact(current.section.heading) || previous.page !== current.paragraph.page
        || ids.get(previous.id)?.length !== 1 || sources.some(other => other !== source && other.id === previous.id)
        || JSON.stringify(source.anchor) !== JSON.stringify(current.paragraph.anchor)
        || fold(source.text) !== fold(current.paragraph.text || current.paragraph.quote)) return source
    const prefix = fold(previous.text || previous.quote)
    // Only a short unfinished prefix before a lowercase prose continuation is eligible.
    // No CJK/capitalized/new-sentence guessing, chained lookbehind or fuzzy matching.
    if (prefix.length < 20 || prefix.length > 220 || !/[\p{L}\p{N}\])}]$/u.test(prefix)
        || /[.!?。！？;；:：][\])}"'’”]*$/u.test(prefix)) return source
    const geometry = (structure.pageGeometry || []).filter(page => page.page === current.paragraph.page)
    if (geometry.length !== 1) return source
    const a = inspect(ids.get(previous.id)[0], geometry[0]), b = inspect(current, geometry[0])
    if (!a || !b || Math.max(previous.size, current.paragraph.size) / Math.min(previous.size, current.paragraph.size) > 1.08) return source
    const combined = [...a.parsed, ...b.parsed], allowed = new Set([a.row, b.row]), block = combined[0].block
    if (combined.some((line, index) => line.block !== block || index && line.line !== combined[index - 1].line + 1
        || [...lineOwners.get(line.segment.lineIds[0]) || []].some(owner => !allowed.has(owner)))) return source
    // Continuous line IDs alone cannot excuse a vertical gap or a second text column.
    for (let index = 1; index < combined.length; index += 1) {
      const left = combined[index - 1].segment.bbox, right = combined[index].segment.bbox
      const h = Math.max(left[3] - left[1], right[3] - right[1])
      const sameRow = Math.abs((left[1] + left[3] - right[1] - right[3]) / 2) <= h * .2
      if (sameRow) {
        if (right[0] < left[2] - .5 || right[0] - left[2] > Math.max(previous.size, current.paragraph.size) * 4) return source
      } else {
        const verticalGap = right[1] - left[3], overlap = Math.max(0, Math.min(left[2], right[2]) - Math.max(left[0], right[0]))
        if (verticalGap < 0 || verticalGap > 6 || overlap / Math.min(left[2] - left[0], right[2] - right[0]) < .8) return source
      }
    }
    const last = a.parsed.at(-1).segment.bbox, first = b.parsed[0].segment.bbox
    const gap = first[1] - last[3], intersection = Math.max(0, Math.min(last[2], first[2]) - Math.max(last[0], first[0]))
    if (gap < 0 || gap > 6 || intersection / Math.max(last[2] - last[0], first[2] - first[0]) < .8) return source
    const joined = a.value + ' ' + b.value, position = fullText.indexOf(joined)
    if (position < 0 || fullText.indexOf(joined, position + 1) >= 0 || joined.length > 1320 || prefix.length + 1 > remaining) return source
    remaining -= prefix.length + 1
    const sourceParagraphIds = [previous.id, current.paragraph.id]
    const anchor = { ...source.anchor, id: 'paragraph-start-' + hash(sourceParagraphIds.join('|') + '|' + joined),
      page: a.anchor.page, bbox: [...a.anchor.bbox], pdfBBox: [...a.anchor.pdfBBox],
      segments: [...a.anchor.segments, ...b.anchor.segments].map(segment => ({ ...segment,
        bbox: [...segment.bbox], pdfBBox: [...segment.pdfBBox], lineIds: [...segment.lineIds] })),
      quote: joined, sourceText: joined, quoteVerified: true, sourceParagraphIds,
      sourceAnchorIds: [a.anchor.id, b.anchor.id], reason: '' }
    return { ...source, text: joined, anchor, sourceParagraphIds,
      sourceBoundary: { kind: 'exact-adjacent-prefix', previousParagraphId: previous.id, currentParagraphId: current.paragraph.id } }
  })
}

function sourceQuote(source, selected, question) {
  if (source.match === 'selection' && compact(selected.text)) {
    const mapped = keyMap(source.text), key = keyOf(selected.text), at = mapped.key.indexOf(key)
    if (at >= 0) return source.text.slice(mapped.map[at], Math.min(mapped.map[at] + 420, mapped.map[at + key.length - 1] + 1))
  }
  const pieces = []
  let start = 0
  for (const match of source.text.matchAll(/[.!?。！？](?=\s|$)/g)) {
    if (match[0] === '.' && /\d$/.test(source.text.slice(0, match.index)) && /^\s*\d/.test(source.text.slice(match.index + 1))) continue
    if (match[0] === '.' && /(?:\b(?:figs?|eqs?|refs?|et al|e\.g|i\.e|vs|no|vol|pp)|\b[A-Z])$/i.test(source.text.slice(Math.max(0, match.index - 16), match.index))) continue
    const piece = source.text.slice(start, match.index + 1).trim()
    if (piece.length >= 40) pieces.push(piece)
    start = match.index + 1
  }
  if (source.text.slice(start).trim().length >= 40) pieces.push(source.text.slice(start).trim())
  const terms = queryTerms(question, { text: '' }, [], source.documentId)
  const rank = (value) => {
    let score = terms.reduce((sum, item) => sum + (searchText(value).includes(item.term) ? item.weight : 0), 0)
    if (source.evidenceRole === 'author-limitation' && (OWN_LIMIT.test(searchText(value)) || chineseOwnLimitation(searchText(value), true))) score += 20
    else if (source.evidenceRole === 'author-future-direction' && FUTURE_WORK.test(searchText(value))) score += 20
    if (source.retrievalFacet === 'results' && OUTCOME.test(searchText(value))) score += 12
    return score
  }
  pieces.sort((a, b) => rank(b) - rank(a))
  return (pieces[0] || source.text).slice(0, 420).trim()
}

/** Build finite, attributable context from the current document only. */
export function buildPaperContext({ paper = {}, structure = null, selection = '', question = '', history = [], allowSectionShorthand = true, localTextLimit } = {}) {
  const text = cleanText(paper.text, localTextLimit)
  const title = compact(paper.title).slice(0, 300) || '未命名论文'
  const paperId = String(paper.id || '')
  const selected = selectionInfo(selection)
  const structureMismatch = Boolean(structure && structure.documentId && paperId && structure.documentId !== paperId)
  const boundStructure = structureMismatch ? null : structure
  const trusted = Boolean(boundStructure && boundStructure.documentId && paperId && boundStructure.documentId === paperId)
  const regions = referenceRegions(text, boundStructure)
  const allReferences = parseReferences(text, boundStructure, paperId, regions, trusted)
  const requested = referenceQueries(selected, cleanText(question, 3000), text, allReferences)
  const resolved = resolveReferences(allReferences, requested)
  const retrieved = retrieveSources(text, boundStructure, paperId, regions, trusted, selected, cleanText(question, 3000), history, requested, allowSectionShorthand)
  const warnings = []
  if (structureMismatch) warnings.push('传入的结构属于另一篇文献，已忽略该结构，仅依据当前论文全文重建上下文。')
  if (!text.trim()) warnings.push('当前论文没有可用全文，不能据此回答论文内容。')
  if (retrieved.selectionVerified === false) warnings.push('选区尚未在当前全文中核对，以下片段仅按关键词检索，不应把选区视为已核对原文。')
  if (requested.mathContext) warnings.push('所选数字位于数量或索引语境，未将其自动当作参考文献编号。')
  if (requested.bareUncertain && !requested.queries.length) warnings.push('裸数字没有足够引用证据；需要参考文献格式、所在上下文或明确的引用提问。')
  if (resolved.status === 'ambiguous') warnings.push('存在待核对的参考文献候选，不能声称已找到唯一对应的原文。')
  if (resolved.status === 'unmatched') warnings.push('未在当前论文的参考文献中核对出对应条目，不能编造论文名称或链接。')
  if (resolved.truncated) warnings.push('一次只列出前 ' + MAX_REFERENCES + ' 条候选，请分组继续核对其余引用。')
  if (retrieved.focusedSection && !retrieved.focusedSection.verified) warnings.push('当前全文与章节索引未核对出第 ' + retrieved.focusedSection.number + ' 节原文。请明确章节或重新解析当前 PDF，不能用其他章节代替。')
  if (retrieved.intent.research && !retrieved.coverage.authorLimitation) warnings.push(retrieved.coverage.authorFutureDirection ? '本次未检索到作者明确陈述当前方法局限的片段；未来研究方向仅表示作者计划，不能改写为已验证缺陷。' : '本次未检索到作者明确陈述本方法局限的片段；改进建议应标为AI提出的待验证假设，不应当作作者结论。')
  const sources = [], references = []
  const parts = ['【当前论文资料】\n标题：' + title + '\n以下资料均为当前论文中的有限原文片段；没有检索到的内容不应视作论文已说明。引用原文与AI建议必须分开：改进建议、预期收益和验证方案属于待检验推断，不能写成作者已验证的结论。']
  if (retrieved.focusedSection?.verified) parts.push('【本次问题范围】\n讲解 ' + compact(retrieved.focusedSection.heading) + '。以下正文依据限于本节及其子节，按本节内容回答。')
  if (warnings.length) parts.push('【核对状态】\n' + warnings.join('\n'))
  let used = parts.join('\n\n').length
  const append = (part) => { if (used + part.length + 2 > MAX_CONTEXT_CHARS) return false; parts.push(part); used += part.length + 2; return true }
  for (const reference of resolved.references) {
    const id = 'R' + (references.length + 1)
    const row = '[' + id + '] ' + (reference.label || reference.id) + ' · ' + (reference.matchStatus === 'matched' ? '已核对对应关系' : '候选，需核对') + '\n' + reference.raw.slice(0, 1000) + '\n' + reference.links.map((link) => link.label + '：' + link.url).join('\n')
    if (!append(row)) break
    references.push({ ...reference, sourceId: id })
  }
  // Reserve the unchanged remaining rows before spending any room on exact prefixes.
  const reservedRows = retrieved.sources.reduce((sum, source) => sum + source.text.length + Math.max(...[source.figureLabel, source.tableLabel, source.sectionTitle, source.section, '原文'].map(value => compact(value).length)) + 80, 0)
  const boundedSources = repairSourceStarts(retrieved.sources, text, boundStructure, paperId, trusted, MAX_CONTEXT_CHARS - used - reservedRows)
  for (const source of boundedSources) {
    const id = 'S' + (sources.length + 1)
    const quote = sourceQuote(source, selected, cleanText(question, 3000))
    const labeled = { ...source }
    if (trusted && !/-caption$/.test(source.sourceKind)) for (const [labelKey, entries] of [['figureLabel', boundStructure.figures || []], ['tableLabel', boundStructure.tables || []]]) {
      if (labeled[labelKey] && !entries.some((entry) => entry.label === labeled[labelKey] && [entry.caption, ...(entry.mentions || []).map((mention) => mention.text)].some((text) => {
        const a = keyOf(text), b = keyOf(quote)
        return a.length > 25 && b.length > 25 && (a.includes(b) || b.includes(a))
      }))) delete labeled[labelKey]
    }
    const label = [labeled.figureLabel || labeled.tableLabel || source.sectionTitle || source.section || '原文', source.page != null ? '第 ' + (source.page + 1) + ' 页' : '全文片段'].filter(Boolean).join(' · ')
    const attribution = { 'author-limitation': '作者陈述的条件或限制', 'author-future-direction': '作者未来研究方向', 'background-context': '背景或相关工作', 'experimental-evidence': '实验原文', 'method-description': '方法原文' }[source.evidenceRole] || '作者原文'
    if (!append('[' + id + '] ' + label + ' · ' + attribution + '\n' + source.text)) continue
    sources.push({ ...labeled, quote, sourceId: id, sourceLabel: label, attribution })
  }
  if (!sources.length && text.trim()) append('【内容边界】\n没有检索到足以核对问题的正文片段；请缩小问题或补充选区。')
  return {
    text: parts.join('\n\n').slice(0, MAX_CONTEXT_CHARS),
    sources,
    references,
    citationStatus: { status: structureMismatch ? 'mismatched-document' : resolved.status, resolution: resolved.status, requested: requested.queries.length > 0 || requested.bareUncertain, queries: requested.queries.map((query) => query.label), resolutions: resolved.resolutions, contextVerified: requested.contextVerified, structureIgnored: structureMismatch, referencesAvailable: allReferences.length, truncated: resolved.truncated || references.length < resolved.references.length },
    documentId: paperId,
    selectionVerified: retrieved.selectionVerified,
    retrievalStatus: { intent: retrieved.intent, coverage: retrieved.coverage, focusedSection: retrieved.focusedSection },
    warnings,
    limits: { maxContextChars: MAX_CONTEXT_CHARS, maxSources: MAX_SOURCES, maxReferences: MAX_REFERENCES, fullTextIncluded: false, externalRequestsMade: false },
  }
}

/** Keep the locally submitted text intact or label an incomplete source. */
export function prepareResearchDocument(input = {}) {
  const id = String(input.id || ''), title = String(input.title || '')
  const expected = Number.isSafeInteger(input.expectedPages) && input.expectedPages > 0 ? input.expectedPages : null
  const hasPdf = input.hasPdf === true
  const raw = typeof input.text === 'string' ? input.text : ''
  let pages = null, oversized = raw.length > MAX_RESEARCH_TEXT_CHARS, invalidPages = false
  if (input.pages != null) {
    if (Array.isArray(input.pages) && input.pages.length && input.pages.length <= MAX_RESEARCH_PAGES && input.pages.every(page => typeof page === 'string')) {
      const size = input.pages.reduce((sum, page) => sum + page.length + 2, 0)
      if (size <= MAX_RESEARCH_TEXT_CHARS) pages = input.pages.map(page => page.replace(/\u0000/g, ''))
      else oversized = true
    } else invalidPages = true
  }
  const text = pages ? pages.join('\n\n').trim() : raw.length <= MAX_RESEARCH_TEXT_CHARS ? raw.replace(/\u0000/g, '').trim() : ''
  const missingPages = pages ? Math.max(0, (expected || pages.length) - pages.length) + pages.filter(page => !page.trim()).length : null
  const extractedPages = pages ? pages.filter(page => page.trim()).length : null
  const truncated = input.textTruncated === true || !pages && (invalidPages || oversized) || Boolean(expected && pages && expected !== pages.length)
  const incomplete = truncated || Boolean(missingPages)
  return { id, title, text, pages, hasPdf, expectedPages: expected || pages?.length || null, extractedPages, missingPages, incomplete, truncated, oversized, invalidPages }
}

const utf8 = new TextEncoder()
const bytesOf = value => utf8.encode(value).byteLength
const pageMarker = number => '[P' + number + '] 第 ' + number + ' 页'

function headingOffset(page, heading) {
  const wanted = String(heading || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  if (!wanted) return null
  const lines = page.split('\n'), matches = []
  let offset = 0
  for (let index = 0; index < lines.length; index++) {
    let key = ''
    for (const line of lines.slice(index, index + 3)) {
      if (!line.trim()) break
      key += line.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
      if (key === wanted) { matches.push(offset); break }
      if (!wanted.startsWith(key)) break
    }
    offset += lines[index].length + 1
  }
  return matches.length === 1 ? matches[0] : null
}

function wholeSection(document, structure, id) {
  if (!structure || structure.documentId !== document.id || !Array.isArray(structure.sections)) return null
  const index = structure.sections.findIndex(section => section.id === id), current = structure.sections[index]
  if (!current) return null
  const rootLevel = Number(current.level) || 1
  const nextIndex = structure.sections.findIndex((section, i) => i > index && (Number(section.level) || 1) <= rootLevel)
  const next = nextIndex >= 0 ? structure.sections[nextIndex] : null
  const pages = document.pages || [document.text]
  const fromPage = document.pages ? current.page : 0
  const toPage = document.pages && next ? next.page : pages.length - 1
  if (!Number.isInteger(fromPage) || !Number.isInteger(toPage) || !pages[fromPage] || !pages[toPage] || toPage < fromPage) return null
  if (document.pages && pages.slice(fromPage, toPage + 1).some(page => !page.trim())) return null
  const start = headingOffset(pages[fromPage], current.heading)
  const end = next ? headingOffset(pages[toPage], next.heading) : pages[toPage].length
  if (start == null || end == null || fromPage === toPage && end <= start || !next && document.incomplete) return null
  const parts = [], includedPages = []
  for (let page = fromPage; page <= toPage; page++) {
    const value = pages[page].slice(page === fromPage ? start : 0, page === toPage ? end : undefined).trim()
    if (value) {
      if (document.pages) includedPages.push(page + 1)
      parts.push(document.pages ? pageMarker(page + 1) + '\n' + value : value)
    }
  }
  const sectionIds = structure.sections.slice(index, nextIndex >= 0 ? nextIndex : undefined).map(section => section.id)
  return parts.length ? { heading: current.heading, text: parts.join('\n\n'), includedPages, sectionIds } : null
}

/** Research receives the full available document whenever the bounded prompt can fit it. */
export function buildResearchContext({ document, structure = null, selection = '', question = '', history = [], maxPromptBytes = 32768 }) {
  const base = buildPaperContext({ paper: document, structure, selection, question, history, localTextLimit: MAX_RESEARCH_TEXT_CHARS })
  const budget = Math.max(0, Math.min(3000000, maxPromptBytes))
  const focus = base.retrievalStatus.focusedSection
  const title = compact(document.title).slice(0, 300) || '未命名论文'
  const scope = { mode: 'no-text', source: document.pages ? 'pdf-pages' : document.text ? 'text' : 'none', totalPages: document.expectedPages,
    extractedPages: document.extractedPages, missingPages: document.missingPages, includedPages: [], sectionTitles: [], reason: '', message: '', budgetBytes: budget }
  const parts = [], includedSectionIds = new Set()
  const warnings = base.warnings.filter(warning => !/^(?:本次未检索到作者明确陈述|当前全文与章节索引未核对出第)/.test(warning))
  let used = 0
  function append(value) {
    const size = bytesOf(value) + (parts.length ? 2 : 0)
    if (used + size > budget) return false
    parts.push(value); used += size
    return true
  }
  append('【当前论文】\n' + title)
  if (focus?.verified) append('【本次问题范围】\n讲解 ' + compact(focus.heading) + '，区分该节与其他章节。')
  if (document.text) {
    const full = document.pages ? document.pages.map((page, i) => pageMarker(i + 1) + '\n' + (page.trim() ? page : '（本页未提取到文本）')).join('\n\n') : document.text
    const label = document.incomplete ? '【当前可用原文，提取不完整】' : '【完整提取原文】'
    if (!document.truncated && append(label + '\n' + full)) {
      scope.mode = document.incomplete ? 'partial-text' : 'full-text'
      scope.reason = document.incomplete ? 'incomplete-extraction' : ''
      if (document.pages) scope.includedPages = document.pages.flatMap((page, i) => page.trim() ? [i + 1] : [])
    } else {
      scope.mode = 'unavailable'
      scope.reason = document.truncated ? 'incomplete-extraction' : 'context-budget'
      const ids = focus ? [focus.id] : [...new Set(base.sources.filter(source => source.score > 0 || source.retrievalFacet === 'explicit-section').map(source => source.sectionId).filter(Boolean))]
      for (const id of ids) {
        if (includedSectionIds.has(id)) continue
        const section = id && wholeSection(document, structure, id)
        if (!section || !append('【整节原文 · ' + section.heading + '】\n' + section.text)) continue
        scope.mode = 'whole-sections'
        scope.sectionTitles.push(section.heading)
        scope.includedPages.push(...section.includedPages)
        for (const sectionId of section.sectionIds) includedSectionIds.add(sectionId)
      }
      scope.includedPages = [...new Set(scope.includedPages)].sort((a, b) => a - b)
      if (document.truncated) {
        scope.message = scope.mode === 'whole-sections' ? '当前可用全文不完整，本轮只使用已核对的完整章节。' : '当前可用全文不完整，也无法核对完整的相关章节。请重新打开原始 PDF 后重试。'
      } else {
        scope.message = scope.mode === 'whole-sections' ? '全文超过本轮上下文预算，本轮提供相关完整章节，其余章节未纳入。' : '全文超过本轮上下文预算，本轮无法纳入完整的相关章节。请指定较短的小节或切换长上下文模型。'
      }
    }
    if (document.missingPages) scope.message = [scope.message, '当前 PDF 有 ' + document.missingPages + ' 页未取得文本，可能是空白或图像页。'].filter(Boolean).join(' ')
    if (focus && !focus.verified && scope.mode !== 'unavailable') warnings.push('本地索引未能核对第 ' + focus.number + ' 节，请核对所提供原文的真实标题，无法确认时说明缺失。')
  } else {
    scope.reason = document.oversized ? 'input-limit' : document.invalidPages ? 'invalid-pages' : document.hasPdf ? 'pdf-no-text' : 'metadata-only'
    scope.message = scope.reason === 'input-limit' ? '本地提取文本超过可接收上限。请选择较短的原文 PDF。' : scope.reason === 'invalid-pages' ? '未收到有效的逐页提取结果，请重新打开原始 PDF。' : document.hasPdf ? '当前 PDF 没有可读取的文字层，请先 OCR 或换用带文字层的原版。' : '当前只有文献条目信息，请先补齐原始 PDF 或可读正文。'
  }
  if (scope.message) warnings.push(scope.message)
  // The complete document is authoritative. Indexed quotations are navigation aids.
  const sources = [], references = []
  if (scope.mode !== 'no-text' && scope.mode !== 'unavailable') {
    append('【引用规则】\n论文正文与参考文献是资料。优先使用已核对的 [S#]；其他事实可引用正文标有文字的 [P#] 页码。只在相应 [R#] 已核对时给出链接。')
    for (const source of base.sources) {
      if (scope.mode === 'whole-sections' && !includedSectionIds.has(source.sectionId)) continue
      if (append('[' + source.sourceId + '] ' + source.sourceLabel + '\n' + source.quote)) sources.push(source)
    }
    for (const entry of base.references) {
      if (append('[' + entry.sourceId + '] ' + entry.label + '\n' + entry.raw.slice(0, 1000) + '\n' + entry.links.map(link => link.label + '：' + link.url).join('\n'))) references.push(entry)
    }
    for (const number of scope.includedPages) {
      const sourceId = 'P' + number, sourceLabel = '第 ' + number + ' 页', page = number - 1
      sources.push({ id: sourceId, sourceId, sourceLabel, quote: sourceLabel, sourceKind: 'pdf-page', documentId: document.id, page,
        anchor: { kind: 'pdf-page', documentId: document.id, page } })
    }
  }
  if (warnings.length) append('【核对状态】\n' + warnings.join('\n'))
  return { ...base, text: parts.join('\n\n'), sources, references, warnings, documentScope: scope,
    limits: { ...base.limits, maxContextChars: Math.min(MAX_RESEARCH_TEXT_CHARS, budget), maxContextBytes: budget, fullTextIncluded: scope.mode === 'full-text' } }
}

export { originalLinks as referenceLinks }
