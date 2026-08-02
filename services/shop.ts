/** 店铺相关接口 */
import { mqRequest } from './index'

/** 查询营业状态：1 营业中，0 打烊中 */
export function getShopStatus() {
  return mqRequest.get<number>({
    url: '/user/shop/status',
  })
}
