/** 订单详情：按状态渲染状态头、信息区、金额明细、操作按钮 */
import { orderDetail } from '../../../services/order'
import { Order, OrderStatus, PayStatus } from '../../../types/order'
import { confirmCancelOrder, confirmReminder, doRepeat, confirmRefund, goPay } from '../../../utils/order-actions'

/** 支付倒计时（分钟） */
const PAY_TIMEOUT_MINUTES = 15

/** 格式化倒计时 mm:ss */
function fmtCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

const STATUS_CONFIG: Record<number, { title: string; sub: string }> = {
  [OrderStatus.PENDING_PAYMENT]:     { title: '等待付款',     sub: '' },
  [OrderStatus.TO_BE_CONFIRMED]:     { title: '等待商家接单', sub: '已支付，等待商家接单' },
  [OrderStatus.CONFIRMED]:           { title: '商家已接单',   sub: '商家正在为您准备餐品' },
  [OrderStatus.DELIVERY_IN_PROGRESS]: { title: '骑手配送中',  sub: '骑手正在赶往您的地址' },
  [OrderStatus.COMPLETED]:            { title: '订单已完成',   sub: '感谢您的信任，欢迎再次光临' },
  [OrderStatus.CANCELLED]:            { title: '订单已取消',   sub: '' },
}

Page({
  /** 倒计时定时器 ID */
  _timer: 0 as number,

  data: {
    orderId: 0,
    order: null as Order | null,
    loading: true,
    // 状态头
    statusTitle: '',
    statusSub: '',
    // 倒计时（仅待付款）
    countdownText: '',
    countdownExpired: false,
    // 金额明细
    goodsAmount: '0.00',
    packFee: '0.00',
    deliveryFee: '6.00',
    // 支付方式文本
    payMethodText: '',
    // 支付时间
    payTime: '',
    // 取消/拒单原因
    cancelInfo: '',
  },

  onLoad(query: Record<string, string>) {
    const orderId = Number(query.id || 0)
    this.setData({ orderId })
    this.loadDetail()
  },

  onUnload() {
    this.stopTimer()
  },

  loadDetail() {
    this.stopTimer()
    this.setData({ loading: true })
    orderDetail(this.data.orderId)
      .then((order) => {
        const cfg = STATUS_CONFIG[order.status]
        let statusSub = cfg ? cfg.sub : ''

        // 待付款：启动倒计时
        if (order.status === OrderStatus.PENDING_PAYMENT) {
          this.startCountdown(order.orderTime)
        }

        // 已取消：根据 payStatus 区分退款文案
        if (order.status === OrderStatus.CANCELLED) {
          if (order.payStatus === PayStatus.REFUND) {
            statusSub = '退款成功，预计1-3个工作日到账'
          } else if (order.payStatus === PayStatus.PAID) {
            statusSub = '已付款订单取消，退款处理中'
          }
        }

        // 已接单/派送中：显示预计送达（覆盖默认 subtitle）
        const eta = order.estimatedDeliveryTime
        if ((order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.DELIVERY_IN_PROGRESS) && eta) {
          statusSub = '预计送达 ' + eta
        }

        // 金额明细：goodsAmount = total - packAmount - 6
        const packFee = order.packAmount || 0
        const rawGoods = order.amount - packFee - 6
        const goodsAmount = rawGoods > 0 ? rawGoods.toFixed(2) : '0.00'

        // 支付方式与时间
        let payMethodText = ''
        if (order.payMethod === 1) payMethodText = '微信支付'
        else if (order.payMethod === 2) payMethodText = '支付宝'
        const payTime = order.checkoutTime ? order.checkoutTime.slice(0, 16) : ''

        // 取消/拒单原因
        let cancelInfo = ''
        if (order.cancelReason) cancelInfo = '取消原因：' + order.cancelReason
        if (order.rejectionReason) cancelInfo = '拒单原因：' + order.rejectionReason

        this.setData({
          order,
          statusTitle: cfg ? cfg.title : '',
          statusSub,
          goodsAmount,
          packFee: packFee.toFixed(2),
          payMethodText,
          payTime,
          cancelInfo,
        })
      })
      .catch(() => this.setData({ order: null }))
      .finally(() => this.setData({ loading: false }))
  },

  /* ===== 倒计时 ===== */
  startCountdown(orderTime: string) {
    const deadline = new Date(orderTime.replace(/-/g, '/')).getTime() + PAY_TIMEOUT_MINUTES * 60 * 1000

    const tick = () => {
      const remain = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      this.setData({
        countdownText: fmtCountdown(remain),
        countdownExpired: remain <= 0,
      })
      if (remain <= 0) {
        this.stopTimer()
      }
    }

    tick() // 立即执行一次
    this._timer = setInterval(tick, 1000) as unknown as number
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = 0
    }
  },

  /* ===== 操作 ===== */
  onGoPay() {
    if (this.data.order) goPay(this.data.order)
  },

  onAction(e: WechatMiniprogram.TouchEvent) {
    const order = this.data.order
    if (!order) return
    const type = String(e.currentTarget.dataset.type)
    switch (type) {
      case 'cancel':
        confirmCancelOrder(order, () => this.loadDetail())
        break
      case 'reminder':
        confirmReminder(order, () => this.loadDetail())
        break
      case 'repeat':
        doRepeat(order)
        break
      case 'refund':
        confirmRefund(order, () => this.loadDetail())
        break
    }
  },

  onGoHome() {
    wx.reLaunch({ url: '/pages/home/index' })
  },
})
