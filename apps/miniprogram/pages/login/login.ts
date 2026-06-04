import { signInWithPassword, signUp, getCurrentSession } from '../../utils/supabase'

Page({
  data: {
    isLogin: true,
    email: '',
    password: '',
    error: '',
    loading: false,
  },

  onLoad() {
    if (getCurrentSession()) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  onEmailInput(e: WechatMiniprogram.Input) {
    this.setData({ email: e.detail.value })
  },

  onPasswordInput(e: WechatMiniprogram.Input) {
    this.setData({ password: e.detail.value })
  },

  onToggleMode() {
    this.setData({ isLogin: !this.data.isLogin, error: '' })
  },

  async onSubmit() {
    const { email, password, isLogin } = this.data
    if (!email.trim() || password.length < 6) {
      this.setData({ error: '请填写邮箱和至少 6 位密码' })
      return
    }

    this.setData({ loading: true, error: '' })

    if (isLogin) {
      const { error } = await signInWithPassword(email.trim(), password)
      if (error) {
        this.setData({ loading: false, error })
        return
      }
      wx.switchTab({ url: '/pages/index/index' })
    } else {
      const { error, needsEmailConfirm } = await signUp(email.trim(), password)
      this.setData({ loading: false })
      if (error) {
        this.setData({ error })
        return
      }
      if (needsEmailConfirm) {
        this.setData({ error: '注册成功，请查收验证邮件后登录' })
        return
      }
      wx.switchTab({ url: '/pages/index/index' })
    }

    this.setData({ loading: false })
  },
})
