/**
 * 首页点餐
 * 左侧分类 + 右侧菜品/套餐；规格弹窗/商品详情/购物车弹窗/拨打商家电话
 * 休息中整页遮罩，所有操作禁用
 */
import shopStore from '../../store/shopStore'
import shopCartStore from '../../store/shopCartStore'
import { getCategoryList } from '../../services/category'
import { getDishList } from '../../services/dish'
import { getSetmealList } from '../../services/setmeal'
import { ensureLogin, isLoggedIn } from '../../utils/auth'
import { SHOP_PHONE } from '../../utils/constant'

const app = getApp<IAppOption>()

Page({
  data: {
    statusBarHeight: 20,
    shopStatus: 1,
    shopLoaded: false,
    categories: [] as any[],
    activeIndex: 0,
    countMap: {} as Record<string, number>,
    cartList: [] as any[],
    totalAllPrice: 0,
    allCount: 0,
    cartVisible: false,
    flavorVisible: false,
    detailVisible: false,
    phoneVisible: false,
    currentDish: null as any,
    flavorDish: null as any,
    shopPhone: SHOP_PHONE,
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight })
    this.bindStores()
  },

  onShow() {
    shopStore.dispatch('fetchStatusAction')
    if (isLoggedIn()) shopCartStore.dispatch('fetchCartAction')
    this.loadData()
  },

  onUnload() {
    this.unbindStores()
  },

  bindStores() {
    const self: any = this
    self.cb = {
      countMap: (v: any) => this.setData({ countMap: v }),
      cartList: (v: any) => this.setData({ cartList: v }),
      totalAllPrice: (v: any) => this.setData({ totalAllPrice: v }),
      allCount: (v: any) => this.setData({ allCount: v }),
      shopStatus: (v: any) => this.setData({ shopStatus: v, shopLoaded: true }),
    }
    shopCartStore.onState('countMap', self.cb.countMap)
    shopCartStore.onState('cartList', self.cb.cartList)
    shopCartStore.onState('totalAllPrice', self.cb.totalAllPrice)
    shopCartStore.onState('allCount', self.cb.allCount)
    shopStore.onState('status', self.cb.shopStatus)
    // 若 store 已有数据直接同步一次
    this.setData({
      countMap: shopCartStore.state.countMap,
      cartList: shopCartStore.state.cartList,
      totalAllPrice: shopCartStore.state.totalAllPrice,
      allCount: shopCartStore.state.allCount,
    })
  },

  unbindStores() {
    const self: any = this
    if (!self.cb) return
    shopCartStore.offState('countMap', self.cb.countMap)
    shopCartStore.offState('cartList', self.cb.cartList)
    shopCartStore.offState('totalAllPrice', self.cb.totalAllPrice)
    shopCartStore.offState('allCount', self.cb.allCount)
    shopStore.offState('status', self.cb.shopStatus)
  },

  /** 加载分类与商品（无商品的分类隐藏） */
  loadData() {
    wx.showLoading({ title: '加载中', mask: true })
    Promise.all([getCategoryList(1), getCategoryList(2)])
      .then(([dishCats, setmealCats]) => {
        const cats = [...dishCats, ...setmealCats]
        const requests = cats.map((cat) => {
          const p = cat.type === 1 ? getDishList(cat.id) : getSetmealList(cat.id)
          return p
            .then((items) => ({ ...cat, items }))
            .catch(() => ({ ...cat, items: [] }))
        })
        return Promise.all(requests)
      })
      .then((categories) => {
        const valid = categories.filter((c) => c.items && c.items.length)
        this.setData({ categories: valid, activeIndex: 0 })
      })
      .catch(() => {
        wx.showToast({ title: '加载失败，下拉可重试', icon: 'none' })
      })
      .finally(() => wx.hideLoading())
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadData(),
      shopStore.dispatch('fetchStatusAction'),
      isLoggedIn() ? shopCartStore.dispatch('fetchCartAction') : Promise.resolve(),
    ]).finally(() => wx.stopPullDownRefresh())
  },

  onSelectCat(e: WechatMiniprogram.TouchEvent) {
    this.setData({ activeIndex: Number(e.currentTarget.dataset.index) })
  },

  onGoSearch() {
    wx.navigateTo({ url: '/packageSearch/pages/search/index' })
  },

  onSetmealTap(e: WechatMiniprogram.CustomEvent) {
    const { setmeal } = e.detail
    wx.navigateTo({ url: `/pages/setmeal-detail/index?id=${setmeal.id}` })
  },

  onOpenDetail(e: WechatMiniprogram.CustomEvent) {
    this.setData({ currentDish: e.detail.dish, detailVisible: true })
  },

  onCloseDetail() {
    this.setData({ detailVisible: false })
  },

  onSelectFlavor(e: WechatMiniprogram.CustomEvent) {
    this.setData({ flavorDish: e.detail.dish, flavorVisible: true, detailVisible: false })
  },

  onCloseFlavor() {
    this.setData({ flavorVisible: false })
  },

  async onFlavorConfirm(e: WechatMiniprogram.CustomEvent) {
    const { dish, flavorText } = e.detail
    if (this.data.shopStatus !== 1) return
    const ok = await ensureLogin()
    if (!ok) return
    try {
      await shopCartStore.dispatch('addAction', { dishId: dish.id, dishFlavor: flavorText, number: 1 })
      wx.showToast({ title: '已加入购物车', icon: 'success' })
    } catch {
      /* 错误已提示 */
    }
  },

  /** 无规格菜品步进器变化 */
  async onDishChange(e: WechatMiniprogram.CustomEvent) {
    if (this.data.shopStatus !== 1) return
    const { dish, value } = e.detail
    const cur = this.data.countMap[dish.id] || 0
    if (value === cur) return
    const ok = await ensureLogin()
    if (!ok) return
    try {
      if (value > cur) {
        await shopCartStore.dispatch('addAction', { dishId: dish.id, number: value - cur })
      } else {
        for (let i = 0; i < cur - value; i++) {
          await shopCartStore.dispatch('subAction', { dishId: dish.id })
        }
      }
    } catch {
      /* 错误已提示 */
    }
  },

  /** 商品详情弹窗内步进器 */
  async onDetailChange(e: WechatMiniprogram.CustomEvent) {
    await this.onDishChange(e)
  },

  onToggleCart() {
    if (this.data.allCount === 0 || this.data.shopStatus !== 1) return
    this.setData({ cartVisible: true })
  },

  onCloseCart() {
    this.setData({ cartVisible: false })
  },

  async onCartItemChange(e: WechatMiniprogram.CustomEvent) {
    const { item, value } = e.detail
    const cur = item.number
    if (value === cur) return
    const ok = await ensureLogin()
    if (!ok) return
    try {
      if (value > cur) {
        await shopCartStore.dispatch('addAction', {
          dishId: item.dishId,
          setmealId: item.setmealId,
          dishFlavor: item.dishFlavor,
          number: value - cur,
        })
      } else {
        for (let i = 0; i < cur - value; i++) {
          await shopCartStore.dispatch('subAction', {
            dishId: item.dishId,
            setmealId: item.setmealId,
            dishFlavor: item.dishFlavor,
          })
        }
      }
    } catch {
      /* 错误已提示 */
    }
  },

  onCartClear() {
    wx.showModal({
      title: '提示',
      content: '确定清空购物车吗？',
      success: (res) => {
        if (res.confirm) shopCartStore.dispatch('cleanAction').catch(() => {})
      },
    })
  },

  async onCartSettle() {
    const ok = await ensureLogin()
    if (!ok) return
    // 全选后进入确认订单
    shopCartStore.dispatch('toggleSelectAllAction', true)
    wx.navigateTo({ url: '/packageOrder/pages/order-confirm/index' })
  },

  onCallPhone() {
    this.setData({ phoneVisible: true })
  },

  onClosePhone() {
    this.setData({ phoneVisible: false })
  },

  onPhoneConfirm() {
    wx.makePhoneCall({ phoneNumber: SHOP_PHONE })
    this.setData({ phoneVisible: false })
  },
})
