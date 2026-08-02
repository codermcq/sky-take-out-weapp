/**
 * 省市区三级联动选择弹窗（地址分包内）
 * 地区数据 region.js 在本分包 data/ 下，随地址包加载
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const areaList = require('../../data/region')

Component({
  properties: {
    show: { type: Boolean, value: false },
    /** 当前选中的省市区 code，如 ['110000','110100','110101'] */
    value: { type: Array, value: [] },
  },
  data: {
    areaList,
    columnsNum: 3,
  },
  methods: {
    onConfirm(e: WechatMiniprogram.CustomEvent) {
      const values = (e.detail.values || []) as { code: string; name: string }[]
      const [province, city, district] = values
      this.triggerEvent('confirm', {
        province,
        city,
        district,
      })
      this.triggerEvent('close')
    },
    onCancel() {
      this.triggerEvent('close')
    },
    onClose() {
      this.triggerEvent('close')
    },
  },
})
