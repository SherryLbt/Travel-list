const categories = [
	{ id: 'important', name: '重要证件', shortName: '证件' },
	{ id: 'clothes', name: '衣物', shortName: '衣物' },
	{ id: 'digital', name: '数码', shortName: '数码' },
	{ id: 'toiletry', name: '洗漱', shortName: '洗漱' },
	{ id: 'medicine', name: '药品', shortName: '药品' },
	{ id: 'tool', name: '出行工具', shortName: '工具' },
	{ id: 'other', name: '其他', shortName: '其他' }
]

const templates = [
	{ id: 'domestic', name: '国内旅行', description: '山河湖海，随时出发', image: '/static/travel-mountain.svg' },
	{ id: 'outbound', name: '出境旅行', description: '去看更大的世界', image: '/static/travel-plane.svg' },
	{ id: 'business', name: '商务出差', description: '轻装高效，专注工作', image: '/static/travel-business.svg' },
	{ id: 'family', name: '亲子出行', description: '和孩子一起探索世界', image: '/static/travel-family.svg' },
	{ id: 'camping', name: '露营户外', description: '亲近自然，轻松出发', image: '/static/travel-camping.svg' },
	{ id: 'beach', name: '海边度假', description: '阳光沙滩，享受假期', image: '/static/travel-beach.svg' },
	{ id: 'custom', name: '自定义空白清单', description: '从零开始，创建专属清单', image: '/static/travel-mountain.svg' }
]

const itemLibrary = {
	important: ['护照', '身份证', '签证', '机票行程单', '酒店预订单', '银行卡', '现金', '驾驶证'],
	clothes: ['短袖T恤', '长袖外套', '内衣裤', '袜子', '睡衣', '舒适鞋子'],
	digital: ['手机', '充电器', '充电宝', '耳机', '相机', '转换插头'],
	toiletry: ['牙刷', '牙膏', '洗发水', '沐浴露', '毛巾', '防晒霜'],
	medicine: ['常用药', '创可贴', '晕车药', '肠胃药'],
	tool: ['雨伞', '颈枕', '行李牌', '眼罩', '水杯'],
	other: ['旅行攻略', '零食', '环保袋', '笔记本']
}

function getTemplateItems(templateId) {
	const templateMap = {
		outbound: ['important', 'clothes', 'digital', 'toiletry', 'medicine', 'tool'],
		domestic: ['important', 'clothes', 'digital', 'toiletry', 'medicine', 'tool'],
		business: ['important', 'digital', 'clothes', 'toiletry'],
		family: ['important', 'clothes', 'toiletry', 'medicine', 'other'],
		camping: ['important', 'clothes', 'digital', 'toiletry', 'medicine', 'tool'],
		beach: ['important', 'clothes', 'digital', 'toiletry', 'medicine'],
		custom: []
	}
	const categoryIds = templateMap[templateId] || templateMap.custom
	return categoryIds.reduce((result, categoryId) => {
		return result.concat((itemLibrary[categoryId] || []).slice(0, categoryId === 'important' ? 5 : 2).map(name => ({
			name,
			category: categoryId,
			quantity: 1,
			completed: false,
			important: categoryId === 'important' && ['护照', '签证', '身份证'].includes(name),
			note: ''
		})))
	}, [])
}

function getProgress(items) {
	const total = items.length
	const completed = items.filter(item => item.completed).length
	return {
		completed,
		total,
		percent: total ? Math.round(completed / total * 100) : 0
	}
}

function buildList(form, templateId, now) {
	const timestamp = now || Date.now()
	const id = `list-${timestamp}`
	const list = {
		id,
		name: form.name,
		destination: form.destination,
		startDate: form.startDate,
		endDate: form.endDate,
		people: Number(form.people) || 1,
		note: form.note || '',
		cover: form.cover || '/static/travel-hero.svg',
		status: 'progress',
		createdAt: timestamp,
		updatedAt: timestamp
	}
	const items = getTemplateItems(templateId).map((item, index) => ({
		...item,
		id: `item-${timestamp}-${index + 1}`,
		listId: id
	}))
	return { list, items }
}

function filterLists(lists, filter) {
	if (filter === 'all') return lists
	return lists.filter(list => list.status === filter)
}

export {
	categories,
	templates,
	itemLibrary,
	getTemplateItems,
	getProgress,
	buildList,
	filterLists
}
