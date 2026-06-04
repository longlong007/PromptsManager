import { getCurrentSession } from './utils/supabase'

App<IAppOption>({
  globalData: {
    userEmail: '',
  },

  onLaunch() {
    const session = getCurrentSession()
    if (session) {
      this.globalData.userEmail = session.user.email || ''
    }
  },

  checkAuth(): boolean {
    const session = getCurrentSession()
    if (!session) {
      wx.reLaunch({ url: '/pages/login/login' })
      return false
    }
    this.globalData.userEmail = session.user.email || ''
    return true
  },
})
