/**
 * 确认订单页
 * 收货地址 + 配送时间 + 餐具 + 备注 + 商品清单 + 费用明细 + 提交订单
 */
import shopCartStore from '../../../store/shopCartStore'
import { getDefaultAddress } from '../../../services/addressBook'
import { submitOrder } from '../../../services/order'
import { ensureLogin } from '../../../utils/auth'
import {
  PACK_AMOUNT_PER_ITEM,
  DELIVERY_FEE,
  DEFAULT_REMARK,
  STORAGE_ORDER_REMARK,
  DELIVERY_DELAY_HOURS,
} from '../../../utils/constant'
import { getSelectedAddress, clearSelectedAddress } from '../../../utils/address-selection'
import { ShoppingCartItem } from '../../../types/shoppingCart'
import { OrderSubmitDTO, DeliveryStatus, TablewareStatus } from '../../../types/order'

function pad2(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

Page({
  data: {
    address: null as any,
    items: [] as ShoppingCartItem[],
    visibleItems: [] as ShoppingCartItem[],
    goodsPrice: 0,
    packFee: 0,
    packFeePerItem: PACK_AMOUNT_PER_ITEM,
    deliveryFee: DELIVERY_FEE,
    totalAmount: 0,
    totalCount: 0,
    // 配送时间
    deliveryTimeText: '',
    estimatedDeliveryTime: '',
    deliveryStatus: DeliveryStatus.IMMEDIATELY,
    // 餐具
    tablewareText: '无需餐具',
    tablewareStatus: TablewareStatus.SPECIFIED,
    tablewareNumber: 0,
    // 备注
    remark: DEFAULT_REMARK,
    // 弹窗
    timeVisible: false,
    tablewareVisible: false,
    // 展开商品
    expanded: false,
    submitting: false,
  },

  onLoad() {
    this.loadItems()
    this.initDeliveryTime()
  },

  onShow() {
    // 从地址选择/备注页返回后读取
    const selected = getSelectedAddress()
    if (selected && selected.id) {
      this.setData({ address: selected })
      clearSelectedAddress()
    }
    const remark = wx.getStorageSync(STORAGE_ORDER_REMARK)
    if (remark !== '') {
      this.setData({ remark })
      wx.removeStorageSync(STORAGE_ORDER_REMARK)
    }
    this.loadDefaultAddress()
  },

  /** 读取已勾选商品并计算费用 */
  loadItems() {
    const { cartList, selectedIds } = shopCartStore.state
    const items = (cartList || []).filter((i: ShoppingCartItem) => selectedIds.includes(i.id))
    let goodsPrice = 0
    let totalCount = 0
    for (const item of items) {
      goodsPrice += item.amount * item.number
      totalCount += item.number
    }
    goodsPrice = Math.round(goodsPrice * 100) / 100
    const packFee = totalCount * PACK_AMOUNT_PER_ITEM
    const totalAmount = Math.round((goodsPrice + packFee + DELIVERY_FEE) * 100) / 100
    this.setData({ items, goodsPrice, packFee, totalCount, totalAmount })
    this.updateVisibleItems()
  },

  updateVisibleItems() {
    const { items, expanded } = this.data
    this.setData({ visibleItems: expanded ? items : items.slice(0, 3) })
  },

  loadDefaultAddress() {
    if (!this.data.address) {
      getDefaultAddress()
        .then((addr) => this.setData({ address: addr }))
        .catch(() => {
          /* 无默认地址，保持空 */
        })
    }
  },

  initDeliveryTime() {
    const now = new Date(Date.now() + DELIVERY_DELAY_HOURS * 60 * 60 * 1000)
    const time = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`
    this.setData({ estimatedDeliveryTime: time, deliveryTimeText: time })
  },

  // ---- 地址 ----
  onChooseAddress() {
    wx.navigateTo({ url: '/packageAddress/pages/address-list/index?mode=select' })
  },

  // ---- 配送时间 ----
  onOpenTime() {
    this.setData({ timeVisible: true })
  },
  onCloseTime() {
    this.setData({ timeVisible: false })
  },
  onTimeConfirm(e: WechatMiniprogram.CustomEvent) {
    const { time, deliveryStatus } = e.detail
    this.setData({ estimatedDeliveryTime: time, deliveryTimeText: time, deliveryStatus })
  },

  // ---- 餐具 ----
  onOpenTableware() {
    this.setData({ tablewareVisible: true })
  },
  onCloseTableware() {
    this.setData({ tablewareVisible: false })
  },
  onTablewareConfirm(e: WechatMiniprogram.CustomEvent) {
    const { status, number } = e.detail
    let text = '无需餐具'
    if (status === TablewareStatus.BY_QUANTITY) text = '依据餐量供应'
    else if (number > 0) text = `${number}份`
    this.setData({ tablewareStatus: status, tablewareNumber: number, tablewareText: text })
  },

  // ---- 备注 ----
  onGoRemark() {
    wx.navigateTo({ url: '/packageOrder/pages/order-remark/index' })
  },

  // ---- 展开商品 ----
  onToggleExpand() {
    this.setData({ expanded: !this.data.expanded })
    this.updateVisibleItems()
  },

  // ---- 提交 ----
  async onSubmit() {
    if (this.data.submitting) return
    if (!this.data.address) {
      wx.showToast({ title: '请先选择收货地址', icon: 'none' })
      return
    }
    if (!this.data.items.length) {
      wx.showToast({ title: '购物车为空', icon: 'none' })
      return
    }
    const ok = await ensureLogin()
    if (!ok) return

    const dto: OrderSubmitDTO = {
      addressBookId: this.data.address.id,
      payMethod: 1,
      remark: this.data.remark,
      estimatedDeliveryTime: this.data.estimatedDeliveryTime,
      deliveryStatus: this.data.deliveryStatus,
      tablewareNumber: this.data.tablewareNumber,
      tablewareStatus: this.data.tablewareStatus,
      packAmount: this.data.packFee,
      amount: this.data.totalAmount,
    }
    this.setData({ submitting: true })
    try {
      const res = await submitOrder(dto)
      // 提交成功：清购物车 → 跳支付页
      shopCartStore.dispatch('cleanAction').catch(() => {})
      wx.redirectTo({
        url: `/packageOrder/pages/pay/index?id=${res.id}&orderNumber=${res.orderNumber}&amount=${res.orderAmount}`,
      })
    } catch {
      /* 错误已提示 */
    }
    this.setData({ submitting: false })
  },
})
