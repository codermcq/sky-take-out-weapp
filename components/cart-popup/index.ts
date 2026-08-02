/** 首页购物车弹窗：商品列表 + 数量加减 + 清空 + 去结算 */
Component({
  properties: {
    show: { type: Boolean, value: false },
    cartList: { type: Array, value: [] },
    totalPrice: { type: Number, value: 0 },
  },
  methods: {
    onClose() {
      this.triggerEvent('close')
    },
    onNoop() {
      /* 阻止冒泡 */
    },
    onStepperChange(e: WechatMiniprogram.CustomEvent) {
      const id = Number(e.currentTarget.dataset.id)
      const value = Number(e.detail)
      const item = this.data.cartList.find((i: any) => i.id === id)
      if (item) this.triggerEvent('change', { item, value })
    },
    onClear() {
      this.triggerEvent('clear')
    },
    onSettle() {
      this.triggerEvent('settle')
    },
  },
})
