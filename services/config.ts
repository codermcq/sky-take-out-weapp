/**
 * 网络层配置：双环境 baseURL + 登录态相关常量
 */

/** 开发环境后端地址（微信开发者工具需勾选「不校验合法域名」） */
export const DEV_BASE_URL = 'http://127.0.0.1:8080'

/** 生产环境后端地址（上线前替换为你的域名，并配置到小程序后台 request 合法域名） */
export const PROD_BASE_URL = 'https://api.example.com'

/**
 * 自动区分环境：release 用生产地址，develop/trial 用开发地址
 */
const accountInfo = wx.getAccountInfoSync()
const envVersion = accountInfo.miniProgram.envVersion

export const BASE_URL = envVersion === 'release' ? PROD_BASE_URL : DEV_BASE_URL

/** 登录 token 在 storage 中的 key（header 名同为 token，与后端约定一致） */
export const TOKEN_KEY = 'token'

/** 登录页路径 */
export const LOGIN_PAGE_PATH = '/pages/login/index'

/**
 * 未登录识别兜底：
 * 后端可任选其一 —— 返回 HTTP 401，或 Result.code=0 且 msg 含以下关键字。
 */
export const UN_LOGIN_CODE = -1 // 预留：若后端用专门 code 表示未登录，改这里
export const NOT_LOGIN_MSGS = ['未登录', '登录失效', 'NOT_LOGIN', 'Token']
