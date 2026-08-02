/** 套餐详情：展示套餐内菜品，加入购物车 */
import { getSetmealDishList } from '../../services/setmeal'
import shopCartStore from '../../store/shopCartStore'
import { ensureLogin } from '../../utils/auth'
import { SetmealDish } from '../../types/setmeal'

Page({
  data: {
    setmealId: 0,
    setmeal: {} as any,
    dishes: [] as SetmealDish[],
    loading: true,
    adding: false,
  },

  onLoad(query: Record<string, string>) {
    const setmealId = Number(query.id || 0)
    this.setData({
      setmealId,
      setmeal: {
        id: setmealId,
        name: decodeURIComponent(query.name || '套餐'),
        price: Number(query.price || 0),
        image: query.image || '',
      },
    })
    this.loadDetail()
  },

  loadDetail() {
    this.setData({ loading: true })
    getSetmealDishList(this.data.setmealId)
      .then((dishes) => this.setData({ dishes: dishes || [] }))
      .catch(() => this.setData({ dishes: [] }))
      .finally(() => this.setData({ loading: false }))
  },

  async onAdd() {
    if (this.data.adding) return
    const ok = await ensureLogin()
    if (!ok) return
    this.setData({ adding: true })
    const d = this.data.setmeal
    shopCartStore.dispatch('addAction', {
      setmealId: d.id,
      name: d.name,
      image: d.image,
      amount: d.price,
      number: 1,
    })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
    this.setData({ adding: false })
  },

  onGoHome() {
    wx.reLaunch({ url: '/pages/home/index' })
  },
})
