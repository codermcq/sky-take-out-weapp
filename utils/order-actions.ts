/**
 * 订单操作复用：取消/催单/再来一单/退款/去支付
 * 供 订单列表/订单详情/个人中心最近订单 共用
 */
import { cancelOrder, reminder, repeat, refund } from '../services/order'
import { Order } from '../types/order'
import { SHOP_PHONE } from './constant'
import { OrderStatus } from '../types/order'

/** 取消订单：待付款/待接单直接取消；已接单/派送中需电话商家 */
export function confirmCancelOrder(order: Order, onDone?: () => void) {
  const status = order.status
  if (status === OrderStatus.CONFIRMED || status === OrderStatus.DELIVERY_IN_PROGRESS) {
    wx.showModal({
      title: '取消订单',
      content: '订单已接单/派送中，取消需电话联系商家',
      confirmText: '拨打电话',
      confirmColor: '#FF6B35',
      success: (r) => {
        if (r.confirm) wx.makePhoneCall({ phoneNumber: SHOP_PHONE })
      },
    })
    return
  }
  wx.showModal({
    title: '取消订单',
    content: '确定取消该订单吗？',
    success: async (r) => {
      if (r.confirm) {
        try {
          await cancelOrder(order.id)
          wx.showToast({ title: '已取消', icon: 'success' })
          onDone?.()
        } catch {
          /* 错误已提示 */
        }
      }
    },
  })
}

/** 催单（弹框确认） */
export function confirmReminder(order: Order, onDone?: () => void) {
  wx.showModal({
    title: '催单',
    content: '已提醒商家尽快处理您的订单',
    confirmText: '知道了',
    showCancel: false,
    success: async () => {
      try {
        await reminder(order.id)
      } catch {
        /* 错误已提示 */
      }
      onDone?.()
    },
  })
}

/** 再来一单：商品写回购物车 */
export function doRepeat(order: Order) {
  wx.showModal({
    title: '再来一单',
    content: '将该订单商品重新加入购物车？',
    success: async (r) => {
      if (!r.confirm) return
      try {
        await repeat(order.id)
        wx.showToast({ title: '已加入购物车', icon: 'success' })
        setTimeout(() => wx.switchTab({ url: '/pages/cart/index' }), 600)
      } catch {
        /* 错误已提示 */
      }
    },
  })
}

/** 申请退款 */
export function confirmRefund(order: Order, onDone?: () => void) {
  wx.showModal({
    title: '申请退款',
    content: '确定申请退款吗？退款到账以商家处理为准',
    success: async (r) => {
      if (!r.confirm) return
      try {
        await refund(order.id)
        wx.showToast({ title: '已提交申请', icon: 'success' })
        onDone?.()
      } catch {
        /* 错误已提示 */
      }
    },
  })
}

/** 去支付（待付款） */
export function goPay(order: Order) {
  wx.navigateTo({
    url: `/packageOrder/pages/pay/index?id=${order.id}&orderNumber=${order.number}&amount=${order.amount}`,
  })
}
