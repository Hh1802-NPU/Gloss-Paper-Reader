import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { read, sourceBlock } from './helpers.mjs'

const source = sourceBlock(read('client.js'), '    function libraryResearchPreview(', '    function jsonPost(')
const preview = vm.runInNewContext(source + '\nlibraryResearchPreview')

test('library research excerpt prefers an available abstract and excludes keyword headings', () => {
  assert.equal(preview({ paper: { meta: { abstract: '<p>Published abstract.</p>' } } }), 'Published abstract.')
  const article = {
    text: '作者与题名\n摘 要：这项研究采用对照实验来比较不同处理方式。结果显示不同条件下的反应具有可测量的差异。\n关键词：实验；比较\n引言',
  }
  assert.match(preview({ paper: article }), /^这项研究采用/)
  assert.doesNotMatch(preview({ paper: article }), /关键词|引言/)
})

test('library research excerpt uses the original passage for a paper without an abstract', () => {
  const paper = { title: 'Example' }
  const cards = [
    { type: 'background', quote: 'Background.' },
    { type: 'result', quote: 'The original result.', comment: 'Generated explanation.' },
  ]
  assert.equal(preview({ paper, cards }), 'The original result.')
  assert.equal(preview({ paper }), '')
})
