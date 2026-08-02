/**
 * 购物车 store
 * 同菜品不同口味在购物车中是独立行；countMap 按 dishId/setmealId 求和，驱动首页 stepper。
 * 每次服务端操作后整表刷新并重算派生值（保证与后端一致）。
 */
import { HYEventStore } from 'hy-event-store'
import {
  getCartList,
  addCart,
  subCart,
  cleanCart,
  deleteCartItem,
} from '../services/shoppingCart'
import { ShoppingCartItem } from '../types/shoppingCart'

/** 重算派生值：countMap / selectedIds / 合计 */
function recompute(ctx: any) {
  const list: ShoppingCartItem[] = ctx.cartList || []

  // countMap：按 dishId 或 setmealId 求和（跨口味）
  const countMap: Record<string, number> = {}
  for (const item of list) {
    const key = String(item.dishId ?? item.setmealId ?? '')
    if (key) countMap[key] = (countMap[key] || 0) + item.number
  }
  ctx.countMap = countMap

  // 过滤掉已不存在的选中行；新拉取时默认全选
  const existingIds = list.map((i) => i.id)
  const prevSelected = (ctx.selectedIds || []).filter((id: number) => existingIds.includes(id))
  ctx.selectedIds = prevSelected.length || !existingIds.length ? prevSelected : existingIds
  ctx.allSelected = list.length > 0 && ctx.selectedIds.length === list.length

  // 选中行合计（购物车页结算用）
  let totalPrice = 0
  let totalCount = 0
  for (const item of list) {
    if (ctx.selectedIds.includes(item.id)) {
      totalPrice += item.amount * item.number
      totalCount += item.number
    }
  }
  ctx.totalPrice = Math.round(totalPrice * 100) / 100
  ctx.totalCount = totalCount

  // 全部商品合计（首页购物车栏/角标用）
  let allPrice = 0
  let allCount = 0
  for (const item of list) {
    allPrice += item.amount * item.number
    allCount += item.number
  }
  ctx.totalAllPrice = Math.round(allPrice * 100) / 100
  ctx.allCount = allCount
}

const shopCartStore = new HYEventStore({
  state: {
    cartList: [] as ShoppingCartItem[],
    countMap: {} as Record<string, number>,
    selectedIds: [] as number[],
    allSelected: true,
    /** 选中行合计金额（元） */
    totalPrice: 0,
    /** 选中行总数量 */
    totalCount: 0,
    /** 全部商品合计金额（元） */
    totalAllPrice: 0,
    /** 全部商品数量（tabBar 角标） */
    allCount: 0,
    loaded: false,
  },
  actions: {
    /** 拉取购物车（未登录时返回空） */
    fetchCartAction(ctx: any) {
      return getCartList()
        .then((list) => {
          ctx.cartList = list || []
          ctx.loaded = true
          recompute(ctx)
        })
        .catch(() => {
          ctx.cartList = []
          ctx.loaded = true
          recompute(ctx)
        })
    },
    /** 加购（含口味） */
    addAction(ctx: any, data: { dishId?: number; setmealId?: number; dishFlavor?: string; number: number }) {
      return addCart(data).then(() => {
        return getCartList().then((list) => {
          ctx.cartList = list || []
          recompute(ctx)
        })
      })
    },
    /** 减购 */
    subAction(ctx: any, data: { dishId?: number; setmealId?: number; dishFlavor?: string; number?: number }) {
      return subCart(data).then(() => {
        return getCartList().then((list) => {
          ctx.cartList = list || []
          recompute(ctx)
        })
      })
    },
    /** 删除单条 */
    removeItemAction(ctx: any, id: number) {
      return deleteCartItem(id).then(() => {
        ctx.cartList = ctx.cartList.filter((i: ShoppingCartItem) => i.id !== id)
        recompute(ctx)
      })
    },
    /** 清空 */
    cleanAction(ctx: any) {
      return cleanCart().then(() => {
        ctx.cartList = []
        recompute(ctx)
      })
    },
    /** 勾选/取消勾选某行 */
    toggleSelectAction(ctx: any, id: number) {
      const selectedIds = ctx.selectedIds.includes(id)
        ? ctx.selectedIds.filter((i: number) => i !== id)
        : [...ctx.selectedIds, id]
      ctx.selectedIds = selectedIds
      recompute(ctx)
    },
    /** 全选/全不选 */
    toggleSelectAllAction(ctx: any, value: boolean) {
      ctx.selectedIds = value ? (ctx.cartList || []).map((i: ShoppingCartItem) => i.id) : []
      recompute(ctx)
    },
  },
})

export default shopCartStore
