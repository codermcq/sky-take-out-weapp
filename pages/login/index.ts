/** 授权登录页：wx.login 拿 code 换 token（按需触发） */
import userStore from '../../store/userStore'
import { resolveLogin, hasPendingLogin } from '../../utils/auth'

Page({
  data: {
    loading: false,
  },

  onUnload() {
    // 未登录直接返回：放行挂起的调用方
    if (hasPendingLogin()) resolveLogin(false)
  },

  onLoginTap() {
    if (this.data.loading) return
    this.setData({ loading: true })
    wx.showLoading({ title: '登录中', mask: true })
    wx.login({
      success: async (res) => {
        if (!res.code) {
          this.setData({ loading: false })
          wx.hideLoading()
          wx.showToast({ title: '获取授权码失败', icon: 'none' })
          return
        }
        try {
          await userStore.dispatch('loginAction', res.code)
          wx.hideLoading()
          wx.showToast({ title: '登录成功', icon: 'success' })
          resolveLogin(true)
          const pages = getCurrentPages()
          if (pages.length > 1) {
            wx.navigateBack()
          } else {
            wx.reLaunch({ url: '/pages/home/index' })
          }
        } catch {
          this.setData({ loading: false })
          wx.hideLoading()
        }
      },
      fail: () => {
        this.setData({ loading: false })
        wx.hideLoading()
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      },
    })
  },
})
