import assert from 'node:assert/strict'
import * as travelData from '../utils/travel-data.js'

assert.equal(typeof travelData.buildList, 'function')
assert.equal(typeof travelData.getProgress, 'function')
console.log('travel-data module import passed')
