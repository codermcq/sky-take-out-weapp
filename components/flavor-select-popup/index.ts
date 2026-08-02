/**
 * 规格（口味）选择弹窗
 * dish.flavor = [{ name: 口味名, value: "选项1,选项2,..." }]
 * 每组单选，确定后按顺序拼接口味文本
 */
Component({
  properties: {
    show: { type: Boolean, value: false },
    dish: { type: Object, value: {} },
  },
  data: {
    groups: [] as { name: string; options: string[]; selected: string }[],
  },
  observers: {
    'show, dish'(show: boolean, dish: any) {
      if (show && dish && dish.flavor) {
        const groups = dish.flavor.map((f: any) => {
          const options = String(f.value || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
          return { name: f.name, options, selected: options[0] || '' }
        })
        this.setData({ groups })
      }
    },
  },
  methods: {
    onSelectOption(e: WechatMiniprogram.CustomEvent) {
      const groupIndex = Number(e.currentTarget.dataset.group)
      const value = String(e.currentTarget.dataset.value)
      const key = `groups[${groupIndex}].selected`
      this.setData({ [key]: value })
    },
    onConfirm() {
      const flavorText = this.data.groups.map((g) => g.selected).filter(Boolean).join(',')
      this.triggerEvent('confirm', { dish: this.data.dish, flavorText })
      this.triggerEvent('close')
    },
    onClose() {
      this.triggerEvent('close')
    },
    onNoop() {
      /* 阻止冒泡 */
    },
  },
})
