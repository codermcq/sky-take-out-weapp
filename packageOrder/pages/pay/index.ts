/** 支付订单页：15 分钟倒计时 + 模拟支付 */
import { payment } from '../../../services/order'
import { PAY_TIMEOUT_MINUTES } from '../../../utils/constant'
import { confirmCancelOrder } from '../../../utils/order-actions'
import { OrderStatus } from '../../../types/order'

function pad2(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

Page({
  data: {
    orderId: 0,
    orderNumber: '',
    amount: 0,
    countdown: '15:00',
    expired: false,
    paying: false,
  },

  timer: null as ReturnType<typeof setInterval> | null,

  onLoad(query: Record<string, string>) {
    this.setData({
      orderId: Number(query.id || 0),
      orderNumber: query.orderNumber || '',
      amount: Number(query.amount || 0),
    })
    this.startCountdown()
  },

  onUnload() {
    this.stopCountdown()
  },

  startCountdown() {
    let left = PAY_TIMEOUT_MINUTES * 60
    this.stopCountdown()
    this.timer = setInterval(() => {
      left -= 1
      if (left <= 0) {
        this.stopCountdown()
        this.setData({ countdown: '00:00', expired: true })
        return
      }
      const m = Math.floor(left / 60)
      const s = left % 60
      this.setData({ countdown: `${pad2(m)}:${pad2(s)}` })
    }, 1000)
  },

  stopCountdown() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  async onPay() {
    if (this.data.expired || this.data.paying) return
    this.setData({ paying: true })
    wx.showLoading({ title: '支付中', mask: true })
    try {
      await payment(this.data.orderNumber)
      wx.hideLoading()
      wx.redirectTo({
        url: `/packageOrder/pages/pay-success/index?id=${this.data.orderId}&orderNumber=${this.data.orderNumber}&amount=${this.data.amount}`,
      })
    } catch {
      wx.hideLoading()
      // 支付失败：停留待付款
      wx.showToast({ title: '支付失败，请重试', icon: 'none' })
    }
    this.setData({ paying: false })
  },

  onCancel() {
    confirmCancelOrder({ id: this.data.orderId, number: this.data.orderNumber, amount: this.data.amount, status: OrderStatus.PENDING_PAYMENT } as any, () => {
      wx.redirectTo({ url: '/packageOrder/pages/order-list/index?tab=1' })
    })
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/home/index' })
  },
})
