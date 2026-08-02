/** 商品详情卡片弹窗：大图 + 描述 + 价格；有规格则引导选规格 */
Component({
  properties: {
    show: { type: Boolean, value: false },
    dish: { type: Object, value: {} },
    count: { type: Number, value: 0 },
  },
  methods: {
    onClose() {
      this.triggerEvent('close')
    },
    onNoop() {
      /* 阻止冒泡 */
    },
    onSelectFlavor() {
      this.triggerEvent('flavor', { dish: this.data.dish })
    },
    onStepperChange(e: WechatMiniprogram.CustomEvent) {
      const value = Number(e.detail)
      this.triggerEvent('change', { dish: this.data.dish, value })
    },
  },
})
