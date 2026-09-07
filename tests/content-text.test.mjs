import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const source = await readFile(new URL('../app/utils/contentText.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext}}).outputText
const { contentText } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('search text preserves compact Markdown headings, emphasis and lists without indexing attributes', () => {
  const body = { type: 'minimark', value: [
    ['h2', {id: 'internal-heading-key'}, 'Evaluation'],
    ['p', {}, 'Test ', ['strong', {}, 'retrieval'], ' with real questions.'],
    ['ul', {}, ['li', {}, 'Compare ', ['a', {href: 'https://example.com/tracking'}, 'results']]]
  ] }
  const text = contentText(body)
  for (const word of ['Evaluation', 'Test', 'retrieval', 'real questions', 'Compare', 'results']) assert.ok(text.includes(word))
  assert.ok(!text.includes('internal-heading-key'))
  assert.ok(!text.includes('tracking'))
})

test('search text supports expanded Markdown trees and missing content', () => {
  assert.equal(contentText({children:[{type:'text',value:'Atomic'}, {tag:'strong',children:[{type:'text',value:'Habits'}]}]}), 'Atomic Habits')
  assert.equal(contentText(null), '')
})
