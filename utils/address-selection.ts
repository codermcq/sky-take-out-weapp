/**
 * 地址选择临时通道：
 * 确认订单页 → 地址管理(select 模式) → 选中写 storage → 返回后确认订单页读取
 */
import { STORAGE_SELECTED_ADDRESS } from './constant'

export function saveSelectedAddress(addr: any) {
  wx.setStorageSync(STORAGE_SELECTED_ADDRESS, addr)
}

export function getSelectedAddress(): any {
  return wx.getStorageSync(STORAGE_SELECTED_ADDRESS) || null
}

export function clearSelectedAddress() {
  wx.removeStorageSync(STORAGE_SELECTED_ADDRESS)
}

/** 检查已选地址是否被删除（传入被删地址的 id） */
export function isSelectedAddressDeleted(deletedId: number): boolean {
  const addr = getSelectedAddress()
  return addr && addr.id === deletedId
}
