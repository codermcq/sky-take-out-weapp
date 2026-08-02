/** 地址簿相关接口 */
import { mqRequest } from './index'
import { AddressBook, AddressBookDTO } from '../types/addressBook'

/** 查询全部地址 */
export function getAddressList() {
  return mqRequest.get<AddressBook[]>({
    url: '/user/addressBook/list',
  })
}

/** 查询默认地址 */
export function getDefaultAddress() {
  return mqRequest.get<AddressBook>({
    url: '/user/addressBook/default',
  })
}

/** 查询单个地址（编辑回显用） */
export function getAddressById(id: number) {
  return mqRequest.get<AddressBook>({
    url: `/user/addressBook/${id}`,
  })
}

/** 新增地址 */
export function addAddress(data: AddressBookDTO) {
  return mqRequest.post({
    url: '/user/addressBook',
    data,
  })
}

/** 编辑地址 */
export function updateAddress(data: AddressBook) {
  return mqRequest.put({
    url: '/user/addressBook',
    data,
  })
}

/** 删除地址 */
export function deleteAddress(id: number) {
  return mqRequest.delete({
    url: `/user/addressBook/${id}`,
  })
}

/** 设置默认地址 */
export function setDefaultAddress(id: number) {
  return mqRequest.put({
    url: '/user/addressBook/default',
    data: { id },
  })
}
