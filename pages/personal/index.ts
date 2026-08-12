/** 个人中心：头像/昵称 + 地址管理 + 历史订单 */
import userStore from '../../store/userStore'
import { uploadFile, updateProfile, getProfile } from '../../services/user'

Page({
  data: {
    avatar: '',
    nickname: '',
    phone: '',
  },

  onShow() {
    this.loadUserInfo()
  },

  /** 从后端拉取最新用户信息 */
  loadUserInfo() {
    getProfile()
      .then((user) => {
        userStore.dispatch('setUserInfoAction', user)
        this.setData({
          avatar: user.avatar || '',
          nickname: user.name || '',
          phone: user.phone || '',
        })
      })
      .catch(() => {
        // 接口失败则使用本地缓存
        const ui = userStore.state?.userInfo
        this.setData({
          avatar: ui?.avatar || '',
          nickname: ui?.name || '',
          phone: ui?.phone || '',
        })
      })
  },

  onChooseAvatar(e: WechatMiniprogram.CustomEvent) {
    const { avatarUrl } = e.detail
    wx.showLoading({ title: '上传中', mask: true })
    uploadFile(avatarUrl)
      .then((url) => {
        this.setData({ avatar: url })
        userStore.dispatch('setUserInfoAction', { avatar: url })
        return updateProfile({ avatar: url })
      })
      .catch(() => {})
      .finally(() => wx.hideLoading())
  },

  onNicknameChange(e: WechatMiniprogram.CustomEvent) {
    const nickname = e.detail.value || ''
    this.setData({ nickname })
    userStore.dispatch('setUserInfoAction', { nickname })
    updateProfile({ name: nickname }).catch(() => {})
  },

  onGoAddress() {
    wx.navigateTo({ url: '/packageAddress/pages/address-list/index?mode=manage' })
  },

  onGoOrders() {
    wx.navigateTo({ url: '/packageOrder/pages/order-list/index' })
  },
})
