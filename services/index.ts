/**
 * 网络请求封装：仿 mq_music 的 mqRequest 类
 * 在参考项目基础上增强：
 *  1. 自动解析 {code, msg, data} 响应（code===1 → resolve data，否则 toast + reject）
 *  2. 自动注入登录 token 到 header
 *  3. HTTP 401 / code 表示未登录 → 清 token + 跳登录页
 */
import { BASE_URL, TOKEN_KEY, LOGIN_PAGE_PATH, UN_LOGIN_CODE, NOT_LOGIN_MSGS } from './config'
import { Result } from '../types/result'

type RequestOption = WechatMiniprogram.RequestOption

interface MqRequestOptions extends Partial<Omit<RequestOption, 'url' | 'success' | 'fail' | 'complete'>> {
  url: string
  /** 是否展示错误 toast，默认 true */
  showError?: boolean
}

class MqRequest {
  baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  request<T>(options: MqRequestOptions): Promise<T> {
    const { url, showError = true, header, ...rest } = options
    const token = wx.getStorageSync(TOKEN_KEY)
    const mergedHeader: Record<string, string> = {}
    if (token) mergedHeader[TOKEN_KEY] = token
    if (header) {
      for (const key in header) {
        mergedHeader[key] = header[key]
      }
    }

    return new Promise<T>((resolve, reject) => {
      wx.request({
        ...rest,
        url: this.baseURL + url,
        header: mergedHeader,
        success: (res) => {
          const body = res.data as Result<T> | undefined

          // 未登录识别：HTTP 401 或 code 命中或 msg 含关键字
          const isUnLogin =
            res.statusCode === 401 ||
            (body !== undefined && body !== null && body.code === UN_LOGIN_CODE) ||
            (body !== undefined && body !== null && NOT_LOGIN_MSGS.some((m) => (body.msg || '').includes(m)))

          if (isUnLogin) {
            wx.removeStorageSync(TOKEN_KEY)
            if (showError) wx.showToast({ title: body?.msg || '请先登录', icon: 'none' })
            // 不在登录页才跳转，避免重复
            const pages = getCurrentPages()
            const current = pages[pages.length - 1]
            if (!current || current.route !== 'pages/login/index') {
              wx.navigateTo({ url: LOGIN_PAGE_PATH })
            }
            reject(body?.msg || '未登录')
            return
          }

          // 业务成功：code === 1 → resolve(data)
          if (body && body.code === 1) {
            resolve(body.data)
            return
          }

          // 业务失败：toast + reject
          if (showError) {
            wx.showToast({ title: body?.msg || '请求失败', icon: 'none' })
          }
          reject(body?.msg || '请求失败')
        },
        fail: (err) => {
          if (showError) wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
          reject(err)
        },
      })
    })
  }

  get<T>(options: MqRequestOptions) {
    return this.request<T>({ ...options, method: 'GET' })
  }

  post<T>(options: MqRequestOptions) {
    return this.request<T>({ ...options, method: 'POST' })
  }

  put<T>(options: MqRequestOptions) {
    return this.request<T>({ ...options, method: 'PUT' })
  }

  delete<T>(options: MqRequestOptions) {
    return this.request<T>({ ...options, method: 'DELETE' })
  }
}

export const mqRequest = new MqRequest(BASE_URL)

/**
 * 文件上传：使用 wx.uploadFile，携带 token，返回服务器 URL
 */
export function mqUpload(filePath: string, url: string): Promise<string> {
  const token = wx.getStorageSync(TOKEN_KEY)
  const header: Record<string, string> = {}
  if (token) header[TOKEN_KEY] = token

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + url,
      filePath,
      name: 'file',
      header,
      success(res) {
        try {
          const body = JSON.parse(res.data)
          if (body.code === 1) {
            resolve(body.data as string)
          } else {
            wx.showToast({ title: body.msg || '上传失败', icon: 'none' })
            reject(body.msg || '上传失败')
          }
        } catch {
          reject('解析响应失败')
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      },
    })
  })
}
