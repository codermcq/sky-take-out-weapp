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
    setmealVisible: false,
    currentSetmeal: null as any,
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

  /**
   * 加载分类（仅加载分类列表，不预加载菜品）
   * 选中第一个分类并懒加载它的菜品。
   */
  loadData() {
    wx.showLoading({ title: '加载中', mask: true })
    Promise.all([getCategoryList(1), getCategoryList(2)])
      .then(([dishCats, setmealCats]) => {
        const cats = [...dishCats, ...setmealCats]
        if (cats.length) {
          this.setData({ categories: cats })
          this.loadCategoryItems(0) // 默认加载第一个分类
        } else {
          this.setData({ categories: [] })
        }
      })
      .catch(() => {
        wx.showToast({ title: '加载失败，下拉可重试', icon: 'none' })
      })
      .finally(() => wx.hideLoading())
  },

  /** 懒加载指定分类的菜品/套餐（仅在未被加载时触发） */
  loadCategoryItems(index: number) {
    const cat = this.data.categories[index]
    if (!cat || cat._loaded) return
    // 标记正在加载，防重复请求
    this.setData({ [`categories[${index}]._loading`]: true })
    const fetcher = cat.type === 1 ? getDishList(cat.id) : getSetmealList(cat.id)
    fetcher
      .then((items) => {
        // 无菜品的分类不展示（原型要求隐藏）
        if (!items || !items.length) {
          this.setData({ [`categories[${index}]._loaded`]: true, [`categories[${index}]._loading`]: false, [`categories[${index}]._empty`]: true })
          return
        }
        this.setData({ [`categories[${index}].items`]: items, [`categories[${index}]._loaded`]: true, [`categories[${index}]._loading`]: false })
      })
      .catch(() => {
        this.setData({ [`categories[${index}]._loaded`]: true, [`categories[${index}]._loading`]: false, [`categories[${index}]._empty`]: true })
      })
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadData(),
      shopStore.dispatch('fetchStatusAction'),
      isLoggedIn() ? shopCartStore.dispatch('fetchCartAction') : Promise.resolve(),
    ]).finally(() => wx.stopPullDownRefresh())
  },

  /** 切换分类：已加载过则直接显示，否则懒加载 */
  onSelectCat(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({ activeIndex: index })
    this.loadCategoryItems(index)
  },

  onSetmealTap(e: WechatMiniprogram.CustomEvent) {
    const { setmeal } = e.detail
    this.setData({ currentSetmeal: setmeal, setmealVisible: true })
  },

  onCloseSetmeal() {
    this.setData({ setmealVisible: false })
  },

  async onAddSetmeal(e: WechatMiniprogram.CustomEvent) {
    const { setmeal } = e.detail
    if (this.data.shopStatus !== 1) return
    const ok = await ensureLogin()
    if (!ok) return
    shopCartStore.dispatch('addAction', { setmealId: setmeal.id })
    this.setData({ setmealVisible: false })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
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
    shopCartStore.dispatch('addAction', {
      dishId: dish.id,
      dishFlavor: flavorText,
    })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  /** 无规格菜品：点击「＋」直接加购 */
  async onDishAdd(e: WechatMiniprogram.CustomEvent) {
    if (this.data.shopStatus !== 1) return
    const { dish } = e.detail
    const ok = await ensureLogin()
    if (!ok) return
    shopCartStore.dispatch('addAction', { dishId: dish.id })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  /** 无规格菜品步进器变化（产品详情弹窗内用） */
  async onDishChange(e: WechatMiniprogram.CustomEvent) {
    if (this.data.shopStatus !== 1) return
    const { dish, value } = e.detail
    const cur = this.data.countMap[dish.id] || 0
    if (value === cur) return
    const ok = await ensureLogin()
    if (!ok) return
    if (value > cur) {
      for (let i = 0; i < value - cur; i++) {
        shopCartStore.dispatch('addAction', { dishId: dish.id })
      }
    } else {
      for (let i = 0; i < cur - value; i++) {
        shopCartStore.dispatch('subAction', { dishId: dish.id })
      }
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

  onCartItemChange(e: WechatMiniprogram.CustomEvent) {
    const { item, value } = e.detail
    const cur = item.number
    if (value === cur) return
    if (value > cur) {
      for (let i = 0; i < value - cur; i++) {
        shopCartStore.dispatch('addAction', {
          dishId: item.dishId,
          setmealId: item.setmealId,
          dishFlavor: item.dishFlavor,
        })
      }
    } else {
      for (let i = 0; i < cur - value; i++) {
        shopCartStore.dispatch('subAction', {
          dishId: item.dishId,
          setmealId: item.setmealId,
          dishFlavor: item.dishFlavor,
        })
      }
    }
  },

  onCartClear() {
    wx.showModal({
      title: '提示',
      content: '确定清空购物车吗？',
      success: (res) => {
        if (res.confirm) shopCartStore.dispatch('cleanAction')
      },
    })
  },

  async onCartSettle() {
    const ok = await ensureLogin()
    if (!ok) return
    shopCartStore.dispatch('toggleSelectAllAction', true)
    wx.navigateTo({ url: '/packageOrder/pages/order-confirm/index' })
  },

  onGoPersonal() {
    wx.navigateTo({ url: '/pages/personal/index' })
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
