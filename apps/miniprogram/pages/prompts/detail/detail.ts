import {
  fetchPrompts,
  fetchCategories,
  createPrompt,
  updatePrompt,
  createCategory,
  optimizePromptWithAI,
  incrementUsageCount,
} from '../../../utils/supabase'
import { copyToClipboard } from '../../../utils/helpers'
import { addCopyHistory } from '../../../utils/storage'
import type { Category } from '../../../utils/types'

Page({
  data: {
    id: '',
    isNew: true,
    title: '',
    content: '',
    tags: '',
    categoryNames: ['未分类'],
    categoryIds: [''],
    categoryIndex: 0,
    categories: [] as Category[],
    showNewCategory: false,
    newCategoryName: '',
    saving: false,
    aiOptimizing: false,
    copied: false,
    usageCount: 0,
  },

  onLoad(options: { id?: string }) {
    const app = getApp<IAppOption>()
    if (!app.checkAuth()) return

    const id = options.id || 'new'
    const isNew = id === 'new'
    this.setData({ id, isNew })
    wx.setNavigationBarTitle({
      title: isNew ? '新建 Prompt' : '编辑 Prompt',
    })
    if (!isNew) this.loadPrompt(id)
    else this.loadCategories()
  },

  async loadCategories() {
    const categories = await fetchCategories()
    this.setCategoryPicker(categories, '')
  },

  async loadPrompt(promptId: string) {
    wx.showLoading({ title: '加载中' })
    try {
      const [prompts, categories] = await Promise.all([
        fetchPrompts(),
        fetchCategories(),
      ])
      const found = prompts.find((p) => p.id === promptId)
      if (!found) {
        wx.showToast({ title: '未找到 Prompt', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }
      this.setCategoryPicker(categories, found.category_id || '')
      this.setData({
        title: found.title,
        content: found.content,
        tags: found.tags.join(', '),
        usageCount: found.usage_count,
      })
    } finally {
      wx.hideLoading()
    }
  },

  setCategoryPicker(categories: Category[], selectedId: string) {
    const categoryNames = ['未分类', ...categories.map((c) => c.name)]
    const categoryIds = ['', ...categories.map((c) => c.id)]
    let categoryIndex = categoryIds.indexOf(selectedId)
    if (categoryIndex < 0) categoryIndex = 0
    this.setData({ categories, categoryNames, categoryIds, categoryIndex })
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    this.setData({ title: e.detail.value })
  },

  onContentInput(e: WechatMiniprogram.Input) {
    this.setData({ content: e.detail.value })
  },

  onTagsInput(e: WechatMiniprogram.Input) {
    this.setData({ tags: e.detail.value })
  },

  onCategoryChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ categoryIndex: Number(e.detail.value) })
  },

  onToggleNewCategory() {
    this.setData({ showNewCategory: !this.data.showNewCategory })
  },

  onNewCategoryInput(e: WechatMiniprogram.Input) {
    this.setData({ newCategoryName: e.detail.value })
  },

  async onCreateCategory() {
    const name = this.data.newCategoryName.trim()
    if (!name) return
    const { error } = await createCategory({
      name,
      parent_id: null,
      sort_order: this.data.categories.length,
    })
    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }
    const categories = await fetchCategories()
    this.setCategoryPicker(categories, categories[categories.length - 1]?.id || '')
    this.setData({ showNewCategory: false, newCategoryName: '' })
    wx.showToast({ title: '分类已添加', icon: 'success' })
  },

  async onAiOptimize() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请先输入内容', icon: 'none' })
      return
    }
    this.setData({ aiOptimizing: true })
    const { optimized, error } = await optimizePromptWithAI(this.data.content)
    this.setData({ aiOptimizing: false })
    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }
    if (optimized) {
      this.setData({ content: optimized })
      wx.showToast({ title: '优化完成', icon: 'success' })
    }
  },

  async onCopy() {
    try {
      await copyToClipboard(this.data.content)
      if (!this.data.isNew) {
        addCopyHistory({ promptId: this.data.id, title: this.data.title })
        await incrementUsageCount(this.data.id, this.data.usageCount)
      }
      this.setData({ copied: true })
      setTimeout(() => this.setData({ copied: false }), 2000)
      wx.showToast({ title: '已复制', icon: 'success' })
    } catch (e) {
      wx.showToast({
        title: e instanceof Error ? e.message : '复制失败',
        icon: 'none',
      })
    }
  },

  onCancel() {
    wx.navigateBack()
  },

  async onSave() {
    const { title, content, tags, categoryIds, categoryIndex, isNew, id } = this.data
    if (!title.trim() || !content.trim()) return

    this.setData({ saving: true })
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category_id: categoryIds[categoryIndex] || null,
      tags: tagList,
      variables: [] as [],
    }

    const { error } = isNew
      ? await createPrompt(payload)
      : await updatePrompt(id, payload)

    this.setData({ saving: false })

    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }

    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      wx.switchTab({ url: '/pages/prompts/list/list' })
    }, 500)
  },
})
