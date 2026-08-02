/** 下单成功页：预计送达 = 下单时间 + 1 小时 */
import { DELIVERY_DELAY_HOURS } from '../../../utils/constant'

function pad2(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

Page({
  data: {
    orderId: 0,
    orderNumber: '',
    amount: 0,
    estimatedTime: '',
  },

  onLoad(query: Record<string, string>) {
    const now = new Date(Date.now() + DELIVERY_DELAY_HOURS * 60 * 60 * 1000)
    const estimatedTime = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`
    this.setData({
      orderId: Number(query.id || 0),
      orderNumber: query.orderNumber || '',
      amount: Number(query.amount || 0),
      estimatedTime,
    })
  },

  onViewOrder() {
    wx.redirectTo({ url: `/packageOrder/pages/order-detail/index?id=${this.data.orderId}` })
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/home/index' })
  },
})
