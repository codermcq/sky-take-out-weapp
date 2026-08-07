/** 地址卡片：列表/选择/管理三种模式 */
Component({
  properties: {
    address: { type: Object, value: {} },
    /** 选中态（select 模式） */
    selected: { type: Boolean, value: false },
    /** 管理模式：显示编辑/删除/设默认 */
    manage: { type: Boolean, value: false },
  },
  data: {
    fullAddress: '',
    surname: '',
    genderLabel: '',
  },
  observers: {
    address(addr: any) {
      if (!addr) return
      const full = `${addr.provinceName || ''}${addr.cityName || ''}${addr.districtName || ''}${addr.detail || ''}`
      const surname = (addr.consignee || '').charAt(0)
      const gender = addr.sex === 0 ? '女士' : '先生'
      this.setData({ fullAddress: full, surname, genderLabel: gender })
    },
  },
  methods: {
    onTap() {
      this.triggerEvent('select', { address: this.data.address })
    },
    onEdit() {
      this.triggerEvent('edit', { address: this.data.address })
    },
    onDelete() {
      this.triggerEvent('delete', { address: this.data.address })
    },
    onSetDefault() {
      this.triggerEvent('set-default', { address: this.data.address })
    },
    onNoop() {
      /* 阻止冒泡 */
    },
  },
})
