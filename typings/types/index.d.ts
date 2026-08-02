/// <reference types="miniprogram-api-typings" />

/**
 * 全局 App 类型
 */
interface IAppOption {
  globalData: {
    screenWidth: number
    screenHeight: number
    statusBarHeight: number
    navigationBarHeight: number
    contentHeight: number
  }
}

/**
 * hy-event-store 类型兜底（1.3.x 未自带完整 d.ts）
 */
declare module 'hy-event-store' {
  export class HYEventStore {
    constructor(options: {
      state: Record<string, any>
      actions: Record<string, (...args: any[]) => any>
    })
    state: Record<string, any>
    onState(key: string, callback: (value: any) => void): void
    onStates(keys: string[], callback: (value: any) => void): void
    offState(key: string, callback: (value: any) => void): void
    offStates(keys: string[], callback: (value: any) => void): void
    dispatch(actionName: string, ...args: any[]): any
    setState(key: string, value: any): void
  }
}
