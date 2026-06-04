import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../../utils/supabase'
import { buildCategoryTree } from '../../../utils/helpers'
import type { Category } from '../../../utils/types'

interface TreeItem {
  id: string
  name: string
  parent_id: string | null
  sort_order: number
  indent: number
  isChild: boolean
}

Page({
  data: {
    categories: [] as Category[],
    treeItems: [] as TreeItem[],
    newName: '',
    parentNames: ['无（一级分类）'],
    parentIds: [''],
    parentIndex: 0,
    creating: false,
    loading: true,
    editVisible: false,
    editId: '',
    editName: '',
    editParentNames: ['无（一级分类）'],
    editParentIds: [''],
    editParentIndex: 0,
  },

  onShow() {
    const app = getApp<IAppOption>()
    if (!app.checkAuth()) return
    this.loadCategories()
  },

  onPullDownRefresh() {
    this.loadCategories().finally(() => wx.stopPullDownRefresh())
  },

  async loadCategories() {
    this.setData({ loading: true })
    try {
      const categories = await fetchCategories()
      this.buildTree(categories)
      this.setParentPicker(categories)
      this.setData({ categories, loading: false })
    } catch (e) {
      wx.showToast({
        title: e instanceof Error ? e.message : '加载失败',
        icon: 'none',
      })
      this.setData({ loading: false })
    }
  },

  setParentPicker(categories: Category[], excludeId?: string) {
    const roots = categories.filter(
      (c) => !c.parent_id && c.id !== excludeId
    )
    const parentNames = ['无（一级分类）', ...roots.map((c) => c.name)]
    const parentIds = ['', ...roots.map((c) => c.id)]
    this.setData({ parentNames, parentIds })
  },

  buildTree(categories: Category[]) {
    const { roots, childrenMap } = buildCategoryTree(categories)
    const treeItems: TreeItem[] = []

    for (const root of roots) {
      treeItems.push({
        id: root.id,
        name: root.name,
        parent_id: root.parent_id,
        sort_order: root.sort_order,
        indent: 0,
        isChild: false,
      })
      const children = childrenMap[root.id] || []
      for (const child of children) {
        treeItems.push({
          id: child.id,
          name: child.name,
          parent_id: child.parent_id,
          sort_order: child.sort_order,
          indent: 32,
          isChild: true,
        })
      }
    }

    this.setData({ treeItems })
  },

  onNewNameInput(e: WechatMiniprogram.Input) {
    this.setData({ newName: e.detail.value })
  },

  onParentChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ parentIndex: Number(e.detail.value) })
  },

  async onCreate() {
    const name = this.data.newName.trim()
    if (!name) return

    this.setData({ creating: true })
    const parentId = this.data.parentIds[this.data.parentIndex] || null
    const siblings = this.data.categories.filter(
      (c) => (c.parent_id || '') === (parentId || '')
    )
    const { error } = await createCategory({
      name,
      parent_id: parentId,
      sort_order: siblings.length,
    })
    this.setData({ creating: false })

    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }

    this.setData({ newName: '', parentIndex: 0 })
    wx.showToast({ title: '已添加', icon: 'success' })
    this.loadCategories()
  },

  onEdit(e: WechatMiniprogram.TouchEvent) {
    const { id, name, parent } = e.currentTarget.dataset as {
      id: string
      name: string
      parent: string
    }
    const categories = this.data.categories
    const roots = categories.filter((c) => !c.parent_id && c.id !== id)
    const editParentNames = ['无（一级分类）', ...roots.map((c) => c.name)]
    const editParentIds = ['', ...roots.map((c) => c.id)]
    let editParentIndex = editParentIds.indexOf(parent || '')
    if (editParentIndex < 0) editParentIndex = 0

    this.setData({
      editVisible: true,
      editId: id,
      editName: name,
      editParentNames,
      editParentIds,
      editParentIndex,
    })
  },

  onEditNameInput(e: WechatMiniprogram.Input) {
    this.setData({ editName: e.detail.value })
  },

  onEditParentChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ editParentIndex: Number(e.detail.value) })
  },

  onCloseEdit() {
    this.setData({ editVisible: false })
  },

  async onSaveEdit() {
    const { editId, editName, editParentIds, editParentIndex } = this.data
    const name = editName.trim()
    if (!name) return

    const parent_id = editParentIds[editParentIndex] || null
    const { error } = await updateCategory(editId, { name, parent_id })
    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }
    this.setData({ editVisible: false })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.loadCategories()
  },

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.showModal({
      title: '删除分类',
      content: '删除后关联的 Prompt 将变为未分类，确定继续？',
      success: async (res) => {
        if (!res.confirm) return
        const { error } = await deleteCategory(id)
        if (error) {
          wx.showToast({ title: error, icon: 'none' })
          return
        }
        wx.showToast({ title: '已删除', icon: 'success' })
        this.loadCategories()
      },
    })
  },

  async onMove(e: WechatMiniprogram.TouchEvent) {
    const { id, dir } = e.currentTarget.dataset as { id: string; dir: string }
    const categories = [...this.data.categories]
    const item = categories.find((c) => c.id === id)
    if (!item) return

    const siblings = categories
      .filter((c) => (c.parent_id || '') === (item.parent_id || ''))
      .sort((a, b) => a.sort_order - b.sort_order)

    const idx = siblings.findIndex((c) => c.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= siblings.length) return

    const other = siblings[swapIdx]
    await Promise.all([
      updateCategory(item.id, { sort_order: other.sort_order }),
      updateCategory(other.id, { sort_order: item.sort_order }),
    ])
    this.loadCategories()
  },
})
