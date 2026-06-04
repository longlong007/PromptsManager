import {
  fetchPrompts,
  fetchCategories,
  signOut,
  getCurrentSession,
} from '../../utils/supabase'
import { getCopyHistory, clearCopyHistory } from '../../utils/storage'
import { formatDate } from '../../utils/helpers'
import type { Prompt } from '../../utils/types'

Page({
  data: {
    userEmail: '',
    promptCount: 0,
    categoryCount: 0,
    totalUsage: 0,
    recentPrompts: [] as Prompt[],
    copyHistory: [] as Array<{
      promptId: string
      title: string
      copiedAt: string
      copiedAtDisplay: string
    }>,
    loading: true,
  },

  onShow() {
    const app = getApp<IAppOption>()
    if (!app.checkAuth()) return
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })
    const session = getCurrentSession()
    const history = getCopyHistory().map((h) => ({
      ...h,
      copiedAtDisplay: formatDate(h.copiedAt),
    }))

    try {
      const [prompts, categories] = await Promise.all([
        fetchPrompts(),
        fetchCategories(),
      ])
      const totalUsage = prompts.reduce((s, p) => s + p.usage_count, 0)
      this.setData({
        userEmail: session?.user.email || '',
        promptCount: prompts.length,
        categoryCount: categories.length,
        totalUsage,
        recentPrompts: prompts.slice(0, 5),
        copyHistory: history.slice(0, 5),
        loading: false,
      })
    } catch (e) {
      wx.showToast({
        title: e instanceof Error ? e.message : '加载失败',
        icon: 'none',
      })
      this.setData({ loading: false })
    }
  },

  goPrompts() {
    wx.switchTab({ url: '/pages/prompts/list/list' })
  },

  goNewPrompt() {
    wx.navigateTo({ url: '/pages/prompts/detail/detail?id=new' })
  },

  goCategories() {
    wx.switchTab({ url: '/pages/categories/index/index' })
  },

  goDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/prompts/detail/detail?id=${id}` })
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          signOut()
          wx.reLaunch({ url: '/pages/login/login' })
        }
      },
    })
  },

  onClearHistory() {
    clearCopyHistory()
    this.setData({ copyHistory: [] })
    wx.showToast({ title: '已清空', icon: 'success' })
  },
})
