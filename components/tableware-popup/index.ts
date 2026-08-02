/**
 * 餐具数量选择弹窗
 * 选项：无需餐具 / 依据餐量供应 / 1~10份
 * 输出：tablewareStatus + tablewareNumber
 */
Component({
  properties: {
    show: { type: Boolean, value: false },
    /** 当前值 { status, number } */
    value: { type: Object, value: { status: 1, number: 0 } },
  },
  data: {
    options: [] as { key: string; label: string }[],
    selectedKey: 'none',
    MAX: 10,
  },
  observers: {
    'show, value'(show: boolean, value: any) {
      if (!show) return
      const v = value || { status: 1, number: 0 }
      const options = [{ key: 'none', label: '无需餐具' }, { key: 'auto', label: '依据餐量供应' }]
      for (let i = 1; i <= this.data.MAX; i++) options.push({ key: String(i), label: `${i}份` })
      let selectedKey = 'none'
      if (v.status === 0) {
        selectedKey = 'auto'
      } else if (v.number > 0) {
        selectedKey = String(v.number)
      }
      this.setData({ options, selectedKey })
    },
  },
  methods: {
    onSelect(e: WechatMiniprogram.CustomEvent) {
      this.setData({ selectedKey: String(e.currentTarget.dataset.key) })
    },
    onConfirm() {
      const key = this.data.selectedKey
      let status = 1
      let number = 0
      if (key === 'auto') {
        status = 0
        number = 0
      } else if (key === 'none') {
        status = 1
        number = 0
      } else {
        status = 1
        number = Number(key)
      }
      this.triggerEvent('confirm', { status, number })
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
