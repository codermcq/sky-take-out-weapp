/** 购物车页（tab）：勾选/全选/步进/左滑删除/清空/去结算 */
import shopCartStore from '../../store/shopCartStore'
import { ensureLogin, isLoggedIn } from '../../utils/auth'

Page({
  data: {
    loggedIn: false,
    cartList: [] as any[],
    selectedIds: [] as number[],
    selectedMap: {} as Record<number, boolean>,
    allSelected: true,
    totalPrice: 0,
    totalCount: 0,
  },

  onLoad() {
    this.bindStores()
  },

  onShow() {
    const loggedIn = isLoggedIn()
    this.setData({ loggedIn })
    if (loggedIn) shopCartStore.dispatch('fetchCartAction')
  },

  onUnload() {
    this.unbindStores()
  },

  bindStores() {
    const self: any = this
    self.cb = {
      cartList: (v: any) => this.setData({ cartList: v }),
      selectedIds: (v: any) => this.syncSelected(v),
      allSelected: (v: any) => this.setData({ allSelected: v }),
      totalPrice: (v: any) => this.setData({ totalPrice: v }),
      totalCount: (v: any) => this.setData({ totalCount: v }),
    }
    shopCartStore.onState('cartList', self.cb.cartList)
    shopCartStore.onState('selectedIds', self.cb.selectedIds)
    shopCartStore.onState('allSelected', self.cb.allSelected)
    shopCartStore.onState('totalPrice', self.cb.totalPrice)
    shopCartStore.onState('totalCount', self.cb.totalCount)
    this.setData({
      cartList: shopCartStore.state.cartList,
      allSelected: shopCartStore.state.allSelected,
      totalPrice: shopCartStore.state.totalPrice,
      totalCount: shopCartStore.state.totalCount,
    })
    this.syncSelected(shopCartStore.state.selectedIds)
  },

  /** 由 selectedIds 生成 selectedMap（WXML 不支持 indexOf） */
  syncSelected(ids: number[]) {
    const selectedMap: Record<number, boolean> = {}
    for (const id of ids) selectedMap[id] = true
    this.setData({ selectedIds: ids, selectedMap })
  },

  unbindStores() {
    const self: any = this
    if (!self.cb) return
    shopCartStore.offState('cartList', self.cb.cartList)
    shopCartStore.offState('selectedIds', self.cb.selectedIds)
    shopCartStore.offState('allSelected', self.cb.allSelected)
    shopCartStore.offState('totalPrice', self.cb.totalPrice)
    shopCartStore.offState('totalCount', self.cb.totalCount)
  },

  onGoLogin() {
    wx.navigateTo({ url: '/pages/login/index' })
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/home/index' })
  },

  onToggleSelect(e: WechatMiniprogram.TouchEvent) {
    shopCartStore.dispatch('toggleSelectAction', Number(e.currentTarget.dataset.id))
  },

  onToggleAll() {
    shopCartStore.dispatch('toggleSelectAllAction', !this.data.allSelected)
  },

  async onStepperChange(e: WechatMiniprogram.CustomEvent) {
    const id = Number(e.currentTarget.dataset.id)
    const value = Number(e.detail)
    const item = this.data.cartList.find((i: any) => i.id === id)
    if (!item || item.number === value) return
    try {
      if (value > item.number) {
        await shopCartStore.dispatch('addAction', {
          dishId: item.dishId,
          setmealId: item.setmealId,
          dishFlavor: item.dishFlavor,
          number: value - item.number,
        })
      } else {
        for (let i = 0; i < item.number - value; i++) {
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

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '提示',
      content: '删除该商品？',
      success: (r) => {
        if (r.confirm) shopCartStore.dispatch('removeItemAction', id).catch(() => {})
      },
    })
  },

  onClear() {
    wx.showModal({
      title: '提示',
      content: '确定清空购物车吗？',
      success: (r) => {
        if (r.confirm) shopCartStore.dispatch('cleanAction').catch(() => {})
      },
    })
  },

  async onSettle() {
    const ok = await ensureLogin()
    if (!ok) return
    if (!this.data.selectedIds.length) {
      wx.showToast({ title: '请选择商品', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/packageOrder/pages/order-confirm/index' })
  },
})
