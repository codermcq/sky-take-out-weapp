/**
 * 购物车 store（纯前端本地维护，不调后端接口）
 * 同菜品不同口味为独立行；countMap 按 dishId/setmealId 求和，驱动首页 stepper。
 */
import { HYEventStore } from 'hy-event-store'
import { ShoppingCartItem } from '../types/shoppingCart'

let _nextId = Date.now()

/** 生成本地唯一 id */
function uid(): number {
  return _nextId++
}

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
    /** 初始化：重置为空（不再从后端拉取） */
    fetchCartAction(ctx: any) {
      recompute(ctx)
    },

    /**
     * 加购。
     * data: { dishId?/setmealId?, name, image, amount(单价), dishFlavor?, number }
     */
    addAction(ctx: any, data: { dishId?: number; setmealId?: number; name: string; image: string; amount: number; dishFlavor?: string; number?: number }) {
      const num = data.number ?? 1
      const key = String(data.dishId ?? data.setmealId ?? '')
      // 同菜品同口味→数量累加
      const exist = (ctx.cartList || []).find(
        (i: ShoppingCartItem) =>
          String(i.dishId ?? i.setmealId ?? '') === key &&
          (i.dishFlavor || '') === (data.dishFlavor || '')
      )
      if (exist) {
        exist.number += num
      } else {
        ctx.cartList = [
          ...(ctx.cartList || []),
          {
            id: uid(),
            dishId: data.dishId,
            setmealId: data.setmealId,
            name: data.name,
            image: data.image,
            amount: data.amount,
            dishFlavor: data.dishFlavor || '',
            number: num,
          },
        ]
      }
      recompute(ctx)
    },

    /**
     * 减购：匹配同菜品同口味的行，数量减 1；减到 0 则删除。
     * data: { dishId?/setmealId?, dishFlavor? }
     */
    subAction(ctx: any, data: { dishId?: number; setmealId?: number; dishFlavor?: string }) {
      const key = String(data.dishId ?? data.setmealId ?? '')
      const idx = (ctx.cartList || []).findIndex(
        (i: ShoppingCartItem) =>
          String(i.dishId ?? i.setmealId ?? '') === key &&
          (i.dishFlavor || '') === (data.dishFlavor || '')
      )
      if (idx !== -1) {
        const item = ctx.cartList[idx]
        item.number -= 1
        if (item.number <= 0) {
          ctx.cartList = ctx.cartList.filter((_: any, i: number) => i !== idx)
        }
      }
      recompute(ctx)
    },

    /** 删除单条 */
    removeItemAction(ctx: any, id: number) {
      ctx.cartList = (ctx.cartList || []).filter((i: ShoppingCartItem) => i.id !== id)
      recompute(ctx)
    },

    /** 清空 */
    cleanAction(ctx: any) {
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
