/* Source-bound, controlled chapter reading. This module performs no I/O. */
(function (scope) {
  'use strict'
  const CHAPTER_QUESTIONS = {
    intro: '作者提出什么问题，现有方案为什么还不够？',
    related: '本文继承了哪些路线，又在哪些地方作了改变？',
    method: '输入经过哪些步骤和设定，最后产生什么输出？',
    experiment: '实验条件与对照支持了哪些结论？',
    discussion: '这些发现如何解释，在哪些条件下成立？',
    conclusion: '全文最终回答了什么，哪些边界仍需保留？',
    theory: '推导依赖什么假设，结论在什么范围内成立？',
    review: '分类框架与观点分歧如何组织这一领域？',
    other: '这一节提出了什么，它与全文的问题有什么关系？',
  }
  function text(v) { return typeof v === 'string' ? v : '' }
  function compact(v) { return text(v).replace(/\s+/g, ' ').trim() }
  function key(v) { return text(v).normalize('NFKC').replace(/[\s\u00ad\-‐‑–—−]/g, '').toLowerCase() }
  function hash(v) { let n = 2166136261; for (const c of String(v || '')) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return (n >>> 0).toString(36) }
  function clone(v, fallback) { try { return JSON.parse(JSON.stringify(v)) } catch { return fallback } }
  function bound(anchor, paperId) { return anchor && anchor.documentId === paperId ? clone(anchor, null) : null }
  function pageOf(item) { const n = item && item.anchor && item.anchor.page != null ? item.anchor.page : item && item.page; return Number.isInteger(n) && n >= 0 ? n : null }
  function pageLabel(item) { const page = pageOf(item); return page == null ? '页码待核对' : '第 ' + (page + 1) + ' 页' }
  function excluded(heading) { return /^(?:(?:\d+(?:\.\d+)*[.)]?)\s*)?(?:references|bibliography|works cited|参考文献|致谢|acknowledg(?:e)?ments?)\s*[:：]?$/i.test(compact(heading).replace(/(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])/g, '')) }
  function kindOf(heading) {
    const value = compact(heading).replace(/^(?:\d+(?:\.\d+)*|[IVX]+)(?:[.)、]\s*|\s+)/, '')
    if (/related|prior work|literature|相关|前人|文献回顾/i.test(value)) return 'related'
    if (/introduction|abstract|background|motivation|引言|前言|绪论|背景|摘要|研究动机/i.test(value)) return 'intro'
    if (/experiment|evaluat|result|benchmark|ablation|实验|评估|结果|消融|验证/i.test(value)) return 'experiment'
    if (/discussion|limitation|future|讨论|局限|不足|展望/i.test(value)) return 'discussion'
    if (/conclusion|总结|结论/i.test(value)) return 'conclusion'
    if (/theor|proof|assumpt|derivation|lemma|理论|推导|定理|假设/i.test(value)) return 'theory'
    if (/survey|review|taxonomy|categor|综述|分类|观点/i.test(value)) return 'review'
    if (/method|approach|model|architect|framework|algorithm|pipeline|方法|模型|架构|框架|算法/i.test(value)) return 'method'
    return 'other'
  }
  function sourcesOf(node, paperId) {
    return node.paragraphs.map((paragraph, index) => ({ id: text(paragraph.id) || node.id + '-p' + index, sectionId: node.id, quote: text(paragraph.text), text: text(paragraph.text), page: pageOf(paragraph), anchor: bound(paragraph.anchor, paperId), type: 'paragraph' })).filter((source) => source.quote.trim())
  }
  function sectionsOf(structure, paperId) {
    if (!structure || structure.documentId && structure.documentId !== paperId || !Array.isArray(structure.sections)) return []
    const raw = structure.sections.filter((section) => section && typeof section === 'object')
    const bodyStart = raw.findIndex((section) => /^(?:(?:\d+(?:\.\d+)*|[IVX]+)[.)、]?\s*)?(?:introduction\b|引言|前言|绪论)/i.test(compact(section.heading)))
    let inReferences = false
    const filtered = raw.filter((section, index) => {
      const heading = compact(section.heading), plain = heading.replace(/^(?:\d+(?:\.\d+)*|[IVX]+)(?:[.)、]\s*|\s+)/, '')
      if (/^(?:references|bibliography|works cited|参考\s*文\s*献)\s*[:：]?$/i.test(plain)) { inReferences = true;return false }
      if (inReferences) { if (/^(?:methods?|appendix|appendices|supplementary|supplemental|附录|补充材料|方法)(?:\s|$|[:：])/i.test(plain)) inReferences = false;else return false }
      if (excluded(heading) || /^(?:key\s*words|关键词|关键字|ccs concepts|declarations?|声明|author contributions?|author information|作者信息|数据可用性|data availability|competing interests?|利益冲突)\s*[:：]?$/i.test(plain)) return false
      if (bodyStart > 0 && index < bodyStart && !/^(?:abstract|摘要)\s*[:：]?$/i.test(plain)) return false
      if (/^\d+\s*\(\d{4}\)\s*$/.test(heading) || /^[A-Za-z]\s+[A-Za-z]\s*=\s*\d+$/.test(heading) || /^[\d\sA-Za-z×=+∑]+$/.test(heading) && /[×=∑]/.test(heading) && !/[A-Za-z]{3}/.test(heading)) return false
      return true
    })
    const all = []
    for (let i = 0; i < filtered.length; i += 1) {
      const section = filtered[i], next = filtered[i + 1], a = section.anchor && section.anchor.bbox, b = next && next.anchor && next.anchor.bbox
      const height = a && a[3] - a[1], nextHeight = b && b[3] - b[1]
      const continuation = Number(structure.parserVersion || 0) < 3 && next && !(section.paragraphs || []).length && Number(next.level) > Number(section.level) && !/^\d+(?:\.\d+)*[.)、]?\s*/.test(compact(next.heading)) && bound(section.anchor, paperId) && bound(next.anchor, paperId) && section.anchor.status === 'located' && next.anchor.status === 'located' && section.anchor.quoteVerified && next.anchor.quoteVerified && pageOf(section) === pageOf(next) && a && b && height > 0 && Math.abs(b[0] - a[0]) <= 30 && b[1] >= a[1] && b[1] - a[3] <= Math.max(3, height * .35) && nextHeight / height >= .8 && nextHeight / height <= 1.25
      if (continuation) { all.push({ ...section, heading: compact(section.heading) + ' ' + compact(next.heading), paragraphs: next.paragraphs || [], headingContinuationIds: [next.id] });i += 1 }
      else all.push(section)
    }
    const nodes = []
    for (let i = 0; i < all.length; i += 1) {
      const section = all[i]
      if (excluded(section.heading)) continue
      const level = Math.max(1, Math.min(4, Number(section.level) || 1))
      const children = []
      let end = i + 1
      while (end < all.length && (Number(all[end].level) || 1) > level) { if (!excluded(all[end].heading)) children.push(all[end]); end += 1 }
      const collection = [section, ...children]
      const seen = new Set()
      const paragraphs = collection.flatMap((item) => Array.isArray(item.paragraphs) ? item.paragraphs : []).filter((paragraph) => {
        if (!paragraph || !text(paragraph.text).trim()) return false
        const id = paragraph.id || key(paragraph.text) + ':' + pageOf(paragraph)
        if (seen.has(id)) return false
        seen.add(id); return true
      })
      if (!paragraphs.length && !text(section.heading).trim()) continue
      if (!paragraphs.length && !children.length) continue
      const id = text(section.anchorId) || text(section.id) || 'section-' + i
      const title = compact(section.heading) || '开篇'
      const parent = nodes.slice().reverse().find((node) => node.level < level)
      let kind = kindOf(title)
      const ownText = (section.paragraphs || []).map((paragraph) => text(paragraph.text)).join(' ')
      const reviewsPriorWork = /(?:traditional|existing|prior|previous|recent(?:ly)?|early|经典|现有|已有|早期|前人)/i.test(ownText) && /\[\s*\d/.test(ownText)
      if (parent && (parent.kind === 'related' || parent.kind === 'intro' && reviewsPriorWork && !/^(?:\d+(?:\.\d+)*[.)、]?\s*)?(?:methods?\b|methodology\b|approach\b|experiment\b|evaluation\b|方法|实验)/i.test(title))) kind = 'related'
      else if (kind === 'other' && parent) kind = parent.kind
      nodes.push({ ...section, id, sourceId: text(section.id) || id, heading: title, level, kind, parentId: parent && parent.id || null, paragraphs, children: children.map((item) => ({ id: text(item.anchorId) || text(item.id), heading: compact(item.heading), page: pageOf(item), anchor: bound(item.anchor, paperId) })).filter((item) => item.id && item.heading), page: pageOf(section), anchor: bound(section.anchor, paperId), original: section, order: nodes.length })
    }
    return nodes
  }
  function captionSources(structure, node, paperId) {
    if (!node) return []
    const combined = node.paragraphs.map((p) => p.text).join('\n')
    const pages = new Set([node.page, ...node.paragraphs.map(pageOf)].filter((v) => v != null))
    const items = [...(structure && structure.figures || []).map((item) => ({ ...item, type: 'figure' })), ...(structure && structure.tables || []).map((item) => ({ ...item, type: 'table' })), ...(structure && Array.isArray(structure.formulas) ? structure.formulas : []).filter((item) => item && item.anchor && item.anchor.documentId === paperId && item.anchor.status === 'located' && item.anchor.quoteVerified).map((item) => ({ ...item, type: 'formula' }))]
    return items.filter((item) => item && (text(item.caption) || text(item.text) || text(item.quote))).map((item, index) => {
      const quote = text(item.caption || item.text || item.quote)
      const label = compact(item.label) || (item.type === 'figure' ? '图题注' : item.type === 'formula' ? '原文公式' : '表题注')
      const mentions = (Array.isArray(item.mentions) ? item.mentions : []).filter((mention) => mention && (!mention.matchStatus || mention.matchStatus === 'matched') && (!Array.isArray(mention.candidateCaptionIds) || mention.candidateCaptionIds.length <= 1) && compact(mention.text || mention.quote) && bound(mention.anchor, paperId)).map((mention, at) => ({ id: text(mention.id) || 'mention-' + index + '-' + at, sectionId: node.id, quote: text(mention.text || mention.quote), text: text(mention.text || mention.quote), page: pageOf(mention), anchor: bound(mention.anchor, paperId), type: 'mention' }))
      const family = item.type === 'figure' ? '(?:fig(?:ure)?s?\\.?|图)' : item.type === 'table' ? '(?:tables?|表)' : '(?:equations?|eqs?\\.?|公式)'
      const labelKey = label.match(/(?:fig(?:ure)?s?\.?|tables?|图|表|equations?|eqs?\.?|公式)\s*([\dIVX]+)/i)
      const verifiedMention = mentions.some((mention) => key(combined).includes(key(mention.quote)))
      const explicit = verifiedMention || labelKey && new RegExp(family + '\\s*' + labelKey[1] + '(?![\\dIVX])', 'i').test(combined)
      const captionAnchor = item.type === 'formula' ? bound(item.anchor, paperId) : bound(item.captionAnchor, paperId) || bound(item.anchor, paperId)
      return { id: text(item.id) || text(item.anchorId) || item.type + '-' + index, sectionId: node.id, label, quote, text: quote, page: captionAnchor && Number.isInteger(captionAnchor.page) ? captionAnchor.page : pageOf(item), anchor: captionAnchor, type: item.type, mentions, relation: explicit ? '本节提及' : '同页题注', score: explicit ? 2 : pages.has(pageOf(item)) ? 1 : 0 }
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 6)
  }

  function chaptersOf(structure, paperId) {
    const all = sectionsOf(structure, paperId)
    if (!all.length) return []
    const level = Math.min(...all.map((node) => node.level))
    let mains = all.filter((node) => node.level === level)
    if (mains.some((node) => !/^(?:abstract|摘要)\s*[:：]?$/i.test(node.heading))) mains = mains.filter((node) => !/^(?:abstract|摘要)\s*[:：]?$/i.test(node.heading))
    return mains.map((node, order) => {
      const start = all.findIndex((item) => item.id === node.id), next = mains[order + 1]
      const end = next ? all.findIndex((item) => item.id === next.id) : all.length
      const sections = all.slice(start, end)
      return { ...node, order, sections, subsections: sections.slice(1), children: sections.slice(1).map((item) => ({ id: item.id, heading: item.heading, page: item.page, anchor: item.anchor })) }
    })
  }
  function normalizedPosition(position, paperId) {
    if (!position || position.documentId && position.documentId !== paperId || !Number.isInteger(position.page) || position.page < 1) return null
    const value = Number(position.offset != null ? position.offset : position.fraction)
    return { documentId: paperId, page: position.page, offset: Math.round(Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 10000) / 10000, ...(/^(?:user|programmatic)$/.test(position.intent) ? { intent: position.intent } : {}), ...(Number.isFinite(position.userScrollId) ? { userScrollId: Math.max(0, Math.floor(position.userScrollId)) } : {}) }
  }
  function sameReadingPosition(a, b) {
    if (!a || !b) return !a && !b
    return a.documentId === b.documentId && a.page === b.page && Math.abs(Number(a.offset || 0) - Number(b.offset || 0)) <= .002
  }
  function headingOffset(section, structure) {
    const page = pageOf(section), geometry = (structure.pageGeometry || []).find((item, index) => (item.page == null ? index : item.page) === page)
    const segment = section.anchor && (section.anchor.segments || []).find((item) => item.page === page)
    const bbox = segment && segment.bbox || section.anchor && section.anchor.bbox || section.bbox
    if (!geometry || !Array.isArray(bbox) || bbox.length !== 4) return null
    const matrix = geometry.pageToDisplay || [1, 0, 0, 1, 0, 0]
    const y = Math.min(...[[bbox[0],bbox[1]],[bbox[2],bbox[1]],[bbox[0],bbox[3]],[bbox[2],bbox[3]]].map(([x,y]) => matrix[1] * x + matrix[3] * y + matrix[5]))
    const bounds = geometry.displayBounds, height = bounds ? bounds[3] - bounds[1] : geometry.height
    return height > 0 ? Math.max(0, Math.min(1, (y - (bounds ? bounds[1] : 0)) / height)) : null
  }
  function positionForReading(structure, paperId, position) {
    const point = normalizedPosition(position, paperId), chapters = chaptersOf(structure, paperId)
    if (!point || !chapters.length) return null
    const all = sectionsOf(structure, paperId), page = point.page - 1
    const starts = all.filter((node) => pageOf(node) != null).map((node, order) => ({ node, page: pageOf(node), offset: headingOffset(node, structure), order })).sort((a,b) => a.page - b.page || (a.offset == null || b.offset == null ? a.order - b.order : a.offset - b.offset || a.order - b.order))
    let target = starts.filter((item) => item.page < page || item.page === page && (item.offset == null || item.offset <= point.offset + .0001)).at(-1)
    const earlyMain = starts.find((item) => item.page === page && item.offset != null && item.offset <= .25 && chapters.some((chapter) => chapter.id === item.node.id))
    if (earlyMain && point.offset < earlyMain.offset) target = earlyMain
    const section = target && target.node || chapters[0]
    const chapter = chapters.find((item) => item.sections.some((child) => child.id === section.id)) || chapters[0]
    return { chapterId: chapter.id, sectionId: chapter.sections.some((item) => item.id === section.id) ? section.id : chapter.id, page: point.page, offset: point.offset }
  }
  function readingAxis(structure, paperId) {
    const chapters=chaptersOf(structure,paperId)
    if(!chapters.length)return null
    const starts=chapters.map((chapter)=>({chapterId:chapter.id,page:Math.max(0,pageOf(chapter)||0),offset:headingOffset(chapter,structure)||0})).map((item)=>({...item,value:item.page+item.offset}))
    const start=starts[0].value,last=chapters[chapters.length-1],lastStart=starts[starts.length-1].value
    let end=lastStart
    for(const paragraph of last.paragraphs){
      if(paragraph.anchor&&paragraph.anchor.documentId&&paragraph.anchor.documentId!==paperId)continue
      const anchor=paragraph.anchor,segments=anchor&&Array.isArray(anchor.segments)&&anchor.segments.length?anchor.segments:[{page:pageOf(paragraph),bbox:anchor&&anchor.bbox||paragraph.bbox}]
      for(const segment of segments){
        const page=segment.page,geometry=(structure.pageGeometry||[]).find((item,index)=>(item.page==null?index:item.page)===page),bbox=segment.bbox
        if(!Number.isInteger(page)||page<0)continue
        let bottom=1
        if(geometry&&Array.isArray(bbox)&&bbox.length===4){const matrix=geometry.pageToDisplay||[1,0,0,1,0,0],bounds=geometry.displayBounds,height=bounds?bounds[3]-bounds[1]:geometry.height,y=Math.max(...[[bbox[0],bbox[1]],[bbox[2],bbox[1]],[bbox[0],bbox[3]],[bbox[2],bbox[3]]].map(([x,y])=>matrix[1]*x+matrix[3]*y+matrix[5]));if(height>0)bottom=Math.max(0,Math.min(1,(y-(bounds?bounds[1]:0))/height))}
        end=Math.max(end,page+bottom)
      }
    }
    if(!(end>lastStart))end=Math.floor(lastStart)+1
    if(!(end>start))end=start+1
    return {start,end,ticks:starts.map((item)=>({...item,position:Math.max(0,Math.min(1,(item.value-start)/(end-start)))}))}
  }
  function axisPosition(structure,paperId,position){const point=normalizedPosition(position,paperId),axis=readingAxis(structure,paperId);return point&&axis?Math.max(0,Math.min(1,(point.page-1+point.offset-axis.start)/(axis.end-axis.start))):null}
  function sliderPositionForChapter(structure,paperId,chapter){const axis=readingAxis(structure,paperId),id=typeof chapter==='string'?chapter:chapter&&chapter.id,item=axis&&axis.ticks.find((tick)=>tick.chapterId===id);return item?item.position:null}
  function chapterAtSliderPosition(structure,paperId,value){const axis=readingAxis(structure,paperId);if(!axis)return null;const position=Math.max(0,Math.min(1,Number(value)||0));return axis.ticks.filter((tick)=>tick.position<=position+.0000001).at(-1)||axis.ticks[0]}
  function chapterReadingPosition(chapter,structure,paperId){return chapter?{documentId:paperId,page:Math.max(0,pageOf(chapter)||0)+1,offset:headingOffset(chapter,structure)||0,intent:'programmatic'}:null}
  function normalizeState(value, paperId, chapters) {
    const { railCollapsed, railScrollCompensation, railExpandKey, ...same } = value && (!value.paperId || value.paperId === paperId) ? value : {}
    const bySection = (id) => chapters.find((chapter) => chapter.id === id || chapter.sections.some((section) => section.id === id))
    const savedChapter = bySection(same.currentSection)
    const current = savedChapter || chapters[0]
    const sectionId = current && current.sections.some((section) => section.id === same.currentSubsection) ? same.currentSubsection : current && current.sections.some((section) => section.id === same.currentSection) ? same.currentSection : current && current.id || ''
    let scrollPositions = same.scrollPositions || {}
    // Older snapshots saved the current chapter's offset with the rail hidden.
    const compensation = Math.max(0, Number(railScrollCompensation) || 0)
    if (railCollapsed && compensation && savedChapter) {
      scrollPositions = { ...scrollPositions, [savedChapter.id]: Math.max(0, Number(scrollPositions[savedChapter.id]) || 0) + compensation }
    }
    return { ...same, version: 2, mode: 'direct', paperId, currentSection: current && current.id || '', currentSubsection: sectionId, completed: [...new Set((same.completed || []).filter((id) => typeof id === 'string' && id))], chapterCache: same.chapterCache || {}, scrollPositions, sectionPositions: same.sectionPositions || {}, translations: same.translations || {}, entryPdfPosition: normalizedPosition(same.entryPdfPosition, paperId), lastSeenPdfPosition: normalizedPosition(same.lastSeenPdfPosition || same.entryPdfPosition, paperId), railPdfPosition: normalizedPosition(same.railPdfPosition, paperId), pdfMovedSinceEntry: Boolean(same.pdfMovedSinceEntry), started: Boolean(same.started), ended: false }
  }
  function cacheKey(node) { return 'direct-v6r4-chapter-context:' + node.id + ':' + hash([node.heading, node.kind, ...node.paragraphs.map((paragraph) => text(paragraph.text))].join('|')) }
  function sourcesForContext(context, paperId) {
    if (!context || context.documentId !== paperId || !Array.isArray(context.sources)) return []
    const out = [], seen = new Set()
    for (const source of context.sources) {
      if (!source || !/^[SC]\d+$/.test(text(source.sourceId)) || seen.has(source.sourceId) || source.documentId && source.documentId !== paperId || source.paperId && source.paperId !== paperId || source.anchor && source.anchor.documentId !== paperId || source.quoteVerified === false) continue
      const quote = text(source.quote || source.text)
      if (!quote.trim()) continue
      const anchor = bound(source.captionAnchor, paperId) || bound(source.anchor, paperId)
      if (/formula|equation/i.test(source.sourceKind || source.kind || '') && !(anchor && anchor.status === 'located' && anchor.quoteVerified === true)) continue
      seen.add(source.sourceId);out.push({ ...source, quote, text: quote, anchor, page: pageOf({ ...source, anchor }) })
    }
    return out
  }
  function canonicalSourceIdentity(source) {
    if (!source) return ''
    const anchor=source.anchor,quote=compact(text(source.quote||source.text).normalize('NFKC'))
    if (!anchor||!anchor.documentId||!quote) return ''
    const coordinates=item=>{const bbox=item&&item.pdfBBox||item&&item.bbox;return Array.isArray(bbox)&&bbox.length===4&&bbox.every(Number.isFinite)?[item.page==null?anchor.page:item.page,...bbox.map(n=>Math.round(n*10000)/10000)]:null}
    const segments=(Array.isArray(anchor.segments)?anchor.segments:[]).map(coordinates).filter(Boolean)
    if(!segments.length){const point=coordinates(anchor);if(point)segments.push(point)}
    if(segments.length)return JSON.stringify([anchor.documentId,segments.map(value=>JSON.stringify(value)).sort(),quote])
    if(anchor.kind==='pdf-text-range'&&Array.isArray(anchor.anchors))return JSON.stringify([anchor.documentId,anchor.kind,anchor.anchors,quote])
    return anchor.id?JSON.stringify([anchor.documentId,'id',anchor.id,quote]):''
  }
  function sourceMarkers(sources) {
    const out=new Map(),seen=new Map();let count=0
    for(const source of sources||[]){const identity=canonicalSourceIdentity(source)||'source:'+source.sourceId;if(!seen.has(identity))seen.set(identity,++count);out.set(source.sourceId,seen.get(identity))}
    return out
  }
  function paragraphEvidence(value, sources) {
    const map=sources instanceof Map?sources:new Map((sources||[]).map(source=>[source.sourceId,source])),ids=[],seenIds=new Set(),seenAnchors=new Set()
    const body=text(value).replace(/`[^`]+`|\[(?:[SC]\d+)(?:\s*[,，;；]\s*[SC]\d+)*\]/g,token=>{
      if(token.startsWith('`'))return token
      const unknown=[]
      for(const id of token.slice(1,-1).split(/\s*[,，;；]\s*/)){const source=map.get(id);if(!source){unknown.push(id);continue}const identity=canonicalSourceIdentity(source);if(seenIds.has(id)||identity&&seenAnchors.has(identity))continue;seenIds.add(id);if(identity)seenAnchors.add(identity);ids.push(id)}
      return unknown.length?'['+unknown.join(', ')+']':' '
    }).replace(/[ \t]+([，。；、！？：,.;!?])/g,'$1').replace(/[ \t]{2,}/g,' ').trim()
    return {text:body,ids}
  }
  function sourceForLocation(source, structure, paperId) {
    if(!source)return null
    // Location verification preserves semantic minus/hyphen signs. The looser
    // UI search key must not make A-B and AB the same anchored quotation.
    const locationKey=value=>text(value).normalize('NFKC').replace(/[\u00ad\u200b-\u200f\u2060\ufeff]/g,'')
      .replace(/['’‘]/g,"'").replace(/[“”]/g,'"').replace(/[‐‑–—−]/g,'-').replace(/\s+/g,'').toLowerCase()
    const assetSource=/^(?:figure|table)-(?:caption|mention|content)$/.test(source.sourceKind||'')
    const location=source.locationMode==='caption'?source.captionLocation:source.preferredLocation
    const locationAnchor=assetSource&&location&&location.documentId===paperId&&bound(location.anchor,paperId)
    const usable=locationAnchor&&locationAnchor.status==='located'&&locationAnchor.quoteVerified===true&&
      ['original-body-mention','original-caption'].includes(location.anchorScope)&&locationKey(locationAnchor.quote)&&
      locationKey(locationAnchor.quote)===locationKey(location.quote||location.text)&&Number.isInteger(location.page)&&location.page>=0&&locationAnchor.page===location.page
    const resolved=usable?{...source,...location,sourceId:source.sourceId,navigationRole:location.anchorScope}:source
    const out={...resolved,quote:text(resolved.quote||resolved.text),anchor:bound(resolved.anchor,paperId)},all=structure&&structure.documentId===paperId&&Array.isArray(structure.sections)?structure.sections:[]
    const byId=all.filter(section=>source.sectionId&&[section.id,section.anchorId].includes(source.sectionId)||source.sectionAnchorId&&[section.id,section.anchorId].includes(source.sectionAnchorId))
    const byTitle=all.filter(section=>locationKey(section.heading)===locationKey(source.sectionTitle)&&locationKey(source.sectionTitle))
    const section=byId.length===1?byId[0]:byTitle.length===1?byTitle[0]:null
    const scopes=[source.sourceKind,source.kind,source.anchorScope,source.scope,out.anchor&&out.anchor.scope,out.anchor&&out.anchor.precision,out.anchor&&out.anchor.kind].filter(Boolean)
    const rangeScope=value=>/(?:^|[-_ ])(?:chapter|section)(?:[-_ ](?:range|body|content|full|whole))?$/i.test(value)&&!/(?:heading|title)/i.test(value)
    const explicit=scopes.some(rangeScope)
    const collection=section?[section]:[]
    if(section){let at=all.indexOf(section)+1;while(at<all.length&&(Number(all[at].level)||1)>(Number(section.level)||1)){collection.push(all[at]);at+=1}}
    const paragraphs=collection.flatMap(item=>Array.isArray(item.paragraphs)?item.paragraphs:[]).filter(item=>text(item.text).trim()),joined=paragraphs.map(item=>item.text).join('\n'),withHeadings=collection.flatMap(item=>[item.heading,...(item.paragraphs||[]).map(paragraph=>paragraph.text)]).join('\n')
    const whole=paragraphs.length>1&&(locationKey(out.quote)===locationKey(joined)||locationKey(out.quote)===locationKey(section.heading+'\n'+joined)||locationKey(out.quote)===locationKey(withHeadings))
    if(explicit||whole){const heading=text(section&&section.heading||source.sectionTitle),anchor=section&&bound(section.anchor,paperId),segments=anchor&&Array.isArray(anchor.segments)?anchor.segments:[],safe=anchor&&locationKey(anchor.quote)===locationKey(heading)&&![anchor.scope,anchor.precision,anchor.kind].filter(Boolean).some(rangeScope)&&segments.length<=4&&segments.every(segment=>segment.page==null||segment.page===pageOf(section));return{...out,quote:heading,text:heading,anchor:safe?anchor:null,page:section?pageOf(section):out.page,locationPrecision:heading?'heading':'unavailable'}}
    if(out.anchor&&out.anchor.quote&&locationKey(out.anchor.quote)!==locationKey(out.quote))out.anchor=null
    return out
  }
  function termsFor(node, paperId) {
    const out = [], seen = new Set()
    for (const source of sourcesOf(node, paperId)) {
      for (const match of source.quote.matchAll(/([A-Z][A-Za-z]+(?:[- ][A-Za-z]+){1,8})\s*[（(]([A-Z][A-Za-z\d-]{1,10})[）)]/g)) {
        const term = match[2], words = compact(match[1]).split(/\s+/), caps = term.replace(/[^A-Z]/g, '').toLowerCase()
        let expansion = ''
        for (let count = 2; count <= words.length; count += 1) { const tail = words.slice(-count);if (tail.map((word) => word[0]).join('').toLowerCase() === caps) { expansion = tail.join(' ');break } }
        if (!expansion || seen.has(term)) continue
        seen.add(term);out.push({ term, expansion, source })
        if (out.length >= 24) return out
      }
    }
    return out
  }
  function parseNarrative(value, chapter, ready) {
    let content = text(value).replace(/\r\n/g, '\n'), displayTitle = ''
    const opening = content.match(/^\s*#\s+([^\n]+)(?:\n|$)/)
    if (opening && (content.includes('\n') || ready)) { displayTitle = compact(opening[1]);content = content.slice(opening[0].length) }
    let sectionId = chapter.id
    const blocks = content.split(/\n\s*\n/).filter((part) => part.trim()).map((rawPart) => {
      const part=rawPart.trim()
      const heading = part.match(/^(?:#{1,6}\s+)?§\s*([^\n]+)(?:\n([\s\S]*))?$/) || part.match(/^#{1,6}\s+([^\n]+)(?:\n([\s\S]*))?$/)
      if (heading) {
        const title = compact(heading[1]),matchTitle=title.replace(/\[(?:[SC]\d+)(?:\s*[,，;；]\s*[SC]\d+)*\]/g,''),matches = chapter.sections.filter((section) => key(matchTitle) === key(section.heading) || key(section.heading).length > 5 && key(matchTitle).includes(key(section.heading)))
        if (matches.length === 1) sectionId = matches[0].id
        return { type: 'heading', text: title, body: text(heading[2]), sectionId: matches.length === 1 ? sectionId : '', currentSectionId: sectionId }
      }
      if (/^```/.test(part)) return { type: 'code', text: part.replace(/^```[^\n]*\n?/, '').replace(/\n?```\s*$/, ''), sectionId }
      const lines = part.split('\n')
      if (lines.every((line) => /^\s*[-*]\s+/.test(line))) return { type: 'list', lines: lines.map((line) => line.replace(/^\s*[-*]\s+/, '')), sectionId }
      return { type: 'paragraph', text: part, sectionId }
    })
    const merged=[]
    for(const block of blocks){const previous=merged[merged.length-1],citationOnly=block.type==='paragraph'&&/^\s*(?:\[(?:[SC]\d+)(?:\s*[,，;；]\s*[SC]\d+)*\][\s.,，。；;]*)+$/.test(block.text);if(citationOnly&&previous&&previous.type==='paragraph')previous.text+=' '+block.text;else merged.push(block)}
    return { displayTitle, blocks:merged }
  }
  function hasReadableNarrative(narrative) {
    return Boolean(narrative && narrative.blocks && narrative.blocks.some(block => {
      const value = block.type === 'heading' ? block.body : block.type === 'list' ? block.lines.join(' ') : block.text
      const body = text(value).replace(/\[(?:[SC]\d+)(?:\s*[,，;；]\s*[SC]\d+)*\]/g, '')
      return (body.match(/[\p{L}\p{N}]/gu) || []).length >= 3
    }))
  }
  const CSS = `
.lrcp.is-direct{height:100%;min-height:0;min-width:0;display:flex;flex-direction:column;position:relative;color:var(--dsw-alias-label-primary);font:14px/1.9 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}
.lrcp.is-direct *{box-sizing:border-box}.lrcp.is-direct button,.lrcp.is-direct input{font:inherit}.lrcp.is-direct button{cursor:pointer}.lrcp.is-direct button:disabled{cursor:default;opacity:.45}.lrcp.is-direct :is(button,input):focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
.lrcp.is-direct{--lrcp-glass-ground:var(--gloss-thin-surface,var(--lr-shell-ground,var(--dsw-alias-bg-overlay)));--lrcp-glass-ink:var(--lr-shell-ink,var(--dsw-alias-label-primary));--lrcp-glass-edge:color-mix(in srgb,var(--lrcp-glass-ground) 66%,rgb(255 255 255) 34%);--lrcp-glass-rim:3.25px;--lrcp-glass-highlight:color-mix(in srgb,var(--lrcp-glass-ground) 32%,white 68%);--lrcp-glass-thumb-tint:color-mix(in srgb,var(--lrcp-glass-ground) 72%,white 28%);--rail-light:.5}
.lrcp.is-direct>.lrcp-rail,.lr-root .lrcp.is-direct>header.lrcp-rail[data-material="clear-lens"]{flex:none;position:relative;isolation:isolate;z-index:3;margin:0 0 8px;padding:13px 24px 8px;border:0;border-radius:25px;background:color-mix(in srgb,var(--lrcp-glass-ground) 10%,transparent);backdrop-filter:blur(2px) saturate(1.16);-webkit-backdrop-filter:blur(2px) saturate(1.16);box-shadow:inset 0 .5px 0 color-mix(in srgb,var(--lrcp-glass-highlight) 68%,transparent),0 1px 4px rgb(0 0 0 / .03)}
.lrcp.is-direct>.lrcp-rail::before,.lr-root .lrcp.is-direct>header.lrcp-rail[data-material="clear-lens"]::before,.lrcp.is-direct .lrcp-slider-track>.lrcp-glass-thumb::before{content:"";position:absolute;inset:0;padding:var(--lrcp-glass-rim,3px);border-radius:inherit;pointer-events:none;z-index:0;box-sizing:border-box;border:0;background:linear-gradient(145deg,color-mix(in srgb,var(--lrcp-glass-highlight) 88%,transparent),transparent 31%,color-mix(in srgb,var(--lrcp-glass-ground) 9%,transparent) 65%,color-mix(in srgb,var(--lrcp-glass-highlight) 64%,transparent));backdrop-filter:blur(10px) saturate(1.18);-webkit-backdrop-filter:blur(10px) saturate(1.18);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask-composite:xor}
.lrcp.is-direct>.lrcp-rail::after,.lr-root .lrcp.is-direct>header.lrcp-rail[data-material="clear-lens"]::after,.lrcp.is-direct .lrcp-slider-track>.lrcp-glass-thumb::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;box-sizing:border-box;border:0;background:radial-gradient(ellipse at calc(12% + var(--rail-light,.5)*76%) 0%,color-mix(in srgb,var(--lrcp-glass-highlight) 86%,transparent),transparent 66%);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;-webkit-mask-composite:xor;padding:1px;box-shadow:inset 0 .5px 0 color-mix(in srgb,var(--lrcp-glass-highlight) 76%,transparent)}
.lrcp-direct-heading{position:relative;z-index:1;display:flex;align-items:baseline;gap:14px;justify-content:space-between}.lrcp-current-title{font-size:16.5px;font-weight:560;line-height:1.5;color:var(--lrcp-glass-ink);filter:none;text-shadow:none;min-width:0;overflow-wrap:anywhere;letter-spacing:-.01em}.lrcp.is-direct .lrcp-preview{position:relative;z-index:1;min-height:17px;margin:1px 0 0;font-size:11px;line-height:1.5;color:var(--lr-shell-muted,var(--dsw-alias-label-secondary));display:flex;justify-content:space-between;gap:10px}.lrcp-preview strong{font:inherit;color:inherit}
.lrcp-slider-wrap{position:relative;height:36px;margin:0 0 1px;--progress:0}.lrcp.is-direct .lrcp-slider-track{position:absolute;left:12px;right:12px;top:18px;height:2px;border:0;outline:0;box-shadow:none;border-radius:2px;background:color-mix(in srgb,var(--lrcp-glass-ink) 9%,transparent);pointer-events:none}.lrcp.is-direct .lrcp-slider-progress{position:absolute;inset:0 auto 0 0;width:calc(var(--progress)*100%);height:2px;border:0;outline:0;box-shadow:none;border-radius:2px;background:color-mix(in srgb,var(--lrcp-glass-ink) 24%,transparent);transition:width .2s linear}.lrcp.is-direct .is-dragging .lrcp-slider-progress{transition:none}
.lrcp.is-direct .lrcp-slider-track>.lrcp-glass-thumb{position:absolute;isolation:isolate;left:calc(var(--progress)*100%);top:1px;width:40px;height:26px;border:0!important;outline:0!important;border-radius:999px;pointer-events:none;transform:translate(-50%,-50%);background:color-mix(in srgb,var(--lrcp-glass-thumb-tint) 22%,transparent);backdrop-filter:blur(2px) saturate(1.22);-webkit-backdrop-filter:blur(2px) saturate(1.22);box-shadow:inset 0 .5px 0 color-mix(in srgb,var(--lrcp-glass-highlight) 82%,transparent),0 1px 4px rgb(0 0 0 / .035);transition:left .2s linear,transform .12s linear,background .12s linear}.lrcp.is-direct .lrcp-slider-track>.lrcp-glass-thumb::before{--lrcp-glass-rim:3px;backdrop-filter:blur(9px) saturate(1.2);-webkit-backdrop-filter:blur(9px) saturate(1.2)}.lrcp.is-direct .lrcp-slider-wrap.is-dragging .lrcp-glass-thumb{transform:translate(-50%,-50%) scaleX(1.09) scaleY(.96);transition:transform .12s linear,background .12s linear;background:color-mix(in srgb,var(--lrcp-glass-thumb-tint) 26%,transparent)}
.lrcp.is-direct input.lrcp-slider,.lr-root .lrcp.is-direct input.lrcp-slider{appearance:none!important;-webkit-appearance:none!important;position:absolute;inset:0;width:100%;height:36px;margin:0;padding:0;opacity:1;border:0!important;outline:0!important;box-shadow:none!important;filter:none!important;background:transparent!important;color:transparent;accent-color:transparent;border-radius:0;cursor:pointer;z-index:2;touch-action:pan-y}.lrcp.is-direct input.lrcp-slider:focus,.lrcp.is-direct input.lrcp-slider:focus-visible{outline:0!important;box-shadow:none!important}
.lrcp.is-direct input.lrcp-slider::-webkit-slider-runnable-track{height:36px;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important}.lrcp.is-direct input.lrcp-slider::-webkit-slider-thumb{appearance:none!important;-webkit-appearance:none!important;width:24px;height:36px;margin:0;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;border-radius:0}.lrcp.is-direct input.lrcp-slider::-moz-range-track,.lrcp.is-direct input.lrcp-slider::-moz-range-progress{height:36px;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important}.lrcp.is-direct input.lrcp-slider::-moz-range-thumb{width:24px;height:36px;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;border-radius:0}
.lrcp.is-direct .lrcp-slider-wrap:has(.lrcp-slider:focus-visible) .lrcp-glass-thumb{background:color-mix(in srgb,var(--lrcp-glass-ground) 28%,transparent);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--lrcp-glass-edge) 92%,transparent),0 0 0 2px color-mix(in srgb,var(--lrcp-glass-edge) 20%,transparent),0 1px 5px rgb(0 0 0 / .025);transform:translate(-50%,-50%) scale(1.04)}
.lrcp.is-direct .lrcp-ticks{position:relative;height:22px;margin:0 12px;display:block}.lrcp.is-direct .lrcp-tick{position:absolute;top:-4px;width:28px;height:26px;min-height:26px;padding:0;border:0;box-shadow:none;background:transparent;transform:translateX(-50%);color:var(--lr-shell-muted,var(--dsw-alias-label-secondary))}.lrcp-tick-mark{display:block;width:4px;height:4px;margin:0 auto;background:color-mix(in srgb,currentColor 40%,transparent);border-radius:50%;transition:transform .12s linear,background .12s linear}.lrcp-tick.is-current .lrcp-tick-mark{background:color-mix(in srgb,var(--lrcp-glass-ink) 78%,transparent);transform:scale(1.4)}.lrcp-tick:hover .lrcp-tick-mark{transform:scale(1.6)}.lrcp.is-direct .lrcp-tick:focus-visible{outline:0!important;box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--lrcp-glass-edge) 90%,transparent),0 0 0 2px color-mix(in srgb,var(--lrcp-glass-edge) 20%,transparent);background:color-mix(in srgb,var(--lrcp-glass-ground) 24%,transparent);border-radius:10px}
.lrcp.is-direct>.lrcp-scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:13px 6px 26px;scrollbar-color:color-mix(in srgb,var(--dsw-alias-label-secondary) 24%,transparent) transparent}.lrcp-prose{max-width:70ch;margin:0 auto;overflow-wrap:anywhere}.lrcp-prose p{margin:0 0 1.05em;font-size:14px;line-height:1.95}.lrcp-prose p:first-of-type{font-size:14.5px}.lrcp-prose h3{font-size:15px;font-weight:620;line-height:1.65;margin:1.8em 0 .65em;letter-spacing:-.005em}.lrcp-prose ul{padding-left:1.3em;margin:0 0 1.1em}.lrcp-prose li{margin-bottom:.35em}.lrcp-prose pre{white-space:pre-wrap;font:12px/1.75 ui-monospace,monospace;overflow:auto;margin:1em 0}.lrcp-prose code{font-size:.93em}.lrcp-prose ::selection{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 24%,transparent);color:inherit}
.lrcp-source-link,.lrcp-term-inline{display:inline;min-height:24px;border:0;background:transparent;padding:0 3px;border-radius:4px;color:var(--dsw-alias-brand-primary);font-size:.9em!important;line-height:inherit;vertical-align:baseline;text-decoration:underline;text-decoration-color:color-mix(in srgb,currentColor 35%,transparent);text-underline-offset:3px}.lrcp-source-link:hover,.lrcp-term-inline:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent)}.lrcp-term-inline{color:inherit;text-decoration-style:dotted;padding:0 1px;font-size:1em!important}.lrcp-term-definition{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.8}.lrcp-source-status,.lrcp-loading,.lrcp-error{font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary);margin:10px 0}.lrcp-error{color:var(--dsw-alias-state-error-primary)}.lrcp-retry{border:0;background:transparent;padding:3px;color:var(--dsw-alias-brand-primary);font-size:12px;text-decoration:underline;text-underline-offset:3px}
.lrcp-caption-link{opacity:.7}.lrcp-caption-link:hover,.lrcp-caption-link:focus-visible{opacity:1}.lrcp-source-group{display:inline-flex;align-items:baseline;flex-wrap:wrap;max-width:100%;gap:1px;margin-left:4px;vertical-align:baseline;white-space:normal}.lrcp.is-direct .lrcp-source-group .lrcp-source-link{display:inline-flex;align-items:center;justify-content:center;min-width:21px;min-height:20px;padding:0 3px;font-size:10.5px!important;font-weight:500;line-height:1.5;text-decoration:none;white-space:nowrap;border-radius:4px;vertical-align:baseline;font-variant-numeric:tabular-nums}
.lrcp.is-direct>.lrcp-scroll.is-waiting{display:flex;flex-direction:column}.lrcp-prose.is-waiting{display:flex;flex:1;min-height:160px;width:100%;max-width:none;margin:0}.lrcp-waiting{display:flex;align-items:center;justify-content:flex-start;margin:0 0 12px}.lrcp-waiting.is-centered{display:grid;place-items:center;flex:1;min-height:160px;margin:0;padding:18px}.lrcp-waiting-capsule{display:inline-flex;align-items:center;justify-content:center;gap:4px;width:44px;height:26px;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 9%,transparent);color:var(--dsw-alias-label-secondary);box-shadow:none;pointer-events:none}.lrcp-waiting-dot{display:block;flex:none;width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.4;animation:lrcp-wait-pulse 1.2s ease-in-out infinite}.lrcp-waiting-dot:nth-child(2){animation-delay:.14s}.lrcp-waiting-dot:nth-child(3){animation-delay:.28s}.lrcp-waiting.is-centered .lrcp-waiting-capsule{width:72px;height:40px;gap:6px}.lrcp-waiting.is-centered .lrcp-waiting-dot{width:7px;height:7px}
@keyframes lrcp-wait-pulse{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:.85;transform:translateY(-2px)}}
@media(prefers-reduced-motion:reduce){.lrcp-waiting-dot{animation:none;opacity:.55;transform:none}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lrcp-waiting-capsule{background:var(--lr-shell-raised,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary)}}
@media(pointer:coarse){.lrcp.is-direct .lrcp-source-group .lrcp-source-link{min-width:28px;min-height:28px}}
.lrcp.is-direct>.lrcp-next{flex:none;display:flex;justify-content:flex-end;align-items:center;padding:8px 2px 9px;margin:0;border:0}.lrcp.is-direct .lrcp-next button{min-height:34px;border:0;border-radius:999px;padding:6px 17px;background:color-mix(in srgb,var(--lrcp-glass-ground) 14%,transparent);color:var(--lrcp-glass-ink);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--lrcp-glass-edge) 60%,transparent);font-size:12.5px;font-weight:500;line-height:1.6}.lrcp-next button:active{opacity:.8}.lrcp-next button:disabled{background:transparent;color:var(--dsw-alias-label-secondary);opacity:.5}.lrcp-selection-action{position:absolute;z-index:5;min-height:30px;border:0;border-radius:999px;padding:5px 12px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 85%,transparent);color:var(--dsw-alias-label-primary);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 3px 14px rgb(0 0 0 / .1);font-size:12px!important;line-height:1.6}.lrcp-empty{padding:24px 0;font-size:13px;line-height:1.8}.lrcp-empty button{border:0;border-radius:8px;padding:5px 10px;background:var(--dsw-alias-bg-layer-1);color:inherit}
@media(max-width:720px){.lrcp.is-direct>.lrcp-rail,.lr-root .lrcp.is-direct>header.lrcp-rail[data-material="clear-lens"]{padding:12px 24px 7px}.lrcp-current-title{font-size:16px}.lrcp.is-direct>.lrcp-scroll{padding-left:1px;padding-right:1px}}
@media(pointer:coarse){.lrcp-next button,.lrcp-selection-action{min-height:44px}.lrcp.is-direct input.lrcp-slider{height:44px}.lrcp-slider-wrap{height:44px}.lrcp.is-direct .lrcp-slider-track{top:22px}.lrcp.is-direct .lrcp-slider-track>.lrcp-glass-thumb{height:28px;width:42px}.lrcp-source-link,.lrcp-term-inline{min-height:28px}}
@media(prefers-reduced-motion:reduce){.lrcp.is-direct *{transition:none!important;scroll-behavior:auto!important}}
@supports not ((mask-composite:exclude) or (-webkit-mask-composite:xor)){.lrcp.is-direct>.lrcp-rail::before,.lrcp.is-direct>.lrcp-rail::after,.lrcp-glass-thumb::before,.lrcp-glass-thumb::after{display:none}.lrcp.is-direct>.lrcp-rail,.lrcp.is-direct .lrcp-slider-track>.lrcp-glass-thumb{box-shadow:inset 0 1px 0 color-mix(in srgb,var(--lrcp-glass-edge) 70%,transparent),0 1px 4px rgb(0 0 0 / .025)}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.lrcp.is-direct>.lrcp-rail,.lr-root .lrcp.is-direct>header.lrcp-rail[data-material="clear-lens"],.lrcp-glass-thumb,.lrcp-selection-action{background:var(--dsw-alias-bg-overlay);backdrop-filter:none;-webkit-backdrop-filter:none}.lrcp.is-direct>.lrcp-rail::before,.lrcp.is-direct>.lrcp-rail::after,.lrcp-glass-thumb::before,.lrcp-glass-thumb::after{display:none}.lrcp.is-direct .lrcp-slider-track>.lrcp-glass-thumb{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--lrcp-glass-ink) 30%,transparent)}}
`
  function createChapters(React) {
    const h = React.createElement, { useState, useEffect, useRef } = React
    function Component(props) {
      const paperId = text(props.paperId || props.paper && props.paper.id), chapters = chaptersOf(props.structure, paperId)
      const state = normalizeState(props.state, paperId, chapters), active = props.active !== false
      const stateRef = useRef(state), propsRef = useRef(props), paperRef = useRef(paperId), chaptersRef = useRef(chapters)
      stateRef.current = state;propsRef.current = props;paperRef.current = paperId;chaptersRef.current = chapters
      const [ready,setReady] = useState(false), [previewValue,setPreviewValue] = useState(null), [dragging,setDragging] = useState(false), [selection,setSelection] = useState(null), [location,setLocation] = useState(null), [followWaiting,setFollowWaiting] = useState(false)
      const rootRef=useRef(null),scrollRef=useRef(null),proseRef=useRef(null),requestRef=useRef(0),controllerRef=useRef(null),mountedRef=useRef(true),lifecycleRef=useRef(0),attemptsRef=useRef(new Set()),restoreRef=useRef(null),previewRef=useRef(null),pointerRef=useRef(null),navigationRef=useRef(null),locateRef=useRef(0),translationRef=useRef(new Set())
      const followTimerRef=useRef(null),followPendingRef=useRef(null),userScrollRef=useRef(null)
      const current=chapters.find((chapter)=>chapter.id===state.currentSection)||chapters[0],at=current?chapters.findIndex((chapter)=>chapter.id===current.id):0
      const ckey=current&&cacheKey(current),cached=ckey&&state.chapterCache[ckey],context=cached&&cached.context,sourceList=sourcesForContext(context,paperId),sourceMap=new Map(sourceList.map((source)=>[source.sourceId,source]))
      const mathPrepared=current&&scope.__glossMath?scope.__glossMath.prepare(cached&&cached.text):null
      const narrative=current?parseNarrative(mathPrepared?mathPrepared.text:cached&&cached.text,current,cached&&cached.status==='ready'):{displayTitle:'',blocks:[]},terms=current?termsFor(current,paperId):[]
      const hasBody=hasReadableNarrative(narrative),waiting=active&&Boolean(props.onGenerateChapter)&&(!cached||cached.status==='streaming'),centralWaiting=waiting&&!hasBody
      const readingPosition=normalizedPosition(props.readingPosition,paperId),axis=readingAxis(props.structure,paperId),axisTicks=axis&&axis.ticks||[],previewTick=previewValue==null?null:chapterAtSliderPosition(props.structure,paperId,previewValue),previewIndex=previewTick?chapters.findIndex((item)=>item.id===previewTick.chapterId):at,preview=chapters[previewIndex]
      function commit(change) {
        if (!mountedRef.current||paperRef.current!==paperId) return false
        const next=typeof change==='function'?change(stateRef.current):{...stateRef.current,...change};next.paperId=paperId;next.version=2;next.mode='direct';stateRef.current=next
        if(propsRef.current.onChange)propsRef.current.onChange(clone(next,{}),{paperId});return true
      }
      const readingActive=()=>mountedRef.current&&paperRef.current===paperId&&propsRef.current.active!==false
      const later=(fn,delay)=>(scope.setTimeout||setTimeout)(fn,delay)
      const clearLater=(handle)=>{if(handle!=null)(scope.clearTimeout||clearTimeout)(handle)}
      function cancelFollowWait(){clearLater(followTimerRef.current);followTimerRef.current=null;followPendingRef.current=null;setFollowWaiting(false)}
      function cancelScrollRestore(){if(readingActive())restoreRef.current=null}
      function abortGeneration(){requestRef.current+=1;if(controllerRef.current)controllerRef.current.abort();controllerRef.current=null;const chapter=chaptersRef.current.find((item)=>item.id===stateRef.current.currentSection);if(chapter)attemptsRef.current.delete(paperId+':'+cacheKey(chapter))}
      function setPreview(value){previewRef.current=value;setPreviewValue(value)}
      function sourceOfSection(chapter,sectionId){const section=chapter.sections.find((item)=>item.id===sectionId)||chapter;return{quote:section.heading,text:section.heading,sectionId:section.id,page:section.page,anchor:section.anchor}}
      async function locateSource(source,locateKey,mode) {
        if(!mountedRef.current||paperRef.current!==paperId||!active||!source||!source.quote||!propsRef.current.onLocate)return false
        const target=sourceForLocation(source,propsRef.current.structure,paperId)
        if(!target||!target.quote){setLocation({key:locateKey,state:'unavailable',text:'该出处仅有整章范围，尚无可靠标题位置。'});return false}
        const request=++locateRef.current,lifecycle=lifecycleRef.current
        navigationRef.current={mode:mode||'source',chapterId:stateRef.current.currentSection,until:Date.now()+3000}
        setLocation({key:locateKey,state:'loading',text:'正在定位…'});setSelection(null)
        try{const ok=await propsRef.current.onLocate(target.quote,bound(target.anchor,paperId),{reference:mode!=='chapter',origin:{paperId,sectionId:stateRef.current.currentSection,subsectionId:stateRef.current.currentSubsection,scrollTop:scrollRef.current?scrollRef.current.scrollTop:0}});if(!mountedRef.current||paperRef.current!==paperId||lifecycle!==lifecycleRef.current||request!==locateRef.current)return false
          if(ok===true&&mode!=='chapter')commit({pdfMovedSinceEntry:true})
          if(!ok)navigationRef.current=null
          setLocation({key:locateKey,state:ok===true?'found':'unavailable',text:ok===true?(target.locationPrecision==='heading'?'该出处仅有章节范围，已定位章节标题。':'已定位原文。'):'暂未准确定位，请核对原文。'});return ok===true
        }catch{if(mountedRef.current&&paperRef.current===paperId&&lifecycle===lifecycleRef.current&&request===locateRef.current){navigationRef.current=null;setLocation({key:locateKey,state:'error',text:'定位未完成，可稍后重试。'})}return false}
      }
      function go(index){if(!mountedRef.current||paperRef.current!==paperId||!active)return;const chapter=chaptersRef.current[index];if(!chapter)return;cancelFollowWait();if(chapter.id!==stateRef.current.currentSection)abortGeneration();setPreview(null);setDragging(false);setSelection(null);setLocation(null)
        restoreRef.current={chapterId:chapter.id,sectionId:chapter.id,scroll:0,preferSection:false}
        commit((previous)=>({...previous,currentSection:chapter.id,currentSubsection:chapter.id,started:true,pdfMovedSinceEntry:false,railPdfPosition:chapterReadingPosition(chapter,propsRef.current.structure,paperId),scrollPositions:{...previous.scrollPositions,[chapter.id]:0}}))
        locateSource(sourceOfSection(chapter,chapter.id),'chapter:'+chapter.id,'chapter')
      }
      function nextChapter(){if(!mountedRef.current||paperRef.current!==paperId||!active||!current)return;if(at<chapters.length-1)go(at+1)}
      async function generate(){const chapter=chaptersRef.current.find((item)=>item.id===stateRef.current.currentSection);if(!chapter||!propsRef.current.onGenerateChapter||controllerRef.current)return
        const target=cacheKey(chapter),request=++requestRef.current,controller=new AbortController(),lifecycle=lifecycleRef.current;controllerRef.current=controller
        const alive=()=>mountedRef.current&&paperRef.current===paperId&&lifecycleRef.current===lifecycle&&requestRef.current===request&&!controller.signal.aborted
        let accumulated='',latestContext=null
        const oldCache=stateRef.current.chapterCache[target],retained=oldCache&&hasReadableNarrative(parseNarrative(oldCache.text,chapter,true))?oldCache:null
        const update=(value)=>{if(!alive())return;const keep=retained&&!hasReadableNarrative(parseNarrative(value.text,chapter,value.status==='ready'))&&(value.status==='streaming'||value.status==='error');const shown=keep?{...value,text:retained.text,context:retained.context||null,displayTitle:retained.displayTitle,refreshingFromCache:value.status==='streaming'}:value;commit((previous)=>({...previous,chapterCache:{...previous.chapterCache,[target]:{...shown,sectionId:chapter.id}}}))}
        update({text:'',context:null,status:'streaming'})
        try{const result=await propsRef.current.onGenerateChapter({paperId,kind:'content',section:{...chapter.original,id:chapter.id,heading:chapter.heading,kind:chapter.kind,page:chapter.page,anchor:chapter.anchor,paragraphs:chapter.paragraphs,subsections:chapter.subsections.map((item)=>({...item.original,id:item.id,heading:item.heading,kind:item.kind,page:item.page,anchor:item.anchor}))},currentSubsection:stateRef.current.currentSubsection,signal:controller.signal},(delta,nextContext)=>{if(!alive())return;accumulated+=typeof delta==='string'?delta:text(delta&&delta.text);if(nextContext&&nextContext.documentId===paperId)latestContext=clone(nextContext,null);update({text:accumulated,context:latestContext,status:'streaming'})})
          if(!alive())return;const output=typeof result==='string'?result:text(result&&result.text)||accumulated;if(!output.trim())throw Error('没有收到本章讲解，请重试。')
          if(!hasReadableNarrative(parseNarrative(output,chapter,true)))throw Error('没有收到本章正文，请重试。')
          update({text:output,context:result&&result.context&&result.context.documentId===paperId?clone(result.context,null):latestContext,displayTitle:text(result&&result.displayTitle),status:'ready',generatedAt:Date.now()})
        }catch(error){if(alive())update({text:accumulated,context:latestContext,status:'error',error:error&&error.message||'本章讲解未生成，请重试。'})}
        finally{if(requestRef.current===request)controllerRef.current=null}
      }
      async function translateTerm(term){if(!mountedRef.current||paperRef.current!==paperId||!active||!propsRef.current.onTranslate)return;const id=hash(term.expansion),token=paperId+':'+lifecycleRef.current+':'+id,previous=stateRef.current.translations[id];if(previous&&previous.status==='ready'||translationRef.current.has(token))return
        const lifecycle=lifecycleRef.current;translationRef.current.add(token);commit((s)=>({...s,translations:{...s.translations,[id]:{status:'loading',text:''}}}))
        try{const result=await propsRef.current.onTranslate(term.expansion);if(!mountedRef.current||paperRef.current!==paperId||lifecycleRef.current!==lifecycle)return;const output=typeof result==='string'?result:text(result&&result.text);if(!output)throw Error('译注未返回，可重新展开重试。');commit((s)=>({...s,translations:{...s.translations,[id]:{status:'ready',text:output}}}))}
        catch(error){if(mountedRef.current&&paperRef.current===paperId&&lifecycleRef.current===lifecycle)commit((s)=>({...s,translations:{...s.translations,[id]:{status:'error',text:'',error:error&&error.message||'译注未完成。'}}}))}
        finally{translationRef.current.delete(token)}
      }
      useEffect(()=>{mountedRef.current=true;lifecycleRef.current+=1;cancelFollowWait();userScrollRef.current=null;setReady(false);attemptsRef.current.clear();translationRef.current.clear();setSelection(null);setLocation(null);setPreview(null);return()=>{mountedRef.current=false;lifecycleRef.current+=1;clearLater(followTimerRef.current);followTimerRef.current=null;followPendingRef.current=null;abortGeneration();locateRef.current+=1}},[paperId])
      useEffect(()=>{if(!active){cancelFollowWait();abortGeneration();setSelection(null);setPreview(null)}},[active])
      useEffect(()=>{if(!active||!chaptersRef.current.length)return;const previous=stateRef.current,point=normalizedPosition(propsRef.current.readingPosition,paperId)
        const follow=!previous.started||previous.pdfMovedSinceEntry||!sameReadingPosition(point,previous.lastSeenPdfPosition||previous.entryPdfPosition)
        const target=follow&&positionForReading(propsRef.current.structure,paperId,point),chapterId=target&&target.chapterId||previous.currentSection||chaptersRef.current[0].id,sectionId=target&&target.sectionId||previous.currentSubsection||chapterId
        cancelFollowWait();userScrollRef.current=point&&Number.isFinite(point.userScrollId)?point.userScrollId:null;if(chapterId!==previous.currentSection)abortGeneration()
        restoreRef.current={chapterId,sectionId,scroll:follow?0:Math.max(0,Number(previous.scrollPositions[chapterId])||0),preferSection:Boolean(target&&target.sectionId!==chapterId)}
        commit({currentSection:chapterId,currentSubsection:sectionId,started:true,entryPdfPosition:point,lastSeenPdfPosition:point,railPdfPosition:follow?point:previous.railPdfPosition||point,pdfMovedSinceEntry:false})
        setPreview(null);setReady(true)
      },[paperId,props.entryPositionKey,active,chapters.map((chapter)=>chapter.id).join('|')])
      useEffect(()=>{if(!active||!ready||!readingPosition)return;const previous=stateRef.current,scrollId=readingPosition.userScrollId,newUser=readingPosition.intent==='user'&&Number.isFinite(scrollId)&&(userScrollRef.current==null||scrollId>userScrollRef.current)
        if(newUser&&Number.isFinite(scrollId))userScrollRef.current=scrollId
        if(sameReadingPosition(readingPosition,previous.lastSeenPdfPosition)&&!newUser)return
        const navigation=navigationRef.current,chapterNavigation=navigation&&navigation.mode==='chapter'&&navigation.chapterId===previous.currentSection&&navigation.until>=Date.now()
        const target=newUser&&positionForReading(propsRef.current.structure,paperId,readingPosition)
        if(target&&(target.chapterId!==previous.currentSection||target.sectionId!==previous.currentSubsection)){
          const changedChapter=target.chapterId!==previous.currentSection
          if(changedChapter){abortGeneration();cancelFollowWait();const lifecycle=lifecycleRef.current;followPendingRef.current={chapterId:target.chapterId,lifecycle};setFollowWaiting(true);followTimerRef.current=later(()=>{followTimerRef.current=null;if(readingActive()&&lifecycle===lifecycleRef.current&&stateRef.current.currentSection===target.chapterId){followPendingRef.current=null;setFollowWaiting(false)}},320)}
          setSelection(null);setLocation(null)
          restoreRef.current={chapterId:target.chapterId,sectionId:target.sectionId,scroll:Number(previous.scrollPositions[target.chapterId])||0,preferSection:target.sectionId!==target.chapterId}
          commit({currentSection:target.chapterId,currentSubsection:target.sectionId,lastSeenPdfPosition:readingPosition,railPdfPosition:readingPosition,pdfMovedSinceEntry:false})
          return
        }
        commit({lastSeenPdfPosition:readingPosition,...(newUser?{railPdfPosition:readingPosition}:{}),pdfMovedSinceEntry:chapterNavigation?false:true})
      },[paperId,active,ready,readingPosition&&readingPosition.page,readingPosition&&readingPosition.offset,readingPosition&&readingPosition.intent,readingPosition&&readingPosition.userScrollId])
      useEffect(()=>{if(!active||!ready||!current||!props.onGenerateChapter||followPendingRef.current)return;const signature=paperId+':'+ckey;if(cached&&(cached.status==='ready'||cached.status==='error')||attemptsRef.current.has(signature))return;attemptsRef.current.add(signature);generate()},[paperId,active,ready,current&&current.id,ckey,followWaiting])
      useEffect(()=>{const element=scrollRef.current,pending=restoreRef.current;if(!element||!current||!pending||pending.chapterId!==current.id)return
        if(pending.preferSection){const heading=typeof element.querySelectorAll==='function'?[...element.querySelectorAll('[data-section-heading]')].find((node)=>node.dataset.sectionHeading===pending.sectionId):null;if(!heading)return;restoreRef.current=null;element.scrollTop+=heading.getBoundingClientRect().top-element.getBoundingClientRect().top-12}
        else{restoreRef.current=null;element.scrollTop=pending.scroll}
      },[paperId,current&&current.id,state.currentSubsection,cached&&cached.text,ready,props.entryPositionKey])
      useEffect(()=>{const term=terms.find((item)=>item.term===state.activeTerm),entry=term&&state.translations[hash(term.expansion)];if(term&&entry&&entry.status==='loading')translateTerm(term)},[paperId,state.activeTerm,state.translations])
      function onScroll(event){if(!current)return;setSelection(null);const element=event.currentTarget,value=Math.max(0,Math.round(element.scrollTop));let sectionId=stateRef.current.currentSubsection
        if(typeof element.querySelectorAll==='function'){const top=element.getBoundingClientRect().top+36;for(const node of element.querySelectorAll('[data-section-heading]'))if(node.getBoundingClientRect().top<=top)sectionId=node.dataset.sectionHeading}
        const previous=stateRef.current;if(Math.abs((Number(previous.scrollPositions[current.id])||0)-value)<3&&sectionId===previous.currentSubsection)return
        commit((s)=>({...s,currentSubsection:sectionId,scrollPositions:{...s.scrollPositions,[current.id]:value},sectionPositions:{...s.sectionPositions,[current.id]:sectionId}}))
      }
      function captureSelection(event){if(!mountedRef.current||paperRef.current!==paperId||!active)return;if(event&&event.target&&event.target.closest&&event.target.closest('button'))return;const selected=typeof scope.getSelection==='function'?scope.getSelection():null,prose=proseRef.current,root=rootRef.current
        if(!selected||selected.isCollapsed||!selected.rangeCount||!prose||!root){setSelection(null);return}const range=selected.getRangeAt(0)
        if(!prose.contains(range.startContainer)||!prose.contains(range.endContainer)){setSelection(null);return}const value=compact(selected.toString());if(value.length<2||value.length>2000){setSelection(null);return}
        const origin=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement,paragraph=origin&&origin.closest?origin.closest('[data-source-ids]'):null,ids=paragraph&&paragraph.dataset.sourceIds?paragraph.dataset.sourceIds.split(','):[],source=ids.map((id)=>sourceMap.get(id)).find(Boolean)||null
        const box=range.getBoundingClientRect(),parent=root.getBoundingClientRect();setSelection({paperId,text:value,source,sectionId:paragraph&&paragraph.dataset.sectionId||stateRef.current.currentSubsection,left:Math.max(4,Math.min(parent.width-145,box.left-parent.left)),top:Math.max(5,Math.min(parent.height-65,box.bottom-parent.top+6))})
      }
      function createIdea(){if(!mountedRef.current||paperRef.current!==paperId||!active||!selection||selection.paperId!==paperId||!propsRef.current.onCreateIdea)return;const source=selection.source;propsRef.current.onCreateIdea({paperId,sectionId:selection.sectionId,origin:'chapter-explanation',question:selection.text,text:source&&source.quote||'',quote:source&&source.quote||'',anchor:source&&bound(source.anchor,paperId)||null,page:source&&source.page,sourceId:source&&source.sourceId});setSelection(null)}
      const markers=sourceMarkers(sourceList)
      const usedTerms=new Set()
      function evidenceLinks(ids,groupKey){
        if(!ids.length)return[]
        return[h('span',{className:'lrcp-source-group',key:groupKey,'aria-label':'本段原文出处'},ids.map(id=>{
          const source=sourceMap.get(id),marker=markers.get(id),locateKey=(current&&current.id||'')+':'+id
          if(!source)return null
          const caption=source.captionLocation,captionAnchor=caption&&bound(caption.anchor,paperId)
          const separateCaption=/^(?:figure|table)-(?:caption|mention|content)$/.test(source.sourceKind||'')&&caption&&caption.documentId===paperId&&captionAnchor&&Number.isInteger(caption.page)&&caption.page>=0&&captionAnchor.page===caption.page&&
            captionAnchor.status==='located'&&captionAnchor.quoteVerified===true&&key(captionAnchor.quote)===key(caption.quote||caption.text)&&
            (source.sourceKind.endsWith('-mention')||source.preferredLocation)
          return[h('button',{type:'button',className:'lrcp-source-link',key:id,'data-source-id':id,'data-source-locate-key':locateKey,
            title:(source.sourceLabel||source.sectionTitle||source.assetLabel||'原文')+(source.page!=null?' · 第 '+(source.page+1)+' 页':'')+'\n'+source.quote,
            'aria-label':'查看出处 '+marker+(source.page!=null?'，第 '+(source.page+1)+' 页':''),disabled:!props.onLocate,
            onClick:()=>locateSource(source,locateKey,'source')},'['+marker+']'),separateCaption?h('button',{type:'button',className:'lrcp-source-link lrcp-caption-link',key:id+'-caption',
            'data-source-id':id,'data-source-locate-key':locateKey+':caption',title:'查看 '+(source.assetLabel||'图表')+' 的原文题注',
            'aria-label':'查看图表题注',disabled:!props.onLocate,onClick:()=>locateSource({...source,locationMode:'caption'},locateKey+':caption','source')},'题注'):null]
        }))]
      }
      function inline(value){const pattern=/(\*\*[^*]+\*\*|`[^`]+`)/g
        return text(value).split(pattern).filter(Boolean).flatMap((part,index)=>{if(part.startsWith('**'))return[h('strong',{key:index},...inline(part.slice(2,-2)))];if(part.startsWith('`'))return[h('code',{key:index},part.slice(1,-1))]
          const out=[];let cursor=0
          const matches=[];for(const term of terms){if(usedTerms.has(term.term))continue;const escaped=term.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),regex=new RegExp('(^|[^A-Za-z0-9])('+escaped+')(?![A-Za-z0-9])');const match=regex.exec(part);if(match)matches.push({term,index:match.index+match[1].length})}
          matches.sort((a,b)=>a.index-b.index);for(const match of matches){if(match.index<cursor||usedTerms.has(match.term.term))continue;out.push(part.slice(cursor,match.index));usedTerms.add(match.term.term);const open=state.activeTerm===match.term.term,translated=state.translations[hash(match.term.expansion)];out.push(h('button',{type:'button',className:'lrcp-term-inline',key:index+'-term-'+match.term.term,'aria-expanded':open,onClick:()=>{commit({activeTerm:open?'':match.term.term});if(!open)translateTerm(match.term)}},match.term.term));if(open)out.push(h('span',{className:'lrcp-term-definition',role:'note',key:index+'-definition'},'（本文全称：'+match.term.expansion+(translated&&translated.status==='ready'?'；译注：'+translated.text:translated&&translated.status==='loading'?'；译注正在加载…':'')+'）'));cursor=match.index+match.term.term.length}out.push(part.slice(cursor));return out
        })
      }
      function paragraph(value,id,sectionId){const evidence=paragraphEvidence(value,sourceMap);return h('p',{key:id,'data-section-id':sectionId||current.id,'data-source-ids':evidence.ids.join(',')},...inline(evidence.text),...evidenceLinks(evidence.ids,id+'-sources'))}
      function waitingIndicator(centered){return h('div',{className:'lrcp-waiting '+(centered?'is-centered':'is-inline')},h('span',{className:'lrcp-waiting-capsule',role:'status','aria-label':'等待回答','aria-live':'polite'},...[0,1,2].map(index=>h('span',{key:index,className:'lrcp-waiting-dot','aria-hidden':'true'}))))}
      function renderBody(){if(!cached||!cached.text)return cached&&cached.status==='error'?[]:[h('p',{key:'question'},CHAPTER_QUESTIONS[current.kind]||CHAPTER_QUESTIONS.other)]
        return narrative.blocks.flatMap((block,index)=>{if(block.type==='heading'){const evidence=paragraphEvidence(block.text,sourceMap);return[h('h3',{key:index,'data-section-heading':block.sectionId||undefined,'data-source-ids':evidence.ids.join(',')},...inline(evidence.text),...evidenceLinks(evidence.ids,index+'-sources')),...(block.body?[paragraph(block.body,index+'-body',block.currentSectionId)]:[])]}if(block.type==='code')return[h('pre',{key:index},h('code',null,block.text))];if(block.type==='list')return[h('ul',{key:index},block.lines.map((line,j)=>{const evidence=paragraphEvidence(line,sourceMap);return h('li',{key:j,'data-section-id':block.sectionId,'data-source-ids':evidence.ids.join(',')},...inline(evidence.text),...evidenceLinks(evidence.ids,index+'-'+j+'-sources'))}))];return[paragraph(block.text,index,block.sectionId)]})
      }
      function commitRange(event){const raw=previewRef.current==null?Number(event.currentTarget.value):previewRef.current,tick=chapterAtSliderPosition(propsRef.current.structure,paperId,raw),index=chaptersRef.current.findIndex((item)=>tick&&item.id===tick.chapterId);pointerRef.current=null;setDragging(false);setPreview(null);if(index>=0&&index!==chaptersRef.current.findIndex((item)=>item.id===stateRef.current.currentSection))go(index)}
      function keyboard(event){const max=chapters.length-1,base=previewRef.current==null?at:previewIndex,steps={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageDown:1,PageUp:-1};let target;if(event.key==='Home')target=0;else if(event.key==='End')target=max;else if(Object.prototype.hasOwnProperty.call(steps,event.key))target=Math.max(0,Math.min(max,base+steps[event.key]));else return;event.preventDefault();setPreview(sliderPositionForChapter(propsRef.current.structure,paperId,chapters[target]))}
      if(!paperId)return h('div',{className:'lrcp-empty'},'先打开一篇论文，再开始逐章精读。')
      if(!chapters.length)return h('div',{className:'lrcp-empty'},h('p',null,'还没有可核对的正文章节。'),h('button',{type:'button',disabled:!props.onParse||props.parsing,onClick:props.onParse},props.parsing?'正在解析…':'解析章节'))
      const currentTitle=narrative.displayTitle||text(cached&&cached.displayTitle)||current.heading,progress=previewValue==null?(axisPosition(props.structure,paperId,state.railPdfPosition||state.entryPdfPosition||readingPosition)??sliderPositionForChapter(props.structure,paperId,current)??0):previewValue,last=at===chapters.length-1
      const motion=scope.__glossReplyMotion,rawProse=centralWaiting?[]:renderBody(),prose=mathPrepared?scope.__glossMath.restore(rawProse,mathPrepared):rawProse,streaming=Boolean(cached&&cached.status==='streaming'&&controllerRef.current&&!controllerRef.current.signal.aborted)
      const body=motion&&motion.ReplyReveal?[h(motion.ReplyReveal,{ownerId:paperId,runId:ckey+':'+requestRef.current,streaming,status:cached&&cached.status||'idle',selectionRoot:proseRef,disabled:!active},...prose)]:prose
      if(centralWaiting)body.push(waitingIndicator(true))
      return h('div',{className:'lrcp is-direct',ref:rootRef,'data-chapter-id':current.id},
        h('header',{className:'lrcp-rail',style:{'--rail-light':String(Math.max(0,Math.min(1,progress)))},'data-material':'clear-lens'},h('div',{className:'lrcp-direct-heading'},h('strong',{className:'lrcp-current-title'},mathPrepared?scope.__glossMath.restore(currentTitle,mathPrepared):currentTitle)),
          h('div',{className:'lrcp-preview',role:previewValue==null?undefined:'status'},previewValue==null?h('span',null,pageLabel(current)):h('strong',null,preview&&preview.heading),previewValue==null?null:h('span',null,pageLabel(preview))),
          h('div',{className:'lrcp-slider-wrap'+(dragging?' is-dragging':''),style:{'--progress':String(Math.max(0,Math.min(1,progress)))}},h('div',{className:'lrcp-slider-track','aria-hidden':true},h('span',{className:'lrcp-slider-progress'}),h('span',{className:'lrcp-glass-thumb'})),
            h('input',{className:'lrcp-slider',type:'range',min:0,max:1,step:'any',value:progress,disabled:chapters.length===1,'data-axis':'pdf-body','aria-label':'选择正文章节','aria-valuetext':(preview&&preview.heading||'')+'，'+pageLabel(preview)+'，正文位置 '+Math.round(progress*100)+'%',onChange:(event)=>setPreview(Math.max(0,Math.min(1,Number(event.target.value)))),onPointerDown:(event)=>{pointerRef.current={x:event.clientX};setDragging(true)},onPointerMove:(event)=>{if(pointerRef.current&&Math.abs(event.clientX-pointerRef.current.x)>2)setDragging(true)},onPointerUp:commitRange,onTouchEnd:commitRange,onPointerCancel:()=>{pointerRef.current=null;setDragging(false);setPreview(null)},onKeyDown:keyboard,onKeyUp:(event)=>{if(/^(?:ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|PageUp|PageDown|Enter| )$/.test(event.key))commitRange(event)},onBlur:(event)=>{if(previewRef.current!=null)commitRange(event)}})),
          h('nav',{className:'lrcp-ticks','aria-label':'主章节'},chapters.map((chapter,index)=>h('button',{type:'button',key:chapter.id,className:'lrcp-tick'+(index===at?' is-current':''),style:{left:((axisTicks.find((tick)=>tick.chapterId===chapter.id)?.position||0)*100)+'%'},title:chapter.heading+' · '+pageLabel(chapter),'aria-label':chapter.heading+'，'+pageLabel(chapter),'aria-current':index===at?'step':undefined,onClick:()=>go(index)},h('span',{className:'lrcp-tick-mark'}))))),
        h('article',{className:'lrcp-scroll'+(centralWaiting?' is-waiting':''),ref:scrollRef,onScroll,onWheel:cancelScrollRestore,onTouchMove:cancelScrollRestore,onPointerDown:(event)=>{if(!event.target||!event.target.closest||!event.target.closest('button,input,textarea'))cancelScrollRestore()},onKeyDown:(event)=>{if(/^(?:ArrowDown|ArrowUp|PageDown|PageUp|Home|End| )$/.test(event.key)&&(!event.target||!event.target.closest||!event.target.closest('button,input,textarea')))cancelScrollRestore()},onMouseUp:captureSelection,onKeyUp:captureSelection},h('div',{className:'lrcp-prose'+(centralWaiting?' is-waiting':''),ref:proseRef,'aria-label':'本章讲解'},...body),waiting&&!centralWaiting?waitingIndicator(false):null,(!cached||!cached.text)&&!props.onGenerateChapter?h('p',{className:'lrcp-loading'},'本章讲解暂未生成。'):null,cached&&cached.status==='error'?h('p',{className:'lrcp-error',role:'alert'},cached.error,' ',h('button',{className:'lrcp-retry',disabled:!props.onGenerateChapter,onClick:generate},'重试')):null,location?h('p',{className:'lrcp-source-status',role:'status','data-source-locate-key':location.key,'data-locate-state':location.state},location.text):null),
        selection&&props.onCreateIdea?h('button',{type:'button',className:'lrcp-selection-action',style:{left:selection.left+'px',top:selection.top+'px'},onMouseDown:(event)=>event.preventDefault(),onClick:createIdea},'带入研究想法'):null,
        h('footer',{className:'lrcp-next'},h('button',{type:'button',disabled:last,'aria-label':last?'已到最后一章':'下一章',onClick:nextChapter},'下一章')))
    }
    return { Component, CSS }
  }
  createChapters.version='direct-reading/2.4.2'
  createChapters.helpers={sectionsOf,chaptersOf,normalizedPosition,sameReadingPosition,headingOffset,positionForReading,readingAxis,axisPosition,sliderPositionForChapter,chapterAtSliderPosition,normalizeState,cacheKey,sourcesForContext,canonicalSourceIdentity,sourceMarkers,paragraphEvidence,sourceForLocation,hasReadableNarrative,termsFor,parseNarrative,captionSources,sourcesOf,kindOf,bound}
  scope.LiteratureReaderChapters=createChapters
})(typeof window!=='undefined'?window:globalThis)
