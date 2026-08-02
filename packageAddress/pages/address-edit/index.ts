/** 新增/编辑地址：联系人 + 手机号 + 省市区 + 详细地址 + 标签 + 默认 */
import { addAddress, updateAddress, deleteAddress, getAddressById } from '../../../services/addressBook'
import { AddressBook } from '../../../types/addressBook'

const LABELS = ['公司', '家', '学校']
const PHONE_REG = /^1[3-9]\d{9}$/

Page({
  data: {
    editId: 0,
    consignee: '',
    phone: '',
    provinceCode: '',
    provinceName: '',
    cityCode: '',
    cityName: '',
    districtCode: '',
    districtName: '',
    detail: '',
    label: '公司',
    labels: LABELS,
    isDefault: false,
    regionVisible: false,
    regionValue: [] as string[],
    loading: false,
  },

  onLoad(query: Record<string, string>) {
    const editId = Number(query.id || 0)
    if (editId) {
      this.setData({ editId })
      this.loadAddress(editId)
    }
  },

  loadAddress(id: number) {
    this.setData({ loading: true })
    getAddressById(id)
      .then((a) => {
        this.setData({
          consignee: a.consignee || '',
          phone: a.phone || '',
          provinceCode: a.provinceCode || '',
          provinceName: a.provinceName || '',
          cityCode: a.cityCode || '',
          cityName: a.cityName || '',
          districtCode: a.districtCode || '',
          districtName: a.districtName || '',
          detail: a.detail || '',
          label: a.label || '公司',
          isDefault: !!a.isDefault,
          regionValue: [a.provinceCode || '', a.cityCode || '', a.districtCode || ''],
        })
      })
      .catch(() => {})
      .finally(() => this.setData({ loading: false }))
  },

  onNameInput(e: WechatMiniprogram.Input) {
    let value = e.detail.value
    if (value.length > 12) value = value.slice(0, 12)
    this.setData({ consignee: value })
  },

  onPhoneInput(e: WechatMiniprogram.Input) {
    this.setData({ phone: e.detail.value.replace(/\D/g, '').slice(0, 11) })
  },

  onDetailInput(e: WechatMiniprogram.Input) {
    this.setData({ detail: e.detail.value })
  },

  onSelectLabel(e: WechatMiniprogram.TouchEvent) {
    this.setData({ label: String(e.currentTarget.dataset.label) })
  },

  onToggleDefault(e: WechatMiniprogram.CustomEvent) {
    this.setData({ isDefault: !!(e as any).detail })
  },

  // 省市区
  onOpenRegion() {
    this.setData({ regionVisible: true })
  },
  onCloseRegion() {
    this.setData({ regionVisible: false })
  },
  onRegionConfirm(e: WechatMiniprogram.CustomEvent) {
    const { province, city, district } = e.detail
    this.setData({
      provinceCode: province.code,
      provinceName: province.name,
      cityCode: city.code,
      cityName: city.name,
      districtCode: district.code,
      districtName: district.name,
      regionValue: [province.code, city.code, district.code],
    })
  },

  validate(): boolean {
    if (!this.data.consignee.trim()) {
      wx.showToast({ title: '请输入联系人', icon: 'none' })
      return false
    }
    if (!PHONE_REG.test(this.data.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return false
    }
    if (!this.data.districtName) {
      wx.showToast({ title: '请选择省市区', icon: 'none' })
      return false
    }
    if (!this.data.detail.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      return false
    }
    return true
  },

  onSave() {
    if (!this.validate()) return
    const d = this.data
    const base = {
      consignee: d.consignee.trim(),
      phone: d.phone,
      provinceCode: d.provinceCode,
      provinceName: d.provinceName,
      cityCode: d.cityCode,
      cityName: d.cityName,
      districtCode: d.districtCode,
      districtName: d.districtName,
      detail: d.detail.trim(),
      label: d.label,
      isDefault: d.isDefault,
    }
    const done = () => wx.navigateBack()
    if (d.editId) {
      updateAddress({ ...base, id: d.editId } as AddressBook).then(done).catch(() => {})
    } else {
      addAddress(base as any).then(done).catch(() => {})
    }
  },

  onDelete() {
    if (!this.data.editId) return
    wx.showModal({
      title: '删除地址',
      content: '确定删除该地址吗？',
      success: (r) => {
        if (r.confirm) {
          deleteAddress(this.data.editId).then(() => wx.navigateBack()).catch(() => {})
        }
      },
    })
  },
})
