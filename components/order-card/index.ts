/**
 * 订单卡片（历史订单列表用）
 * 按 status 渲染状态与操作按钮：
 *  1 待付款：取消订单 / 立即支付 / 再来一单
 *  2 待接单：催单 / 取消订单
 *  3 已接单、4 派送中：取消订单（电话沟通）
 *  5 已完成：再来一单 / 申请退款
 *  6 已取消：再来一单
 */
const STATUS_TEXT: Record<number, string> = {
  1: '待付款',
  2: '待接单',
  3: '已接单',
  4: '派送中',
  5: '已完成',
  6: '已取消',
}

Component({
  properties: {
    order: { type: Object, value: {} },
  },
  data: {
    statusText: '',
    actions: [] as { key: string; label: string; type?: string }[],
  },
  observers: {
    order(order: any) {
      if (!order || !order.id) return
      const status = order.status
      let actions: { key: string; label: string; type?: string }[] = []
      switch (status) {
        case 1:
          actions = [
            { key: 'cancel', label: '取消订单' },
            { key: 'pay', label: '立即支付', type: 'primary' },
            { key: 'repeat', label: '再来一单' },
          ]
          break
        case 2:
          actions = [
            { key: 'reminder', label: '催单' },
            { key: 'cancel', label: '取消订单' },
          ]
          break
        case 3:
        case 4:
          actions = [{ key: 'cancel', label: '取消订单' }]
          break
        case 5:
          actions = [
            { key: 'repeat', label: '再来一单' },
            { key: 'refund', label: '申请退款' },
          ]
          break
        case 6:
          actions = [{ key: 'repeat', label: '再来一单' }]
          break
      }
      this.setData({ statusText: STATUS_TEXT[status] || '', actions })
    },
  },
  methods: {
    onTapCard() {
      this.triggerEvent('detail', { order: this.data.order })
    },
    onAction(e: WechatMiniprogram.CustomEvent) {
      const key = String(e.currentTarget.dataset.key)
      this.triggerEvent(key, { order: this.data.order })
    },
    onNoop() {
      /* 阻止冒泡 */
    },
  },
})
