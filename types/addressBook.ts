/** 地址簿 */
export interface AddressBook {
  id: number
  userId?: number
  /** 联系人 */
  consignee: string
  /** 性别：1 男，0 女 */
  sex?: number
  /** 手机号 */
  phone: string
  provinceCode?: string
  provinceName?: string
  cityCode?: string
  cityName?: string
  districtCode?: string
  districtName?: string
  /** 详细地址 */
  detail: string
  /** 标签：公司/家/学校 */
  label?: string
  /** 是否默认：1 默认，0 非默认 */
  isDefault: number
}

/** 提交给后端的地址（去掉服务端生成字段） */
export type AddressBookDTO = Omit<AddressBook, 'id' | 'userId'>
