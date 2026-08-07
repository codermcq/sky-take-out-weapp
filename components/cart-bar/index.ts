/** 首页底部购物车栏：点击弹购物车弹窗 */
Component({
  properties: {
    totalPrice: { type: Number, value: 0 },
    totalCount: { type: Number, value: 0 },
    /** 是否有商品（控制显示/未点餐态） */
    visible: { type: Boolean, value: false },
    /** 打烊禁用 */
    disabled: { type: Boolean, value: false },
  },
  methods: {
    onTap() {
      if (!this.data.visible || this.data.disabled) return
      this.triggerEvent('tap')
    },
    onSettle() {
      if (!this.data.visible || this.data.disabled) return
      this.triggerEvent('settle')
    },
  },
})
