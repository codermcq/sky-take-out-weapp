/**
 * 地址选择临时通道：
 * 确认订单页 → 地址管理(select 模式) → 选中写 storage → 返回后确认订单页读取
 */
import { STORAGE_SELECTED_ADDRESS } from './constant'

export function saveSelectedAddress(addr: object) {
  wx.setStorageSync(STORAGE_SELECTED_ADDRESS, addr)
}

export function getSelectedAddress(): any {
  return wx.getStorageSync(STORAGE_SELECTED_ADDRESS) || null
}

export function clearSelectedAddress() {
  wx.removeStorageSync(STORAGE_SELECTED_ADDRESS)
}
