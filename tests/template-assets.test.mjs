import assert from 'node:assert/strict'
import { templates } from '../utils/travel-data.js'

const homeTemplates = templates.filter(template => template.id !== 'custom')
const coverPaths = homeTemplates.map(template => template.image)

assert.equal(new Set(coverPaths).size, homeTemplates.length, '每个首页模板都应该使用独立封面')
assert.match(coverPaths.find(path => path.includes('business')) || '', /business\.svg$/)
assert.match(coverPaths.find(path => path.includes('family')) || '', /family\.svg$/)

console.log('template asset uniqueness passed')
