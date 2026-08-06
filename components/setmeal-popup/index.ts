/**
 * 套餐详情弹窗：居中显示，菜品左右滑动
 */
import { getSetmealDishList } from '../../services/setmeal'

Component({
  properties: {
    show: { type: Boolean, value: false },
    setmeal: { type: Object, value: {} },
  },
  data: {
    dishes: [] as any[],
    loading: false,
  },
  observers: {
    'show, setmeal'(show: boolean, setmeal: any) {
      if (show && setmeal && setmeal.id) {
        this.loadDishes(setmeal.id)
      }
    },
  },
  methods: {
    loadDishes(setmealId: number) {
      this.setData({ loading: true, dishes: [] })
      getSetmealDishList(setmealId)
        .then((dishes) => this.setData({ dishes: dishes || [] }))
        .catch(() => this.setData({ dishes: [] }))
        .finally(() => this.setData({ loading: false }))
    },
    onClose() {
      this.triggerEvent('close')
    },
    onAdd() {
      this.triggerEvent('add', { setmeal: this.data.setmeal })
    },
  },
})
