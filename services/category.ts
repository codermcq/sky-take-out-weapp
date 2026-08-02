/** 分类相关接口 */
import { mqRequest } from './index'
import { Category } from '../types/category'

/**
 * 查询分类列表
 * @param type 1 菜品分类，2 套餐分类
 */
export function getCategoryList(type: number) {
  return mqRequest.get<Category[]>({
    url: '/user/category/list',
    data: { type },
  })
}
