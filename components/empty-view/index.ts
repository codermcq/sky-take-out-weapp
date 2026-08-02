/**
 * 统一空态
 * type: default | network | order | address（决定图标/文案）
 */
Component({
  properties: {
    type: { type: String, value: 'default' },
    text: { type: String, value: '暂无数据' },
    btnText: { type: String, value: '' },
  },
  data: {
    iconMap: {
      default: '📦',
      network: '📡',
      order: '🧾',
      address: '📍',
    },
  },
  methods: {
    onBtn() {
      this.triggerEvent('btn')
    },
  },
})
