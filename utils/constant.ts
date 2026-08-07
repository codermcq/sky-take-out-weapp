/**
 * 全局业务常量
 */

/** 商家电话（TODO: 替换为真实电话，拨打弹框与下单页「致电商家」共用） */
export const SHOP_PHONE = '400-8888-8888'

/** 每份打包费（元），原型固定 1 元 */
export const PACK_AMOUNT_PER_ITEM = 1

/** 固定配送费（元），原型固定 6 元 */
export const DELIVERY_FEE = 6

/** 餐具可选最大份数 */
export const TABLEWARE_MAX = 10

/** 预计送达默认顺延小时数 */
export const DELIVERY_DELAY_HOURS = 1

/** 支付超时（分钟），原型 15 分钟 */
export const PAY_TIMEOUT_MINUTES = 15

/** 订单默认备注（原型默认文案） */
export const DEFAULT_REMARK = '推荐无接触配送'

/** 下单页选地址临时通道 */
export const STORAGE_SELECTED_ADDRESS = 'selectedAddress'

/** 订单备注页临时通道 */
export const STORAGE_ORDER_REMARK = 'orderRemark'
