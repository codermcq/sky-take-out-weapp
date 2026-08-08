/** 订单状态 */
export enum OrderStatus {
  /** 待付款 */
  PENDING_PAYMENT = 1,
  /** 待接单 */
  TO_BE_CONFIRMED = 2,
  /** 已接单 */
  CONFIRMED = 3,
  /** 派送中 */
  DELIVERY_IN_PROGRESS = 4,
  /** 已完成 */
  COMPLETED = 5,
  /** 已取消 */
  CANCELLED = 6,
}

/** 支付状态 */
export enum PayStatus {
  /** 未支付 */
  UNPAID = 0,
  /** 已支付 */
  PAID = 1,
  /** 退款 */
  REFUND = 2,
}

/** 配送状态（提交订单时） */
export enum DeliveryStatus {
  /** 立即送 */
  IMMEDIATELY = 0,
  /** 预约送 */
  APPOINTMENT = 1,
}

/** 餐具数量状态 */
export enum TablewareStatus {
  /** 按餐量供应 */
  BY_QUANTITY = 0,
  /** 指定数量 */
  SPECIFIED = 1,
}

/** 订单详情中的商品行 */
export interface OrderDetail {
  id: number
  orderId: number
  dishId?: number
  setmealId?: number
  name: string
  image?: string
  dishFlavor?: string
  /** 数量 */
  number: number
  /** 单价（元） */
  amount: number
}

/** 订单 */
export interface Order {
  id: number
  number: string
  status: OrderStatus
  userId: number
  addressBookId: number
  orderTime: string
  checkoutTime?: string
  /** 支付方式：1 微信，2 支付宝 */
  payMethod?: number
  payStatus?: PayStatus
  /** 订单金额（元） */
  amount: number
  remark?: string
  phone?: string
  address?: string
  consignee?: string
  /** 预计送达时间 */
  estimatedDeliveryTime?: string
  /** 实际送达时间 */
  deliveryTime?: string
  /** 打包费（元） */
  packAmount?: number
  /** 订单取消原因 */
  cancelReason?: string
  /** 订单拒单原因 */
  rejectionReason?: string
  orderDetailList: OrderDetail[]
}

/** 提交订单 DTO（对齐苍穹外卖标准后端 submitOrderDTO） */
export interface OrderSubmitDTO {
  addressBookId: number
  payMethod: number
  remark: string
  /** 预计送达时间 yyyy-MM-dd HH:mm */
  estimatedDeliveryTime: string
  /** 配送状态：0 立即送，1 预约送 */
  deliveryStatus: DeliveryStatus
  /** 餐具数量（tablewareStatus=1 时生效） */
  tablewareNumber: number
  /** 餐具数量状态：0 按餐量供应，1 指定数量 */
  tablewareStatus: TablewareStatus
  /** 打包费（元） */
  packAmount: number
  /** 订单总金额（元） */
  amount: number
}

/** 提交订单返回 */
export interface OrderSubmitVO {
  id: number
  orderNumber: string
  orderAmount: number
  orderTime: string
}

/** 历史订单查询参数 */
export interface OrderPageQuery {
  page: number
  pageSize: number
  /** 订单状态（待付款 tab 传 1） */
  status?: number
  /** 支付状态（退款 tab 传 2） */
  payStatus?: number
}
