import assert from 'node:assert/strict'
import test from 'node:test'
import '../vendor/citation-nav.js'

const {
  buildIndex, parseReferences, referenceCardNumber, referenceCardText, referenceDetails,
  referenceLocations, resolveActiveReference,
} = globalThis.LiteratureReaderCitations
const documentId = 'fullwidth-citations'
const references = [
  { id: 'ref16', raw: '［16］单福平. 转子件装配偏差建模[J]. 制造业自动化, 2015, 37(7): 100–103.' },
  { id: 'ref17', raw: '［１７］孟祥海. 转子件装配质量预测[J]. 制造业自动化, 2016, 38(5): 61–65.' },
  { id: 'ref18', raw: '[18] Sun C Z. Improvement of variation propagation control. 2017.' },
]

test('fullwidth groups after Han prose are indexed without changing original offsets', () => {
  const paragraph = '研究采用单福平等［１６－１７］提出的偏差传递模型，并与单级转子装配方法［18］对照。'
  const paperText = paragraph + '\n\n参考文献\n' + references.map(ref => ref.raw).join('\n')
  const index = buildIndex(paperText, { documentId, references })
  assert.deepEqual(index.citations.map(c => c.referenceIds), [['ref16', 'ref17'], ['ref18']])
  assert.deepEqual(index.citations.map(c => paperText.slice(c.start, c.end)), ['［１６－１７］', '［18］'])
  assert.deepEqual(referenceLocations(index, index.references[1]).map(location => location.marker), ['［１６－１７］'])
})

test('numeric citation indexing still skips math and identifier uses', () => {
  const text = '数组［16］中有 x［17］、公式［18］和变换 y[16]，矩阵 ［17］ ＝ z。研究验证［18］。'
  const index = buildIndex(text, { documentId, references })
  assert.deepEqual(index.citations.map(c => c.referenceIds), [['ref18']])
})

test('fullwidth numbered references preserve the original entry and remove the duplicate card marker', () => {
  const parsed = parseReferences({ references }, '')
  assert.deepEqual(parsed.map(ref => ref.number), ['16', '17', '18'])
  assert.deepEqual(parsed.map(referenceCardNumber), ['［16］', '［１７］', '[18]'])
  assert.ok(referenceCardText(parsed[0]).startsWith('单福平'))
  assert.equal(parsed[0].raw, references[0].raw)
  const index = { references: parsed }
  assert.deepEqual(resolveActiveReference(index, { documentId, quote: '［１７］' }, documentId).referenceIds, ['ref17'])
  assert.equal(resolveActiveReference(index, { documentId: 'foreign', quote: '［１７］' }, documentId).status, 'mismatched-document')
})

test('the Chinese bibliography type marker exposes title and author without changing the raw citation', () => {
  const raw = '［17］孟祥海，单福平. 航空发动机转子件装配质量预测［J］. 制造业自动化，2016，38(5)：61-65.'
  const [parsed] = parseReferences({ references: [{ raw }] }, '')
  assert.equal(parsed.parseStatus, 'parsed')
  assert.equal(parsed.title, '航空发动机转子件装配质量预测')
  assert.equal(parsed.authors, '孟祥海，单福平')
  assert.equal(parsed.raw, raw)
  assert.equal(referenceDetails({ raw: '[17] 孟祥海，单福平. 航空发动机转子件装配质量预测[J]. 制造业自动化，2016.' }).title, parsed.title)
})
