/**
 * 菜品列表项
 * 无规格（flavor 为空）：直接显示步进器加减
 * 有规格：显示【选择规格】按钮，由页面弹规格窗
 */
Component({
  properties: {
    dish: { type: Object, value: {} },
    /** 该菜品当前购物车数量（跨口味求和） */
    count: { type: Number, value: 0 },
    /** 打烊禁用 */
    disabled: { type: Boolean, value: false },
  },
  methods: {
    onTapItem() {
      this.triggerEvent('detail', { dish: this.data.dish })
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
