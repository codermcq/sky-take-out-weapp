/**
 * 后端统一返回结果
 * code: 1 成功，0 或其他数字失败
 */
export interface Result<T> {
  code: number
  msg: string
  data: T
}

/** 语义化别名 */
export type ApiResponse<T> = Result<T>
