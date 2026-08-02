/**
 * 菜品列表项
 * 无规格：显示「＋」按钮，点击直接加购
 * 有规格：显示「选择规格」按钮，点击弹规格窗
 */
Component({
  properties: {
    dish: { type: Object, value: {} },
    disabled: { type: Boolean, value: false },
  },
  methods: {
    onTapItem() {
      this.triggerEvent('detail', { dish: this.data.dish })
    },
    onSelectFlavor() {
      this.triggerEvent('flavor', { dish: this.data.dish })
    },
    onAdd() {
      this.triggerEvent('add', { dish: this.data.dish })
    },
  },
})
