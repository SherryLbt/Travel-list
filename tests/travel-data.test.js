import assert from 'node:assert/strict'
import {
	buildList,
	filterLists,
	getProgress,
	getTemplateItems
} from '../utils/travel-data.js'

const created = buildList({
	name: '日本旅行',
	destination: '日本',
	startDate: '2026-10-01',
	endDate: '2026-10-08',
	people: 2
}, 'outbound', 1000)

assert.strictEqual(created.list.id, 'list-1000')
assert.strictEqual(created.list.name, '日本旅行')
assert.strictEqual(created.items.length, getTemplateItems('outbound').length)
assert.strictEqual(created.items[0].listId, created.list.id)

assert.deepStrictEqual(getProgress([
	{ completed: true },
	{ completed: false },
	{ completed: true }
]), { completed: 2, total: 3, percent: 67 })

const lists = [
	{ status: 'progress' },
	{ status: 'completed' },
	{ status: 'progress' }
]
assert.strictEqual(filterLists(lists, 'all').length, 3)
assert.strictEqual(filterLists(lists, 'progress').length, 2)
assert.strictEqual(filterLists(lists, 'completed').length, 1)

console.log('travel-data tests passed')
