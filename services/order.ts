/** 订单相关接口 */
import { mqRequest } from './index'
import { Order, OrderSubmitDTO, OrderSubmitVO, OrderPageQuery } from '../types/order'
import { PageResult } from '../types/common'

/** 提交订单 */
export function submitOrder(data: OrderSubmitDTO) {
  return mqRequest.post<OrderSubmitVO>({
    url: '/user/order/submit',
    data,
  })
}

/** 模拟支付：调用后端支付接口 */
export function payment(orderNumber: string) {
  return mqRequest.put<void>({
    url: '/user/order/payment',
    data: { orderNumber, payMethod: 1 },
  })
}

/** 催单 */
export function reminder(id: number) {
  return mqRequest.get({
    url: `/user/order/reminder/${id}`,
  })
}

/** 再来一单：把订单商品写回购物车 */
export function repeat(id: number) {
  return mqRequest.get({
    url: `/user/order/repeat/${id}`,
  })
}

/** 历史订单分页查询 */
export function historyOrders(params: OrderPageQuery) {
  return mqRequest.get<PageResult<Order>>({
    url: '/user/order/historyOrders',
    data: params,
  })
}

/** 订单详情 */
export function orderDetail(id: number) {
  return mqRequest.get<Order>({
    url: `/user/order/orderDetail/${id}`,
  })
}

/** 申请退款（原型要求；后端未实现时前端降级为电话提示） */
export function refund(id: number) {
  return mqRequest.post({
    url: `/user/order/refund/${id}`,
  })
}

/** 取消订单（原型：待付款/待接单可直接取消；后端需支持） */
export function cancelOrder(id: number) {
  return mqRequest.put({
    url: `/user/order/cancel/${id}`,
  })
}
