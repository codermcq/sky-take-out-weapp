/** 搜索页：预拉全部菜品 → 本地关键词过滤（后端无搜索接口） */
import { getCategoryList } from '../../../services/category'
import { getDishList } from '../../../services/dish'
import shopCartStore from '../../../store/shopCartStore'
import { ensureLogin } from '../../../utils/auth'
import { Dish } from '../../../types/dish'

Page({
  data: {
    keyword: '',
    allDishes: [] as Dish[],
    results: [] as Dish[],
    loaded: false,
  },

  onLoad() {
    this.preload()
  },

  preload() {
    getCategoryList(1)
      .then((cats) => {
        const requests = (cats || []).map((cat) =>
          getDishList(cat.id).catch(() => [] as Dish[])
        )
        return Promise.all(requests)
      })
      .then((lists) => {
        const allDishes = (lists || []).flat() as Dish[]
        this.setData({ allDishes, results: allDishes, loaded: true })
      })
      .catch(() => this.setData({ loaded: true }))
  },

  onInput(e: WechatMiniprogram.Input) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })
    if (!keyword) {
      this.setData({ results: this.data.allDishes })
      return
    }
    const kw = keyword.toLowerCase()
    const results = this.data.allDishes.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        (d.description || '').toLowerCase().includes(kw)
    )
    this.setData({ results })
  },

  onClear() {
    this.setData({ keyword: '', results: this.data.allDishes })
  },

  async onAdd(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    const dish = this.data.allDishes.find((d) => d.id === id)
    if (!dish) return
    if (dish.flavor && dish.flavor.length) {
      wx.showToast({ title: '该菜品有规格，请到首页选择', icon: 'none' })
      return
    }
    const ok = await ensureLogin()
    if (!ok) return
    try {
      await shopCartStore.dispatch('addAction', { dishId: dish.id, number: 1 })
      wx.showToast({ title: '已加入购物车', icon: 'success' })
    } catch {
      /* 错误已提示 */
    }
  },
})
