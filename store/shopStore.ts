/** 店铺营业状态 store */
import { HYEventStore } from 'hy-event-store'
import { getShopStatus } from '../services/shop'

const shopStore = new HYEventStore({
  state: {
    /** 1 营业中，0 打烊中 */
    status: 1,
    loaded: false,
  },
  actions: {
    /** 拉取营业状态 */
    fetchStatusAction(ctx: any) {
      return getShopStatus().then((status) => {
        ctx.status = status === 0 ? 0 : 1
        ctx.loaded = true
        return status
      })
    },
  },
})

export default shopStore
