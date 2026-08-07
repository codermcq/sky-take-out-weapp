/** 地址管理：列表 + 增删改 + 设默认；mode=select 供下单页选地址 */
import { getAddressList, deleteAddress, setDefaultAddress } from '../../../services/addressBook'
import { AddressBook } from '../../../types/addressBook'
import { saveSelectedAddress, isSelectedAddressDeleted, clearSelectedAddress } from '../../../utils/address-selection'

Page({
  data: {
    mode: 'manage', // manage | select
    list: [] as AddressBook[],
    loading: true,
  },

  onLoad(query: Record<string, string>) {
    this.setData({ mode: query.mode === 'select' ? 'select' : 'manage' })
  },

  onShow() {
    this.loadList()
  },

  loadList() {
    this.setData({ loading: true })
    getAddressList()
      .then((list) => this.setData({ list: list || [] }))
      .catch(() => this.setData({ list: [] }))
      .finally(() => this.setData({ loading: false }))
  },

  onAdd() {
    wx.navigateTo({ url: '/packageAddress/pages/address-edit/index' })
  },

  onEdit(e: WechatMiniprogram.CustomEvent) {
    const { address } = e.detail
    wx.navigateTo({ url: `/packageAddress/pages/address-edit/index?id=${address.id}` })
  },

  onDelete(e: WechatMiniprogram.CustomEvent) {
    const { address } = e.detail
    wx.showModal({
      title: '删除地址',
      content: '确定删除该地址吗？',
      success: (r) => {
        if (r.confirm) {
          deleteAddress(address.id)
            .then(() => {
              // 如果删除了已选中的地址，清除 storage 中的选择
              if (isSelectedAddressDeleted(address.id)) {
                clearSelectedAddress()
              }
              this.loadList()
            })
            .catch(() => {})
        }
      },
    })
  },

  onSetDefault(e: WechatMiniprogram.CustomEvent) {
    const { address } = e.detail
    if (address.isDefault) return
    setDefaultAddress(address.id)
      .then(() => this.loadList())
      .catch(() => {})
  },

  /** select 模式：选中地址写 storage 返回 */
  onSelect(e: WechatMiniprogram.CustomEvent) {
    if (this.data.mode !== 'select') return
    const { address } = e.detail
    saveSelectedAddress(address)
    wx.navigateBack()
  },
})
