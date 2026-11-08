import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { buildChapterReadingContext } from '../vendor/chapter-context.js'
import { read } from './helpers.mjs'

test('a Chinese application and validation heading gets experimental reading guidance', () => {
  const id = 'validation-fixture'
  const heading = '3 应用与验证'
  const text = '实验将测量数据与模型的预测结果逐项比较，再核对应用条件是否满足既定方案。'
  const structure = { documentId: id, sections: [{ id: 'validation', heading, level: 1, page: 0, paragraphs: [{ id: 'validation-p', text, page: 0 }] }] }
  const result = buildChapterReadingContext({ paper: { id, title: '合成实验', text: heading + '\n' + text }, structure, chapter: { id: 'validation' } })
  assert.equal(result.chapter.kind, 'experiment')
})

test('a saved collapsed chapter restores its offset under the permanently visible rail', () => {
  const scope = {}
  vm.runInNewContext(read('vendor/chapter-reader.js'), scope)
  const { normalizeState } = scope.LiteratureReaderChapters.helpers
  const chapters = [{ id: 'one', sections: [{ id: 'one-a' }] }, { id: 'two', sections: [] }]
  const saved = { paperId: 'paper', currentSection: 'one', currentSubsection: 'one-a', scrollPositions: { one: 160, two: 35 }, railCollapsed: true, railScrollCompensation: 90, railExpandKey: 2 }
  const restored = normalizeState(saved, 'paper', chapters)
  assert.equal(restored.currentSubsection, 'one-a')
  assert.equal(restored.scrollPositions.one, 250)
  assert.equal(restored.scrollPositions.two, 35)
  assert.equal(Object.hasOwn(restored, 'railCollapsed'), false)
  assert.equal(normalizeState(restored, 'paper', chapters).scrollPositions.one, 250)
  assert.equal(saved.scrollPositions.one, 160)
})
