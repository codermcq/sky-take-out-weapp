/** 自定义导航栏：封装 van-nav-bar，统一返回/标题样式 */
Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: true },
    bgColor: { type: String, value: '#FF6B35' },
    color: { type: String, value: '#ffffff' },
    customStyle: { type: String, value: '' },
  },
  data: {
    statusBarHeight: 20,
  },
  lifetimes: {
    attached() {
      const app = getApp<IAppOption>()
      if (app && app.globalData.statusBarHeight) {
        this.setData({ statusBarHeight: app.globalData.statusBarHeight })
      }
    },
  },
  methods: {
    onBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({ url: '/pages/home/index' })
      }
    },
  },
})
