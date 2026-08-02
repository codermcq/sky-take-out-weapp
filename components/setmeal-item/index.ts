/** 套餐卡片：点击进入套餐详情 */
Component({
  properties: {
    setmeal: { type: Object, value: {} },
    disabled: { type: Boolean, value: false },
  },
  methods: {
    onTap() {
      if (this.data.disabled) return
      this.triggerEvent('tap', { setmeal: this.data.setmeal })
    },
  },
})
