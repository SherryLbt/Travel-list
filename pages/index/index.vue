<template>
	<view class="app-shell">
		<scroll-view v-if="screen === 'home'" class="page-scroll" scroll-y>
			<view class="home-page page-content">
				<view class="topbar home-topbar">
					<view><text class="eyebrow">TRAVEL LIGHT · LIVE MORE</text><text class="page-title">出行清单</text><text class="page-subtitle">出发前，检查一下</text></view>
				</view>
				<view class="hero-card"><image class="hero-image" src="/static/travel-hero.svg" mode="aspectFill"></image><view class="hero-copy"><text>把期待</text><text>装进行李</text></view></view>
				<button class="primary-button hero-button" hover-class="button-hover" @tap="openTemplates"><text class="button-plus">+</text><text>新建清单</text></button>
				<view class="section-heading"><text>常用模板</text></view>
				<view class="template-grid"><view v-for="template in homeTemplates" :key="template.id" class="template-card" @tap="chooseTemplate(template.id)"><image :src="template.image" class="template-image" mode="aspectFill"></image><text class="template-name">{{ template.name }}</text><text class="template-description">{{ template.description }}</text></view></view>
				<view class="hand-note"><text>收拾好行李，轻松出发 ·</text></view>
			</view>
		</scroll-view>

		<scroll-view v-else-if="screen === 'mine'" class="page-scroll" scroll-y>
			<view class="mine-page page-content">
				<view class="topbar"><view><text class="eyebrow">YOUR JOURNEYS</text><text class="page-title small-title">我的</text></view><view class="round-add" @tap="openTemplates">+</view></view>
				<view class="filter-tabs"><text v-for="filter in mineFilters" :key="filter.id" :class="['filter-tab', { active: mineFilter === filter.id }]" @tap="setMineFilter(filter.id)">{{ filter.name }}</text></view>
				<view v-if="mineLists.length" class="saved-list"><view v-for="list in mineLists" :key="list.id" class="saved-card" @tap="openDetailFromMine(list)"><image :src="list.cover" class="saved-cover" mode="aspectFill"></image><view class="saved-main"><view class="saved-title-row"><text class="saved-name">{{ list.name }}</text><view class="saved-more" @tap.stop="openListActions(list)">•••</view></view><text class="saved-meta">{{ formatDateRange(list) }} · {{ list.people }}人</text><view class="progress-row"><view class="progress-track"><view class="progress-fill" :style="{ width: listProgress(list).percent + '%' }"></view></view><text class="progress-percent">{{ listProgress(list).percent }}%</text></view><text class="progress-caption">{{ listProgress(list).completed }} / {{ listProgress(list).total }} 已完成</text></view></view></view>
				<view v-else class="empty-state"><image src="/static/travel-hero.svg" class="empty-image" mode="aspectFit"></image><text class="empty-title">还没有保存的清单</text><text class="empty-copy">去“清单”里创建一份旅途计划吧</text><button class="primary-button empty-button" @tap="switchTab('list')">去创建清单</button></view>
			</view>
		</scroll-view>

		<scroll-view v-else class="page-scroll" scroll-y>
			<view class="inner-page page-content">
				<view class="topbar inner-topbar"><view class="back-button" @tap="goBack">‹</view><text class="inner-title">{{ screenTitle }}</text><view class="topbar-placeholder"></view></view>

				<view v-if="screen === 'template'" class="template-page"><text class="helper-copy">选择一个合适的模板，快速创建你的清单</text><view class="template-list"><view v-for="template in templates" :key="template.id" :class="['template-option', { selected: selectedTemplateId === template.id }]" @tap="selectedTemplateId = template.id"><image :src="template.image" class="option-image" mode="aspectFill"></image><view class="option-copy"><text class="option-name">{{ template.name }}</text><text class="option-description">{{ template.description }}</text></view><view :class="['radio', { checked: selectedTemplateId === template.id }]">{{ selectedTemplateId === template.id ? '✓' : '' }}</view></view></view><button class="primary-button bottom-button" @tap="openCreate(selectedTemplateId)">继续创建</button></view>

				<view v-else-if="screen === 'create' || screen === 'list-edit'" class="form-page"><text class="helper-copy">{{ screen === 'create' ? '把旅途中的每一份期待，都准备妥当' : '更新这份清单的旅行信息' }}</text><view class="form-card"><view class="field-block"><text class="field-label">清单名称 <text class="required">*</text></text><input v-model="form.name" class="text-input" maxlength="20" placeholder="例如：日本旅行" placeholder-class="placeholder"></input><text class="field-count">{{ form.name.length }}/20</text></view><view class="field-block"><text class="field-label">目的地 <text class="required">*</text></text><view class="input-with-icon"><text class="field-icon">⌖</text><input v-model="form.destination" class="text-input with-icon" maxlength="20" placeholder="例如：东京、大阪、京都" placeholder-class="placeholder"></input></view></view><view class="field-block"><text class="field-label">出行日期</text><view class="date-row"><picker mode="date" :value="form.startDate" @change="onDateChange($event, 'startDate')"><view class="date-input">▣ <text>{{ form.startDate || '开始日期' }}</text></view></picker><text class="date-arrow">→</text><picker mode="date" :value="form.endDate" @change="onDateChange($event, 'endDate')"><view class="date-input"><text>{{ form.endDate || '结束日期' }}</text></view></picker></view></view><view class="field-block"><text class="field-label">出行人数</text><view class="number-row"><view class="number-control" @tap="changePeople(-1)">−</view><text class="number-value">{{ form.people }}</text><view class="number-control" @tap="changePeople(1)">＋</view><text class="number-unit">人</text></view></view><view class="field-block"><text class="field-label">备注</text><textarea v-model="form.note" class="note-input" maxlength="200" placeholder="可以写下这次旅行的特别计划、注意事项等..." placeholder-class="placeholder"></textarea><text class="field-count note-count">{{ form.note.length }}/200</text></view></view><view class="paper-plane-note">✦ 好的旅行，<br>从一份清单开始。</view><button class="primary-button bottom-button" @tap="screen === 'create' ? createList() : saveList()">{{ screen === 'create' ? '创建清单' : '保存修改' }}</button></view>

				<view v-else-if="screen === 'detail' && activeList" class="detail-page"><view class="detail-hero"><image :src="activeList.cover" class="detail-cover" mode="aspectFill"></image><view class="detail-heading"><text class="detail-name">{{ activeList.name }}</text><text class="detail-meta">{{ formatDateRange(activeList) }} · {{ activeList.people }}人</text></view></view><view class="progress-card"><view><text class="progress-title">已准备</text><text class="progress-number">{{ listProgress(activeList).completed }} <text class="progress-total">/ {{ listProgress(activeList).total }}</text></text></view><view class="progress-right"><view class="progress-track large"><view class="progress-fill" :style="{ width: listProgress(activeList).percent + '%' }"></view></view><text class="progress-percent">{{ listProgress(activeList).percent }}%</text></view></view><scroll-view class="category-scroll" scroll-x><view class="category-tabs"><text :class="['category-tab', { active: activeCategory === 'all' }]" @tap="activeCategory = 'all'">全部</text><text v-for="category in categories" :key="category.id" :class="['category-tab', { active: activeCategory === category.id }]" @tap="activeCategory = category.id">{{ category.shortName }}</text></view></scroll-view><view v-if="detailGroups.length" class="checklist-groups"><view v-for="group in detailGroups" :key="group.id" class="check-group"><view class="group-heading"><view class="group-title-wrap"><text class="group-dot">♥</text><text class="group-title">{{ group.name }}</text><text class="group-count">({{ group.items.length }})</text></view><text class="group-action" @tap="removeCompleted(group.id)">⌫</text></view><view v-for="item in group.items" :key="item.id" class="check-item"><view :class="['check-box', { done: item.completed }]" @tap="toggleItem(item)">{{ item.completed ? '✓' : '' }}</view><text :class="['check-name', { done: item.completed }]" @tap="editItem(item)" @longpress="deleteItem(item)">{{ item.name }}</text><text :class="['star', { important: item.important }]" @tap="toggleImportant(item)">{{ item.important ? '★' : '☆' }}</text></view></view></view><view v-else class="detail-empty"><text>这份清单还没有物品</text><text class="detail-empty-copy">添加一些旅途中的必需品吧</text></view><view class="floating-add" @tap="openAddItem">+</view></view>

				<view v-else-if="screen === 'item-add'" class="add-page"><view class="search-box"><text class="search-icon">⌕</text><input v-model="searchText" class="search-input" placeholder="搜索物品，例如：充电器、护照..." placeholder-class="placeholder"></input></view><view class="add-layout"><scroll-view class="side-categories" scroll-y><text :class="['side-category', { active: activeCategory === 'all' }]" @tap="activeCategory = 'all'">全部 <text>{{ activeItems.length }}</text></text><text v-for="category in categories" :key="category.id" :class="['side-category', { active: activeCategory === category.id }]" @tap="activeCategory = category.id">{{ category.shortName }} <text>{{ categoryItemCount(category.id) }}</text></text></scroll-view><scroll-view class="library-list" scroll-y><view v-for="item in filteredLibrary" :key="item.category + item.name" class="library-item"><view class="library-icon">□</view><text>{{ item.name }}</text><view class="library-add" @tap="addLibraryItem(item)">+</view></view></scroll-view></view><view class="custom-item-card" @tap="openNewItem"><text class="custom-icon">✎</text><view><text class="custom-title">自定义物品</text><text class="custom-copy">没有找到？试试自定义添加</text></view><text class="custom-arrow">›</text></view></view>

				<view v-else-if="screen === 'item-edit'" class="form-page item-form-page"><view class="form-card"><view class="field-block"><text class="field-label">物品名称 <text class="required">*</text></text><input v-model="itemForm.name" class="text-input" maxlength="30" placeholder="例如：防晒霜" placeholder-class="placeholder"></input><text class="field-count">{{ itemForm.name.length }}/30</text></view><view class="field-block"><text class="field-label">所属分类 <text class="required">*</text></text><picker mode="selector" :range="categories" range-key="name" :value="categoryIndex" @change="onItemCategoryChange"><view class="select-input"><text>{{ categoryName(itemForm.category) }}</text><text>⌄</text></view></picker></view><view class="field-block"><text class="field-label">数量</text><view class="number-row"><view class="number-control" @tap="changeItemQuantity(-1)">−</view><text class="number-value">{{ itemForm.quantity }}</text><view class="number-control" @tap="changeItemQuantity(1)">＋</view></view></view><view class="switch-row"><view><text class="field-label">重点物品</text><text class="switch-copy">标记为重点物品，会在清单中特别显示</text></view><switch :checked="itemForm.important" color="#6f8e7a" @change="itemForm.important = $event.detail.value"></switch></view><view class="field-block"><text class="field-label">备注</text><textarea v-model="itemForm.note" class="note-input" maxlength="100" placeholder="例如：SPF50+，海边必备" placeholder-class="placeholder"></textarea><text class="field-count note-count">{{ itemForm.note.length }}/100</text></view></view><view class="item-note">小小的准备，<br>让旅途更安心。♡</view><button class="primary-button bottom-button" @tap="saveItem">保存物品</button></view>
			</view>
		</scroll-view>

		<view v-if="showTabbar" class="tabbar"><view :class="['tabbar-item', { active: currentTab === 'list' }]" @tap="switchTab('list')"><view class="tab-icon list-icon"></view><text>清单</text></view><view :class="['tabbar-item', { active: currentTab === 'mine' }]" @tap="switchTab('mine')"><view class="tab-icon mine-icon"></view><text>我的</text></view></view>
		<view v-if="toastMessage" class="toast">{{ toastMessage }}</view>
	</view>
</template>

<script>
	import * as travelData from '../../utils/travel-data.js'

	export default {
		data() {
			return {
				categories: travelData.categories,
				templates: travelData.templates,
				itemLibrary: travelData.itemLibrary,
				lists: [], items: [], currentTab: 'list', screen: 'home', previousScreens: [], selectedTemplateId: 'outbound', selectedListId: '', activeCategory: 'all', mineFilter: 'all', searchText: '', editingItemId: '', listEditSource: 'mine', toastMessage: '', form: { name: '', destination: '', startDate: '', endDate: '', people: 1, note: '' }, itemForm: { name: '', category: 'other', quantity: 1, important: false, note: '' }
			}
		},
		computed: {
			homeTemplates() { return this.templates.filter(template => template.id !== 'custom') },
			showTabbar() { return this.screen === 'home' || this.screen === 'mine' },
			screenTitle() { const titles = { template: '选择模板', create: '新建清单', 'list-edit': '修改清单', detail: '清单详情', 'item-add': '添加物品', 'item-edit': this.editingItemId ? '编辑物品' : '新建物品' }; return titles[this.screen] || '' },
			activeList() { return this.lists.find(list => list.id === this.selectedListId) },
			activeItems() { return this.items.filter(item => item.listId === this.selectedListId) },
			detailGroups() { return this.categories.map(category => ({ ...category, items: this.activeItems.filter(item => item.category === category.id) })).filter(group => group.items.length && (this.activeCategory === 'all' || group.id === this.activeCategory)) },
			filteredLibrary() { const result = []; const categoryIds = this.activeCategory === 'all' ? this.categories.map(category => category.id) : [this.activeCategory]; categoryIds.forEach(categoryId => (this.itemLibrary[categoryId] || []).forEach(name => result.push({ name, category: categoryId }))); if (!this.searchText.trim()) return result; return result.filter(item => item.name.includes(this.searchText.trim())) },
			categoryIndex() { const index = this.categories.findIndex(category => category.id === this.itemForm.category); return index < 0 ? 0 : index },
			mineFilters() { return [{ id: 'all', name: `全部 (${this.lists.length})` }, { id: 'progress', name: `进行中 (${this.lists.filter(list => list.status === 'progress').length})` }, { id: 'completed', name: `已完成 (${this.lists.filter(list => list.status === 'completed').length})` }] },
			mineLists() { return travelData.filterLists(this.lists, this.mineFilter) }
		},
		onLoad() { this.loadData() },
		methods: {
			emptyListForm() { return { name: '', destination: '', startDate: '', endDate: '', people: 1, note: '' } },
			emptyItemForm() { return { name: '', category: 'other', quantity: 1, important: false, note: '' } },
			loadData() { const savedLists = uni.getStorageSync('travel_lists'); const savedItems = uni.getStorageSync('travel_items'); if (Array.isArray(savedLists) && Array.isArray(savedItems)) { this.lists = savedLists; this.items = savedItems; return } const demo = travelData.buildList({ name: '日本旅行', destination: '日本', startDate: '2026-10-01', endDate: '2026-10-08', people: 2, cover: '/static/travel-hero.svg' }, 'outbound', 1727740800000); demo.items.slice(0, 3).forEach(item => { item.completed = true }); this.lists = [demo.list]; this.items = demo.items; this.updateListStatus(demo.list.id); this.persist() },
			persist() { uni.setStorageSync('travel_lists', this.lists); uni.setStorageSync('travel_items', this.items) },
			navigate(screen) { this.previousScreens.push(this.screen); this.screen = screen },
			goBack() { this.screen = this.previousScreens.pop() || (this.currentTab === 'mine' ? 'mine' : 'home') },
			switchTab(tab) { this.currentTab = tab; this.previousScreens = []; this.screen = tab === 'mine' ? 'mine' : 'home' },
			openTemplates() { this.currentTab = 'list'; this.selectedTemplateId = 'outbound'; if (this.screen === 'mine') { this.previousScreens = []; this.screen = 'template'; return } this.navigate('template') },
			chooseTemplate(templateId) { this.selectedTemplateId = templateId; this.openCreate(templateId) },
			openCreate(templateId) { this.selectedTemplateId = templateId || 'custom'; this.form = this.emptyListForm(); this.navigate('create') },
			createList() { if (!this.form.name.trim() || !this.form.destination.trim()) { this.showToast('请先填写清单名称和目的地'); return } const result = travelData.buildList(this.form, this.selectedTemplateId); this.lists.unshift(result.list); this.items = this.items.concat(result.items); this.selectedListId = result.list.id; this.persist(); this.previousScreens = []; this.screen = 'detail'; this.showToast('清单创建成功') },
			openDetailFromMine(list) { this.selectedListId = list.id; this.activeCategory = 'all'; this.navigate('detail') },
			openListActions(list) { uni.showActionSheet({ itemList: ['修改清单', '删除清单'], success: result => { if (result.tapIndex === 0) this.openEditList(list); if (result.tapIndex === 1) this.deleteList(list) } }) },
			openEditList(list) { this.selectedListId = list.id; this.form = { name: list.name, destination: list.destination, startDate: list.startDate, endDate: list.endDate, people: list.people, note: list.note || '' }; this.listEditSource = this.screen; this.navigate('list-edit') },
			saveList() { if (!this.form.name.trim() || !this.form.destination.trim()) { this.showToast('请先填写清单名称和目的地'); return } const index = this.lists.findIndex(list => list.id === this.selectedListId); if (index > -1) this.$set(this.lists, index, { ...this.lists[index], ...this.form, updatedAt: Date.now() }); this.persist(); this.previousScreens = []; this.screen = this.listEditSource === 'detail' ? 'detail' : 'mine'; this.showToast('清单信息已更新') },
			deleteList(list) { uni.showModal({ title: '删除清单', content: `确定删除“${list.name}”及其中的物品吗？`, confirmColor: '#c96e5b', success: result => { if (!result.confirm) return; this.lists = this.lists.filter(item => item.id !== list.id); this.items = this.items.filter(item => item.listId !== list.id); this.persist(); this.showToast('清单已删除') } }) },
			setMineFilter(filter) { this.mineFilter = filter },
			listProgress(list) { return travelData.getProgress(this.items.filter(item => item.listId === list.id)) },
			formatDateRange(list) { if (!list.startDate && !list.endDate) return '待定日期'; return `${(list.startDate || '').replace(/-/g, '.')} - ${(list.endDate || '').replace(/-/g, '.')}` },
			categoryName(categoryId) { const category = this.categories.find(item => item.id === categoryId); return category ? category.name : '其他' },
			categoryItemCount(categoryId) { return this.activeItems.filter(item => item.category === categoryId).length },
			toggleItem(item) { item.completed = !item.completed; this.updateListStatus(this.selectedListId); this.persist() },
			toggleImportant(item) { item.important = !item.important; this.persist() },
			deleteItem(item) { uni.showModal({ title: '删除物品', content: `确定删除“${item.name}”吗？`, confirmColor: '#c96e5b', success: result => { if (!result.confirm) return; this.items = this.items.filter(current => current.id !== item.id); this.updateListStatus(this.selectedListId); this.persist(); this.showToast('物品已删除') } }) },
			removeCompleted(categoryId) { const doneItems = this.activeItems.filter(item => item.category === categoryId && item.completed); if (!doneItems.length) return; this.items = this.items.filter(item => !doneItems.some(done => done.id === item.id)); this.updateListStatus(this.selectedListId); this.persist() },
			updateListStatus(listId) { const list = this.lists.find(item => item.id === listId); if (!list) return; const progress = this.listProgress(list); list.status = progress.total > 0 && progress.completed === progress.total ? 'completed' : 'progress'; list.updatedAt = Date.now() },
			openAddItem() { this.searchText = ''; this.activeCategory = 'all'; this.navigate('item-add') },
			addLibraryItem(item) { const existing = this.items.find(current => current.listId === this.selectedListId && current.name === item.name && current.category === item.category); if (existing) existing.quantity += 1; else this.items.push({ id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`, listId: this.selectedListId, name: item.name, category: item.category, quantity: 1, completed: false, important: false, note: '' }); this.persist(); this.showToast(`${item.name} 已加入清单`) },
			openNewItem() { this.editingItemId = ''; this.itemForm = this.emptyItemForm(); this.itemForm.category = this.activeCategory === 'all' ? 'other' : this.activeCategory; this.navigate('item-edit') },
			editItem(item) { this.editingItemId = item.id; this.itemForm = { name: item.name, category: item.category, quantity: item.quantity, important: item.important, note: item.note || '' }; this.navigate('item-edit') },
			saveItem() { if (!this.itemForm.name.trim()) { this.showToast('请填写物品名称'); return } if (this.editingItemId) { const index = this.items.findIndex(item => item.id === this.editingItemId); if (index > -1) this.$set(this.items, index, { ...this.items[index], ...this.itemForm }) } else this.items.push({ ...this.itemForm, id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`, listId: this.selectedListId, completed: false }); this.updateListStatus(this.selectedListId); this.persist(); this.previousScreens = []; this.screen = 'detail'; this.showToast('物品已保存') },
			changePeople(amount) { this.form.people = Math.max(1, Math.min(20, this.form.people + amount)) },
			changeItemQuantity(amount) { this.itemForm.quantity = Math.max(1, Math.min(99, this.itemForm.quantity + amount)) },
			onDateChange(event, key) { this.form[key] = event.detail.value },
			onItemCategoryChange(event) { this.itemForm.category = this.categories[event.detail.value].id },
			showToast(message) { this.toastMessage = message; setTimeout(() => { this.toastMessage = '' }, 1800) }
		}
	}
</script>

<style>
	page { background: #f7f3ea; }
	.app-shell { min-height: 100vh; background: #f7f3ea; color: #30342f; font-family: -apple-system, BlinkMacSystemFont, "Noto Sans SC", "Helvetica Neue", sans-serif; }
	.page-scroll { height: 100vh; box-sizing: border-box; }
	.page-content { padding: 54rpx 32rpx 150rpx; box-sizing: border-box; }
	.topbar { display: flex; align-items: flex-start; justify-content: space-between; }
	.home-topbar { margin-bottom: 28rpx; }
	.eyebrow { display: block; color: #a4a098; font-size: 18rpx; letter-spacing: 3rpx; line-height: 1.4; }
	.page-title { display: block; margin-top: 8rpx; color: #30342f; font-family: "STKaiti", "KaiTi", serif; font-size: 66rpx; line-height: 1.05; }
	.small-title { font-size: 52rpx; }
	.page-subtitle { display: block; margin-top: 12rpx; color: #777a72; font-family: "STKaiti", "KaiTi", serif; font-size: 28rpx; }
	.hero-card { position: relative; overflow: hidden; height: 390rpx; border: 1rpx solid #e5ded2; border-radius: 28rpx; background: #edf0e7; box-shadow: 0 10rpx 28rpx rgba(92, 77, 55, .08); }
	.hero-image { width: 100%; height: 100%; }
	.hero-copy { position: absolute; left: 32rpx; top: 28rpx; display: flex; flex-direction: column; color: #59675e; font-family: "STKaiti", "KaiTi", serif; font-size: 32rpx; line-height: 1.45; }
	.primary-button { height: 88rpx; border: 0; border-radius: 999rpx; background: #6f8e7a; color: #fffaf0; font-size: 30rpx; line-height: 88rpx; box-shadow: 0 10rpx 20rpx rgba(111, 142, 122, .18); }
	.primary-button:after { border: 0; }
	.button-hover { opacity: .86; transform: scale(.99); }
	.hero-button { width: 78%; margin: -32rpx auto 42rpx; position: relative; }
	.button-plus { margin-right: 12rpx; font-size: 42rpx; line-height: 0; vertical-align: -3rpx; }
	.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18rpx; font-size: 30rpx; font-weight: 600; }
	.template-grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
	.template-card { width: 48.3%; margin-bottom: 20rpx; overflow: hidden; border: 1rpx solid #e5ded2; border-radius: 20rpx; background: #fcfaf5; box-shadow: 0 4rpx 16rpx rgba(92, 77, 55, .05); }
	.template-image { width: 100%; height: 128rpx; display: block; }
	.template-name { display: block; margin: 14rpx 16rpx 4rpx; font-size: 25rpx; font-weight: 600; }
	.template-description { display: block; margin: 0 16rpx 16rpx; color: #949187; font-size: 20rpx; }
	.hand-note { margin: 12rpx 0 0 8rpx; color: #99958b; font-family: "STKaiti", "KaiTi", serif; font-size: 25rpx; transform: rotate(-3deg); }
	.round-add, .floating-add { display: flex; align-items: center; justify-content: center; width: 66rpx; height: 66rpx; border-radius: 50%; background: #6f8e7a; color: white; font-size: 42rpx; line-height: 1; box-shadow: 0 8rpx 20rpx rgba(111, 142, 122, .22); }
	.filter-tabs { display: flex; align-items: center; margin: 42rpx 0 24rpx; padding-bottom: 14rpx; border-bottom: 1rpx solid #e5ded2; }
	.filter-tab { margin-right: 26rpx; padding: 12rpx 18rpx; border-radius: 999rpx; color: #8a887e; font-size: 23rpx; }
	.filter-tab.active { background: #dde7dc; color: #527362; font-weight: 600; }
	.saved-card { display: flex; align-items: stretch; min-height: 190rpx; margin-bottom: 20rpx; overflow: hidden; border: 1rpx solid #e5ded2; border-radius: 24rpx; background: #fcfaf5; box-shadow: 0 5rpx 18rpx rgba(92, 77, 55, .06); }
	.saved-cover { width: 182rpx; background: #e5eee5; }
	.saved-main { flex: 1; padding: 22rpx 22rpx 18rpx; }
	.saved-title-row { display: flex; align-items: center; justify-content: space-between; }
	.saved-name { max-width: 77%; overflow: hidden; color: #30342f; font-size: 30rpx; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
	.saved-more { color: #797970; font-size: 27rpx; letter-spacing: 3rpx; }
	.saved-meta, .progress-caption { display: block; margin-top: 9rpx; color: #96948b; font-size: 21rpx; }
	.progress-row { display: flex; align-items: center; margin-top: 24rpx; }
	.progress-track { flex: 1; height: 14rpx; overflow: hidden; border-radius: 999rpx; background: #ebe9e1; }
	.progress-track.large { height: 18rpx; }
	.progress-fill { height: 100%; border-radius: inherit; background: #6f8e7a; }
	.progress-percent { margin-left: 12rpx; color: #677b6d; font-size: 21rpx; }
	.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 100rpx; text-align: center; }
	.empty-image { width: 470rpx; height: 250rpx; opacity: .82; }
	.empty-title { margin-top: 18rpx; font-family: "STKaiti", "KaiTi", serif; font-size: 36rpx; }
	.empty-copy { margin-top: 12rpx; color: #96948b; font-size: 24rpx; }
	.empty-button { width: 48%; margin-top: 34rpx; }
	.inner-page { padding-bottom: 80rpx; }
	.inner-topbar { align-items: center; margin-bottom: 36rpx; }
	.back-button { width: 60rpx; color: #30342f; font-size: 62rpx; font-family: Arial, sans-serif; line-height: 50rpx; }
	.inner-title { font-family: "STKaiti", "KaiTi", serif; font-size: 42rpx; }
	.topbar-placeholder { width: 60rpx; }
	.helper-copy { display: block; margin-bottom: 28rpx; color: #929087; font-size: 23rpx; }
	.template-option { display: flex; align-items: center; min-height: 136rpx; margin-bottom: 18rpx; padding: 14rpx; border: 1rpx solid #e5ded2; border-radius: 22rpx; background: #fcfaf5; box-shadow: 0 4rpx 14rpx rgba(92, 77, 55, .05); }
	.template-option.selected { border-color: #a5b9a7; background: #f2f6ef; }
	.option-image { width: 150rpx; height: 108rpx; border-radius: 16rpx; }
	.option-copy { flex: 1; padding: 0 18rpx; }
	.option-name { display: block; font-size: 28rpx; font-weight: 600; }
	.option-description { display: block; margin-top: 7rpx; color: #99968d; font-size: 21rpx; }
	.radio { display: flex; align-items: center; justify-content: center; width: 38rpx; height: 38rpx; margin-right: 10rpx; border: 2rpx solid #bbbcb5; border-radius: 50%; color: white; font-size: 25rpx; }
	.radio.checked { border-color: #6f8e7a; background: #6f8e7a; }
	.bottom-button { width: 100%; margin-top: 28rpx; }
	.form-card { padding: 26rpx; border: 1rpx solid #e5ded2; border-radius: 24rpx; background: rgba(252, 250, 245, .76); }
	.field-block { position: relative; margin-bottom: 26rpx; }
	.field-label { display: block; margin-bottom: 12rpx; color: #545a52; font-size: 23rpx; }
	.required { color: #c96e5b; }
	.text-input, .select-input, .date-input { box-sizing: border-box; width: 100%; height: 76rpx; padding: 0 22rpx; border: 1rpx solid #e5ded2; border-radius: 16rpx; background: #fffdf8; color: #30342f; font-size: 25rpx; line-height: 76rpx; }
	.placeholder { color: #b6b3aa; }
	.field-count { position: absolute; right: 22rpx; bottom: 22rpx; color: #b0ada3; font-size: 18rpx; }
	.input-with-icon { position: relative; }
	.field-icon { position: absolute; z-index: 1; left: 22rpx; top: 18rpx; color: #707970; font-size: 28rpx; }
	.with-icon { padding-left: 58rpx; }
	.date-row { display: flex; align-items: center; }
	.date-row picker { flex: 1; }
	.date-input { padding: 0 16rpx; font-size: 22rpx; }
	.date-arrow { width: 44rpx; text-align: center; color: #777b72; }
	.number-row { display: flex; align-items: center; }
	.number-control { display: flex; align-items: center; justify-content: center; width: 70rpx; height: 62rpx; border: 1rpx solid #e1dbd0; color: #59655d; font-size: 32rpx; }
	.number-control:first-child { border-radius: 14rpx 0 0 14rpx; }
	.number-control:nth-of-type(3) { border-radius: 0 14rpx 14rpx 0; }
	.number-value { display: flex; align-items: center; justify-content: center; width: 70rpx; height: 62rpx; border-top: 1rpx solid #e1dbd0; border-bottom: 1rpx solid #e1dbd0; background: #fffdf8; font-size: 24rpx; }
	.number-unit { margin-left: 14rpx; color: #8b8b82; font-size: 23rpx; }
	.note-input { box-sizing: border-box; width: 100%; height: 150rpx; padding: 18rpx 22rpx; border: 1rpx solid #e5ded2; border-radius: 16rpx; background: #fffdf8; color: #30342f; font-size: 24rpx; line-height: 1.5; }
	.note-count { bottom: 14rpx; }
	.paper-plane-note, .item-note { margin: 28rpx 0 8rpx 16rpx; color: #8a9288; font-family: "STKaiti", "KaiTi", serif; font-size: 25rpx; line-height: 1.45; transform: rotate(-4deg); }
	.detail-hero { position: relative; overflow: hidden; height: 290rpx; border-radius: 26rpx; background: #e1ebe0; }
	.detail-cover { width: 100%; height: 100%; }
	.detail-heading { position: absolute; left: 28rpx; bottom: 24rpx; color: #fffaf0; text-shadow: 0 2rpx 6rpx rgba(48, 52, 47, .3); }
	.detail-name { display: block; font-family: "STKaiti", "KaiTi", serif; font-size: 42rpx; }
	.detail-meta { display: block; margin-top: 7rpx; font-size: 21rpx; }
	.progress-card { display: flex; align-items: center; justify-content: space-between; margin: -26rpx 20rpx 28rpx; padding: 22rpx 24rpx; position: relative; border: 1rpx solid #e5ded2; border-radius: 20rpx; background: #fcfaf5; box-shadow: 0 6rpx 18rpx rgba(92, 77, 55, .08); }
	.progress-title { display: block; color: #7e8379; font-size: 20rpx; }
	.progress-number { display: block; margin-top: 4rpx; color: #30342f; font-size: 36rpx; font-weight: 600; }
	.progress-total { color: #9a978e; font-size: 21rpx; font-weight: 400; }
	.progress-right { width: 50%; }
	.progress-right .progress-percent { display: block; margin: 8rpx 0 0; text-align: right; }
	.category-scroll { white-space: nowrap; }
	.category-tabs { display: inline-flex; padding-bottom: 20rpx; border-bottom: 1rpx solid #e5ded2; }
	.category-tab { margin-right: 28rpx; padding: 8rpx 18rpx; border-radius: 999rpx; color: #99968d; font-size: 22rpx; }
	.category-tab.active { background: #dde7dc; color: #527362; font-weight: 600; }
	.checklist-groups { padding-top: 16rpx; }
	.check-group { margin-bottom: 24rpx; }
	.group-heading { display: flex; align-items: center; justify-content: space-between; padding: 8rpx 0; }
	.group-title-wrap { display: flex; align-items: center; }
	.group-dot { margin-right: 10rpx; color: #6f8e7a; font-size: 16rpx; }
	.group-title { font-size: 26rpx; font-weight: 600; }
	.group-count { margin-left: 5rpx; color: #97958c; font-size: 21rpx; }
	.group-action { color: #aaa79e; font-size: 27rpx; }
	.check-item { display: flex; align-items: center; min-height: 72rpx; border-bottom: 1rpx solid rgba(229, 222, 210, .6); }
	.check-box { display: flex; align-items: center; justify-content: center; width: 34rpx; height: 34rpx; margin-right: 20rpx; border: 2rpx solid #aab0a8; border-radius: 8rpx; color: white; font-size: 23rpx; }
	.check-box.done { border-color: #6f8e7a; background: #6f8e7a; }
	.check-name { flex: 1; color: #4e554f; font-size: 25rpx; }
	.check-name.done { color: #aaa9a1; text-decoration: line-through; }
	.star { padding: 15rpx 0 15rpx 22rpx; color: #d0cdc3; font-size: 32rpx; }
	.star.important { color: #d6a447; }
	.floating-add { position: fixed; right: 42rpx; bottom: 46rpx; z-index: 3; width: 84rpx; height: 84rpx; font-size: 52rpx; }
	.detail-empty { display: flex; flex-direction: column; align-items: center; padding: 90rpx 0; color: #777e76; font-family: "STKaiti", "KaiTi", serif; font-size: 30rpx; }
	.detail-empty-copy { margin-top: 12rpx; color: #a4a198; font-family: inherit; font-size: 23rpx; }
	.search-box { display: flex; align-items: center; height: 76rpx; margin-bottom: 20rpx; padding: 0 20rpx; box-sizing: border-box; border: 1rpx solid #e5ded2; border-radius: 999rpx; background: #fffdf8; }
	.search-icon { color: #777e76; font-size: 36rpx; }
	.search-input { flex: 1; height: 76rpx; padding-left: 12rpx; color: #30342f; font-size: 23rpx; line-height: 76rpx; }
	.add-layout { display: flex; height: 670rpx; overflow: hidden; border: 1rpx solid #e5ded2; border-radius: 20rpx; background: #fcfaf5; }
	.side-categories { width: 168rpx; box-sizing: border-box; padding: 18rpx 0; border-right: 1rpx solid #e5ded2; background: #f4f1e9; }
	.side-category { display: flex; align-items: center; justify-content: space-between; min-height: 68rpx; padding: 0 18rpx; color: #929087; font-size: 22rpx; }
	.side-category text { color: #aaa79e; font-size: 18rpx; }
	.side-category.active { border-left: 6rpx solid #6f8e7a; padding-left: 12rpx; background: #e8f0e6; color: #527362; font-weight: 600; }
	.library-list { flex: 1; padding: 10rpx 20rpx; box-sizing: border-box; }
	.library-item { display: flex; align-items: center; min-height: 72rpx; border-bottom: 1rpx solid rgba(229, 222, 210, .6); color: #4e554f; font-size: 24rpx; }
	.library-icon { width: 42rpx; color: #7d8a80; font-size: 28rpx; }
	.library-add { display: flex; align-items: center; justify-content: center; width: 38rpx; height: 38rpx; margin-left: auto; border-radius: 50%; background: #6f8e7a; color: white; font-size: 28rpx; }
	.custom-item-card { display: flex; align-items: center; margin-top: 22rpx; padding: 20rpx; border: 1rpx solid #e5ded2; border-radius: 20rpx; background: #fcfaf5; }
	.custom-icon { margin-right: 16rpx; color: #6f8e7a; font-size: 34rpx; }
	.custom-title { display: block; font-size: 25rpx; font-weight: 600; }
	.custom-copy { display: block; margin-top: 5rpx; color: #9a978e; font-size: 20rpx; }
	.custom-arrow { margin-left: auto; color: #8b8b82; font-size: 38rpx; }
	.select-input { display: flex; align-items: center; justify-content: space-between; }
	.switch-row { display: flex; align-items: center; justify-content: space-between; margin: -2rpx 0 28rpx; padding: 18rpx 0; border-top: 1rpx solid #eee8dd; border-bottom: 1rpx solid #eee8dd; }
	.switch-row .field-label { margin-bottom: 4rpx; }
	.switch-copy { color: #a09d94; font-size: 19rpx; }
	.item-note { margin-top: 36rpx; }
	.tabbar { position: fixed; right: 0; bottom: 0; left: 0; z-index: 5; display: flex; justify-content: center; height: 118rpx; padding-bottom: env(safe-area-inset-bottom); border-top: 1rpx solid #e5ded2; background: rgba(252, 250, 245, .96); box-shadow: 0 -6rpx 20rpx rgba(92, 77, 55, .05); }
	.tabbar-item { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; max-width: 240rpx; color: #aaa79e; font-size: 20rpx; }
	.tabbar-item.active { color: #5d806d; font-weight: 600; }
	.tab-icon { position: relative; width: 42rpx; height: 38rpx; margin-bottom: 7rpx; }
	.list-icon:before { content: ''; position: absolute; left: 5rpx; top: 4rpx; width: 30rpx; height: 30rpx; border: 3rpx solid currentColor; border-radius: 8rpx; }
	.list-icon:after { content: '≡'; position: absolute; left: 12rpx; top: -3rpx; font-size: 28rpx; }
	.mine-icon:before { content: ''; position: absolute; left: 12rpx; top: 2rpx; width: 16rpx; height: 16rpx; border: 3rpx solid currentColor; border-radius: 50%; }
	.mine-icon:after { content: ''; position: absolute; left: 5rpx; bottom: 1rpx; width: 30rpx; height: 15rpx; border: 3rpx solid currentColor; border-radius: 20rpx 20rpx 7rpx 7rpx; }
	.toast { position: fixed; left: 50%; bottom: 150rpx; z-index: 9; padding: 18rpx 28rpx; border-radius: 999rpx; background: rgba(48, 52, 47, .88); color: #fffaf0; font-size: 22rpx; transform: translateX(-50%); }
</style>
