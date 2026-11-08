import test from 'node:test'
import assert from 'node:assert/strict'
import '../vendor/citation-nav.js'

const { buildIndex, resolveActiveReference } = globalThis.LiteratureReaderCitations
const paperId = 'citation-suffix-fixture'
const entry = (id, author, year) => ({
  id, year, raw: author + ', A.: Original bibliography title ' + id + '. Journal of test fixtures 1, 1–5 (' + year + ')',
})
const text = citation => 'A complete test paragraph mentions prior evidence ' + citation + ' while describing the experimental comparison.'
const probe = (citation, references) => buildIndex(text(citation), { documentId: paperId, references })

test('an alphanumeric citation uses its original label and exact parsed reference', () => {
  const reference = { id: 'code', raw: '[CLP16] Croot et al. An original bibliography title. (2016)', segmentation: 'alphanumeric' }
  const index = probe('[CLP16] [H2O]', [reference])
  assert.deepEqual(index.references.map(item => item.label), ['[CLP16]'])
  assert.deepEqual(index.citations.map(item => item.raw), ['[CLP16]'])
  assert.equal(resolveActiveReference(index, { quote: '[CLP16]', documentId: paperId }, paperId).status, 'matched')
})

test('a grouped year suffix can show bare-year rows without guessing their mapping', () => {
  const quote = '[Gao, 1998a,b]'
  const index = probe(quote, [entry('one', 'Gao', '1998'), entry('two', 'Gao', '1998'), entry('elsewhere', 'Li', '1998')])
  assert.equal(index.citations[0].status, 'ambiguous')
  assert.deepEqual(index.citations[0].targets.map(target => [target.label, target.status, target.referenceIds]), [
    ['Gao 1998a', 'ambiguous', ['one', 'two']],
    ['Gao 1998b', 'ambiguous', ['one', 'two']],
  ])
  assert.deepEqual(index.occurrences.one, [])
  assert.deepEqual(index.occurrences.two, [])
  assert.deepEqual(resolveActiveReference(index, { quote, documentId: paperId }, paperId).referenceIds, ['one', 'two'])
})

test('a single fallback remains unconfirmed, including in active navigation', () => {
  const quote = 'Gao (1998b)'
  const index = probe(quote, [entry('one', 'Gao', '1998'), entry('wrong-suffix', 'Gao', '1998a')])
  const result = resolveActiveReference(index, { quote, documentId: paperId }, paperId)
  assert.equal(index.citations[0].targets[0].status, 'ambiguous')
  assert.equal(result.status, 'ambiguous')
  assert.deepEqual(result.referenceIds, ['one'])
  assert.match(result.reason, /未标注该年份后缀/)
  assert.deepEqual(index.occurrences.one, [])
})

test('exact suffix, ordinary author year, and absent same-year rows keep their existing behavior', () => {
  const entries = [entry('exact', 'Gao', '1998a'), entry('bare', 'Gao', '1998'), entry('ordinary', 'Li', '1999')]
  const exact = probe('[Gao, 1998a]', entries)
  assert.equal(exact.citations[0].status, 'matched')
  assert.deepEqual(exact.citations[0].referenceIds, ['exact'])
  assert.equal(resolveActiveReference(exact, { quote: '[Gao, 1998a]' }, paperId).status, 'matched')
  const plain = probe('[Li, 1999]', entries)
  assert.equal(plain.citations[0].status, 'matched')
  assert.deepEqual(plain.citations[0].referenceIds, ['ordinary'])
  const absent = probe('[Gao, 1998b]', [entries[0]])
  assert.equal(absent.citations[0].status, 'unmatched')
  assert.deepEqual(absent.citations[0].referenceIds, [])
})
