/** 分页查询结果 */
export interface PageResult<T> {
  total: number
  records: T[]
}

/** 分页查询参数 */
export interface PageQuery {
  page: number
  pageSize: number
}
