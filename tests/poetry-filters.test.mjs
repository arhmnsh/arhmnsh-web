import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const source = await readFile(new URL('../app/utils/poetryFilters.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { filterValues, matchesPoetry } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
test('filter query supports legacy links and repeated URL-encoded selections', () => {
 const values = ['Allama Iqbal', 'Faiz & friends']
 const query = new URLSearchParams(values.map(value => ['a', value]))
 assert.deepEqual(filterValues(new URLSearchParams(query.toString()).getAll('a')), values)
 assert.deepEqual(filterValues('Allama Iqbal'), ['Allama Iqbal'])
 assert.deepEqual(filterValues([null, '', 'Faith', 'Faith']), ['Faith'])
})
test('authors and tags use OR within a group and AND between groups', () => {
 const poem = { author: 'Iqbal', tags: ['Faith', 'Hope'] }
 assert.equal(matchesPoetry(poem, [], []), true)
 assert.equal(matchesPoetry(poem, ['Faiz', 'iqbal'], ['Love', 'hope']), true)
 assert.equal(matchesPoetry(poem, ['Faiz'], ['Hope']), false)
 assert.equal(matchesPoetry(poem, ['Iqbal'], ['Love']), false)
})
