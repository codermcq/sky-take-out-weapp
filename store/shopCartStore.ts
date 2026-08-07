/**
 * 购物车 store（调用后端接口维护）
 * 同菜品不同口味为独立行；countMap 驱动首页 stepper。
 */
import { HYEventStore } from 'hy-event-store'
import { ShoppingCartItem } from '../types/shoppingCart'
import { getCartList, addCart, subCart, cleanCart } from '../services/shoppingCart'

/** 重算派生值 */
function recompute(ctx: any) {
  const list: ShoppingCartItem[] = ctx.cartList || []

  // countMap：按 dishId / setmealId 合并求和
  const countMap: Record<string, number> = {}
  for (const item of list) {
    const key = String(item.dishId ?? item.setmealId ?? '')
    if (key) countMap[key] = (countMap[key] || 0) + item.number
  }
  ctx.countMap = countMap

  // 同步 selectedIds（清除已不存在的行）
  const existingIds = new Set(list.map((i) => i.id))
  ctx.selectedIds = (ctx.selectedIds || []).filter((id: number) => existingIds.has(id))
  // 默认全选
  if (existingIds.size && !ctx.selectedIds.length) ctx.selectedIds = [...existingIds]
  ctx.allSelected = list.length > 0 && ctx.selectedIds.length === list.length

  // 选中行合计
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

  // 全部合计
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
    totalPrice: 0,
    totalCount: 0,
    totalAllPrice: 0,
    allCount: 0,
  },
  actions: {
    /** 从后端拉取购物车 */
    async fetchCartAction(ctx: any) {
      try {
        const list = await getCartList()
        ctx.cartList = list || []
      } catch {
        ctx.cartList = []
      }
      recompute(ctx)
    },

    /**
     * 加购 → 调用后端接口，然后刷新购物车列表
     * data: { dishId?, setmealId?, dishFlavor? }
     */
    async addAction(ctx: any, data: { dishId?: number; setmealId?: number; dishFlavor?: string }) {
      try {
        await addCart({
          dishId: data.dishId,
          setmealId: data.setmealId,
          dishFlavor: data.dishFlavor,
          number: 1,
        })
        const list = await getCartList()
        ctx.cartList = list || []
      } catch {
        // 失败不更新
      }
      recompute(ctx)
    },

    /**
     * 减购 → 调用后端接口，然后刷新购物车列表
     * data: { dishId?, setmealId?, dishFlavor? }
     */
    async subAction(ctx: any, data: { dishId?: number; setmealId?: number; dishFlavor?: string }) {
      try {
        await subCart({
          dishId: data.dishId,
          setmealId: data.setmealId,
          dishFlavor: data.dishFlavor,
        })
        const list = await getCartList()
        ctx.cartList = list || []
      } catch {
        // 失败不更新
      }
      recompute(ctx)
    },

    /** 清空购物车 */
    async cleanAction(ctx: any) {
      try {
        await cleanCart()
      } catch {
        // 失败也清空本地
      }
      ctx.cartList = []
      recompute(ctx)
    },

    /** 勾选/取消勾选 */
    toggleSelectAction(ctx: any, id: number) {
      ctx.selectedIds = ctx.selectedIds.includes(id)
        ? ctx.selectedIds.filter((i: number) => i !== id)
        : [...(ctx.selectedIds || []), id]
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
