import {
  fetchPrompts,
  fetchCategories,
  deletePrompt,
  deletePrompts,
  searchPrompts,
  incrementUsageCount,
} from '../../../utils/supabase'
import {
  filterPromptsLocal,
  formatDate,
  categoryName,
  copyToClipboard,
} from '../../../utils/helpers'
import { addCopyHistory } from '../../../utils/storage'
import type { Prompt, Category } from '../../../utils/types'

interface DisplayPrompt extends Prompt {
  categoryLabel: string
  dateLabel: string
  selected?: boolean
}

Page({
  data: {
    prompts: [] as Prompt[],
    categories: [] as Category[],
    displayPrompts: [] as DisplayPrompt[],
    categoryNames: ['全部分类'],
    categoryIds: [''],
    categoryIndex: 0,
    searchQuery: '',
    tagFilter: '',
    loading: true,
    batchMode: false,
    selectedIds: [] as string[],
  },

  onShow() {
    const app = getApp<IAppOption>()
    if (!app.checkAuth()) return
    this.loadAll()
  },

  onPullDownRefresh() {
    this.loadAll().finally(() => wx.stopPullDownRefresh())
  },

  async loadAll() {
    this.setData({ loading: true })
    try {
      const [prompts, categories] = await Promise.all([
        fetchPrompts(),
        fetchCategories(),
      ])
      const categoryNames = ['全部分类', ...categories.map((c) => c.name)]
      const categoryIds = ['', ...categories.map((c) => c.id)]
      this.setData({ prompts, categories, categoryNames, categoryIds, loading: false })
      this.applyFilter(prompts, categories)
    } catch (e) {
      wx.showToast({
        title: e instanceof Error ? e.message : '加载失败',
        icon: 'none',
      })
      this.setData({ loading: false })
    }
  },

  applyFilter(promptList?: Prompt[], catList?: Category[]) {
    const prompts = promptList ?? this.data.prompts
    const categories = catList ?? this.data.categories
    const categoryId = this.data.categoryIds[this.data.categoryIndex] || ''
    const filtered = filterPromptsLocal(
      prompts,
      this.data.searchQuery,
      categoryId,
      this.data.tagFilter
    )
    const selectedSet = new Set(this.data.selectedIds)
    const displayPrompts: DisplayPrompt[] = filtered.map((p) => ({
      ...p,
      categoryLabel: categoryName(categories, p.category_id),
      dateLabel: formatDate(p.created_at),
      selected: selectedSet.has(p.id),
    }))
    this.setData({ displayPrompts })
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ searchQuery: e.detail.value })
  },

  onCategoryChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ categoryIndex: Number(e.detail.value) })
    this.applyFilter()
  },

  async onSearch() {
    const categoryId = this.data.categoryIds[this.data.categoryIndex] || ''
    const q = this.data.searchQuery.trim()
    if (!q && categoryId) {
      this.setData({ loading: true })
      try {
        const results = await searchPrompts('', categoryId)
        this.setData({ prompts: results, loading: false })
        this.applyFilter(results)
      } catch (err) {
        wx.showToast({
          title: err instanceof Error ? err.message : '搜索失败',
          icon: 'none',
        })
        this.setData({ loading: false })
      }
      return
    }
    if (!q && !categoryId && this.data.prompts.length === 0) {
      await this.loadAll()
      return
    }
    this.applyFilter()
  },

  onToggleBatch() {
    this.setData({
      batchMode: !this.data.batchMode,
      selectedIds: [],
    })
    this.applyFilter()
  },

  onToggleSelect(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    const selected = new Set(this.data.selectedIds)
    if (selected.has(id)) selected.delete(id)
    else selected.add(id)
    this.setData({ selectedIds: Array.from(selected) })
    this.applyFilter()
  },

  onCardTap(e: WechatMiniprogram.TouchEvent) {
    if (this.data.batchMode) {
      this.onToggleSelect(e)
      return
    }
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/prompts/detail/detail?id=${id}` })
  },

  async onCopy(e: WechatMiniprogram.TouchEvent) {
    const { content, title, id, usage } = e.currentTarget.dataset as {
      content: string
      title: string
      id: string
      usage: number
    }
    try {
      await copyToClipboard(content)
      addCopyHistory({ promptId: id, title })
      await incrementUsageCount(id, Number(usage) || 0)
      wx.showToast({ title: '已复制', icon: 'success' })
      this.loadAll()
    } catch (err) {
      wx.showToast({
        title: err instanceof Error ? err.message : '复制失败',
        icon: 'none',
      })
    }
  },

  async onBatchCopy() {
    const { selectedIds, displayPrompts } = this.data
    if (selectedIds.length === 0) {
      wx.showToast({ title: '请先选择', icon: 'none' })
      return
    }
    const selected = displayPrompts.filter((p) => selectedIds.includes(p.id))
    const text = selected.map((p) => `## ${p.title}\n\n${p.content}`).join('\n\n---\n\n')
    try {
      await copyToClipboard(text)
      for (const p of selected) {
        addCopyHistory({ promptId: p.id, title: p.title })
      }
      wx.showToast({ title: `已复制 ${selected.length} 条`, icon: 'success' })
    } catch (err) {
      wx.showToast({
        title: err instanceof Error ? err.message : '复制失败',
        icon: 'none',
      })
    }
  },

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个 Prompt 吗？',
      success: async (res) => {
        if (!res.confirm) return
        const { error } = await deletePrompt(id)
        if (error) {
          wx.showToast({ title: error, icon: 'none' })
          return
        }
        wx.showToast({ title: '已删除', icon: 'success' })
        this.loadAll()
      },
    })
  },

  onBatchDelete() {
    const { selectedIds } = this.data
    if (selectedIds.length === 0) {
      wx.showToast({ title: '请先选择', icon: 'none' })
      return
    }
    wx.showModal({
      title: '批量删除',
      content: `确定删除选中的 ${selectedIds.length} 条 Prompt？`,
      success: async (res) => {
        if (!res.confirm) return
        const { error } = await deletePrompts(selectedIds)
        if (error) {
          wx.showToast({ title: error, icon: 'none' })
          return
        }
        this.setData({ batchMode: false, selectedIds: [] })
        wx.showToast({ title: '已删除', icon: 'success' })
        this.loadAll()
      },
    })
  },

  goNew() {
    wx.navigateTo({ url: '/pages/prompts/detail/detail?id=new' })
  },

  goEdit(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/prompts/detail/detail?id=${id}` })
  },
})
