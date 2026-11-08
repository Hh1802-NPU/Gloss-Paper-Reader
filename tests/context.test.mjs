import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {root} from './helpers.mjs'
const {buildPaperContext,buildResearchContext,prepareResearchDocument}=await import(pathToFileURL(path.join(root,'vendor/paper-context.js')).href)
const {buildChapterReadingContext:buildChapter}=await import(pathToFileURL(path.join(root,'vendor/chapter-context.js')).href)
const id='pdf-'+'a'.repeat(64),foreign='pdf-'+'b'.repeat(64)
const anchor=(quote,page=0)=>({documentId:id,status:'located',quoteVerified:true,quote,page,bbox:[10,20,200,34],pdfBBox:[10,20,200,34],segments:[{page,pdfBBox:[10,20,200,34]}]})
const paragraph=(key,text,page=0)=>({id:key,text,page,anchor:anchor(text,page)})
const section=(key,heading,level,text,page=0)=>({id:key,anchorId:'heading-'+key,heading,level,page,anchor:anchor(heading,page),paragraphs:[paragraph(key+'-p',text,page)]})
const sections=[section('method','1 Method',1,'The synthetic encoder maps observed signals into a shared representation, and its decoder reconstructs each requested signal without accessing future observations.'),section('input','1.1 Input',2,'The input contains three synthetic sensor channels sampled at fixed intervals. Missing values are represented by a separate binary mask before encoding.'),section('results','2 Results',1,'The synthetic experiment measures held-out reconstruction error against a fixed linear baseline. This paragraph belongs only to the results chapter.',1)]
const paper={id,title:'Synthetic regression fixture',text:sections.flatMap(s=>[s.heading,...s.paragraphs.map(p=>p.text)]).join('\n\n')}
const structure={documentId:id,sections,figures:[],tables:[],references:[]}
test('chapter context contains its own descendants, never adjacent chapters',()=>{const result=buildChapter({paper,structure,chapter:{id:'method'}});assert.ok(['ready','partial'].includes(result.status));assert.deepEqual(result.chapter.sectionIds,['method','input']);assert.ok(result.text.includes('three synthetic sensor channels'));assert.ok(!result.text.includes('held-out reconstruction error'));assert.ok(result.sources.every(source=>source.documentId===id&&paper.text.includes(source.quote)))})
test('unknown and foreign chapter structures cannot silently fall back to another chapter',()=>{for(const result of[buildChapter({paper,structure,chapter:{id:'missing'}}),buildChapter({paper,structure:{...structure,documentId:foreign},chapter:{id:'method'}})]){assert.equal(result.status,'rejected');assert.equal(result.chapter,null);assert.equal(result.sources.length,0)}})
test('unverified source text is excluded even when the structure presents a valid-looking anchor',()=>{const forged={...structure,sections:[{...sections[0],paragraphs:[paragraph('fake','FORGED_PRIVATE_CONTENT that is absent from the synthetic paper. The statement must never become an author source despite its fabricated anchor metadata.')]}]};const result=buildChapter({paper,structure:forged,chapter:{id:'method'}});assert.equal(result.status,'empty');assert.equal(result.sources.length,0);assert.ok(!result.text.includes('FORGED_PRIVATE_CONTENT'))})
test('paper-level retrieval rejects foreign structure and keeps all returned sources bound to this paper',()=>{const malicious={documentId:foreign,sections:[section('other','Other paper',1,'FOREIGN_ONLY_SENTINEL reports a different result that is not in the current paper.')],references:[]};const result=buildPaperContext({paper,structure:malicious,question:'How does the encoder work?'});assert.equal(result.documentId,id);assert.ok(!result.text.includes('FOREIGN_ONLY_SENTINEL'));assert.ok(result.sources.every(source=>source.documentId===id))})
test('paper discussion and chapter explanation have bounded, source-verifiable contexts',()=>{const discussion=buildPaperContext({paper,structure,question:'How can the method be improved and validated?'}),chapter=buildChapter({paper,structure,chapter:{id:'method'}});assert.ok(discussion.text.length<=18000);assert.ok(chapter.text.length<=24000);assert.ok(discussion.sources.length<=7);assert.ok(chapter.sources.length<=24);for(const source of [...discussion.sources,...chapter.sources])assert.ok(paper.text.includes(source.quote||source.text))})

test('explicit Chinese, English, and § section references outrank unrelated keyword hits', () => {
  for (const marker of ['第 １．１ 节', '第1.1小节', 'Section 1.1', '§ 1.1']) {
    const question = `${marker}: held-out reconstruction error?`
    const result = buildPaperContext({ paper, structure, question })
    const [first] = result.sources
    assert.equal(first?.sectionId, 'input', marker)
    assert.equal(first.retrievalFacet, 'explicit-section', marker)
    assert.equal(first.score, 0, marker)
    assert.equal(first.text, sections[1].paragraphs[0].text, marker)
    assert.equal(first.anchor?.documentId, id, marker)
    assert.ok(result.sources.some(source => source.sectionId === 'results' && source.score > first.score), marker)
  }
})

test('colloquial section questions use the requested heading and its descendants only', () => {
  const heading = { ...section('method-overview', '3.1. Processing Method', 2, '', 2), paragraphs: [] }
  const child = section('formulation', '3.1.1. Formulation', 3,
    'The selected method represents each object with a bounded spatial kernel and estimates its visible contribution.', 2)
  const next = section('later-method', '3.10. Experimental Setup', 2,
    'The separate evaluation section reports calibration statistics and measures an unrelated error threshold.', 3)
  const fixtureSections = [...sections, heading, child, next]
  const fixture = { paper: { ...paper, text: fixtureSections.flatMap(s => [s.heading, ...s.paragraphs.map(p => p.text)]).join('\n\n') },
    structure: { ...structure, sections: fixtureSections } }
  for (const question of ['3.1讲解的是啥', '３．１在讲什么？', '讲一下3.1', '请解释一下第 3.1 小节', '论文的3.1主要说了什么', '能解释一下3.1吗', '3.1讲啥']) {
    const result = buildPaperContext({ ...fixture, question, selection: sections[2].paragraphs[0].text })
    assert.deepEqual(result.sources.map(source => source.sectionId), ['formulation'], question)
    assert.equal(result.sources[0].retrievalFacet, 'explicit-section', question)
    assert.match(result.text, /本次问题范围[\s\S]*3\.1\. Processing Method/, question)
    assert.doesNotMatch(result.text, /held-out reconstruction error|unrelated error threshold/, question)
  }
  for (const question of ['图3.1讲解的是啥', '版本 3.1 讲的是什么', '3.1% 是啥', '能解释一下公式3.1吗']) {
    assert.doesNotMatch(buildPaperContext({ ...fixture, question }).text, /本次问题范围/, question)
  }
  const unknown = buildPaperContext({ ...fixture, question: '8.1讲的是啥' })
  assert.equal(unknown.sources.length, 0)
  assert.match(unknown.warnings.join(' '), /未核对出第 8\.1 节原文/)
  const unindexed = buildPaperContext({ ...fixture, structure: null, question: '3.1讲的是啥' })
  assert.equal(unindexed.sources.length, 0)
  assert.match(unindexed.warnings.join(' '), /未核对出第 3\.1 节原文/)
})

test('a section-only question excludes even a verified selection from a different section', () => {
  const selection = sections[2].paragraphs[0].text
  const question = '请只依据第 1.1 节回答。'
  const result = buildPaperContext({ paper, structure, question, selection })
  assert.equal(result.selectionVerified, true)
  assert.deepEqual(result.sources.map(source => source.sectionId), ['input'])
  assert.ok(!result.text.includes(selection))

  const comparison = buildPaperContext({
    paper, structure, selection, question: '请不仅依据第 1.1 节，还对照实验结果。'
  })
  assert.ok(comparison.sources.some(source => source.sectionId === 'input'))
  assert.ok(comparison.sources.some(source => source.text === selection))
})

test('research sends original pages in order and uses Roman section matches only as navigation and focus', () => {
  const intro = section('intro', 'I. INTRODUCTION', 1, 'The introduction explains the broad academic setting but does not contain the cited manufacturing details.')
  const background = { ...section('background', 'II. BACKGROUND', 1, ''), paragraphs: [] }
  const first = section('opc', 'A. Skills and OPC UA', 2, 'Individual skills are exposed as typed methods that an industrial device can make available over the shared interface.')
  const second = section('mcp', 'B. Agents and MCP', 2, 'A model uses an agent with a protocol adapter to discover the tools and invoke selected methods on a manufacturing module.', 1)
  const close = section('close', 'III. CONCLUSION', 1, 'The authors explicitly document the terminal marker to show that the final extracted page is not a sliced prefix.', 1)
  const fixtureSections = [intro, background, first, second, close]
  const render = list => list.flatMap(item => [item.heading, ...item.paragraphs.map(p => p.text)]).join('\n\n')
  const pages = [render(fixtureSections.slice(0, 3)), render(fixtureSections.slice(3))]
  const document = prepareResearchDocument({ id, title: paper.title, pages, expectedPages: 2, hasPdf: true })
  assert.equal(document.text, pages.join('\n\n'))
  for (const question of ['第二部分讲的啥', '第二章讲什么', 'Section II', 'Ⅱ.讲啥']) {
    const result = buildResearchContext({ document, structure: { ...structure, sections: fixtureSections }, question })
    assert.equal(result.documentScope.mode, 'full-text', question)
    assert.ok(result.text.includes('[P1] 第 1 页\n' + pages[0]), question)
    assert.ok(result.text.includes('[P2] 第 2 页\n' + pages[1]), question)
    assert.match(result.text, /本次问题范围[\s\S]*II\. BACKGROUND/, question)
    assert.deepEqual(result.sources.filter(s => s.sourceKind !== 'pdf-page').map(s => s.sectionId), ['opc', 'mcp'], question)
    assert.deepEqual(result.sources.filter(s => s.sourceKind === 'pdf-page').map(s => s.anchor), [0, 1].map(page => ({ kind: 'pdf-page', documentId: id, page })), question)
  }
  const oversizedPages = ['I. INTRODUCTION\n' + 'Filler elsewhere. '.repeat(300) + '\n\n' + render([background, first]), render([second, close])]
  const large = prepareResearchDocument({ id, title: paper.title, pages: oversizedPages, expectedPages: 2, hasPdf: true })
  const scoped = buildResearchContext({ document: large, structure: { ...structure, sections: fixtureSections }, question: '第二部分讲的啥', maxPromptBytes: 2300 })
  assert.equal(scoped.documentScope.mode, 'whole-sections')
  assert.deepEqual(scoped.documentScope.sectionTitles, ['II. BACKGROUND'])
  assert.ok(scoped.text.includes(first.paragraphs[0].text) && scoped.text.includes(second.paragraphs[0].text))
  assert.doesNotMatch(scoped.text, /Filler elsewhere|terminal marker/)
  assert.ok(Buffer.byteLength(scoped.text) <= 2300)
  const unavailable = buildResearchContext({ document: large, structure: null, question: '第二部分讲的啥', maxPromptBytes: 1000 })
  assert.equal(unavailable.documentScope.mode, 'unavailable')
  assert.deepEqual(unavailable.sources, [])
  assert.doesNotMatch(unavailable.text, /Filler elsewhere/)
})

test('research distinguishes metadata, unreadable PDF pages and incomplete extracts', () => {
  const context = input => buildResearchContext({ document: prepareResearchDocument({ id, title: paper.title, ...input }) })
  assert.equal(context({}).documentScope.reason, 'metadata-only')
  assert.equal(context({ hasPdf: true, pages: [''], expectedPages: 1 }).documentScope.reason, 'pdf-no-text')
  assert.equal(context({ hasPdf: true, pages: ['x'.repeat(1000001)] }).documentScope.reason, 'input-limit')
  const partial = context({ hasPdf: true, pages: [paper.text, ''], expectedPages: 2 })
  assert.equal(partial.documentScope.mode, 'partial-text')
  assert.equal(partial.documentScope.missingPages, 1)
  assert.equal(partial.limits.fullTextIncluded, false)
  assert.deepEqual(partial.documentScope.includedPages, [1])
  const truncated = context({ hasPdf: true, text: paper.text, textTruncated: true })
  assert.equal(truncated.documentScope.mode, 'unavailable')
  assert.doesNotMatch(truncated.text, /held-out reconstruction error/)
  const missingTail = context({ hasPdf: true, pages: [paper.text], expectedPages: 2 })
  assert.equal(missingTail.documentScope.mode, 'unavailable')
})

test('ambiguous, unknown, and non-section numbers retain ordinary keyword retrieval', () => {
  const duplicate = section('another-input', '1.1 Experimental Results', 2,
    'Additional observations for this experiment are included to clarify the separate sample groups.')
  const duplicatePaper = { ...paper, text: `${paper.text}\n\n${duplicate.heading}\n\n${duplicate.paragraphs[0].text}` }
  const cases = [
    ['Section 1.1', duplicatePaper, { ...structure, sections: [...sections, duplicate] }],
    ['Section 9.9', paper, structure],
    ['Section 1.1 and §2', paper, structure],
    ['Figure 1.1, Equation 1.1, and version 1.1', paper, structure],
  ]
  for (const [marker, casePaper, caseStructure] of cases) {
    const question = `${marker}: held-out reconstruction error?`
    const result = buildPaperContext({ paper: casePaper, structure: caseStructure, question })
    assert.equal(result.sources[0]?.sectionId, 'results', marker)
    assert.ok(result.sources.every(source => source.retrievalFacet !== 'explicit-section'), marker)
  }
})

test('a section cannot gain priority from foreign structure or fabricated paragraph text', () => {
  const question = '请只依据第 1.1 节说明 held-out reconstruction error。'
  const foreignResult = buildPaperContext({ paper, structure: { ...structure, documentId: foreign }, question })
  assert.ok(foreignResult.sources.length > 0)
  assert.ok(foreignResult.sources.every(source => source.documentId === id && source.retrievalFacet !== 'explicit-section'))

  const fake = paragraph('fake-input', 'The fabricated procedure is absent from the original paper even though its anchor looks valid.')
  const forgedStructure = { ...structure, sections: sections.map(item => item.id === 'input' ? { ...item, paragraphs: [fake] } : item) }
  const forgedResult = buildPaperContext({ paper, structure: forgedStructure, question })
  assert.equal(forgedResult.sources[0]?.sectionId, 'results')
  assert.ok(forgedResult.sources.every(source => source.retrievalFacet !== 'explicit-section'))
})

test('a reference request recognizes adjacent bracket groups without treating a separate equation as a citation', () => {
  const references = [2, 3, 7, 8, 9].map(number => ({
    id: 'ref-' + number, raw: '[' + number + '] Li X. A distinct reference with identifier ' + number + '. 2024.'
  }))
  const result = buildPaperContext({
    paper, structure: { ...structure, references },
    question: '请查参考文献[2–3]和[7]、[8]。再解释公式[9]。'
  })
  assert.deepEqual(result.citationStatus.queries, ['[2]', '[3]', '[7]', '[8]'])
  assert.equal(result.citationStatus.status, 'matched')
})

test('a fullwidth reference selection next to Han prose resolves without treating a tensor index as a reference', () => {
  const reference = { id: 'ref-2', raw: '[2] Li X. A specific published bibliographic entry. 2024.' }
  const matchingPaper = { ...paper, text: paper.text + '\n作者验证了这一方法［2］。式中张量项为 t［2］=0。' }
  const data = { paper: matchingPaper, structure: { ...structure, references: [reference] } }
  const prose = buildPaperContext({ ...data, selection: { text: '［2］', before: '作者验证了这一方法', after: '。' } })
  const index = buildPaperContext({ ...data, selection: { text: '［2］', before: '式中张量项为 t', after: '=0。' } })
  assert.equal(prose.citationStatus.status, 'matched')
  assert.equal(index.citationStatus.status, 'not-reference')
  assert.deepEqual(index.references, [])
})

test('missing bibliography year suffix yields candidates while an exact suffix still wins', () => {
  const references = [
    { id: 'unsuffixed', raw: 'Smith, A.: A title written without a year suffix. (1998)', year: '1998' },
    { id: 'explicit-b', raw: 'Smith, B.: The title carrying a year suffix. (1998b)', year: '1998b' },
    { id: 'other-family', raw: 'Jones, A.: An unrelated title in the same year. (1998)', year: '1998' },
  ]
  const result = buildPaperContext({
    paper, structure: { ...structure, references },
    selection: { text: '[Smith, 1998a,b]' }, question: '请核对引文。'
  })
  assert.deepEqual(result.citationStatus.resolutions.map(row => [row.status, row.referenceIds]), [
    ['ambiguous', ['unsuffixed']], ['matched', ['explicit-b']],
  ])
})

test('a parsed alphanumeric bibliography label resolves without matching unrelated bracketed identifiers', () => {
  const references = [{ id: 'code', raw: '[CLP16] Croot et al. An original named bibliographic entry. (2016)', segmentation: 'alphanumeric' }]
  const result = buildPaperContext({
    paper, structure: { ...structure, references },
    question: '请核对参考文献[CLP16]，并解释实验样本[H2O]。'
  })
  assert.deepEqual(result.citationStatus.queries, ['[CLP16]'])
  assert.equal(result.citationStatus.status, 'matched')
  assert.equal(result.references[0].label, '[CLP16]')
})
