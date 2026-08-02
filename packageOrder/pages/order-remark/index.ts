/** 订单备注页：编辑备注（默认文案，50 字上限） */
import { DEFAULT_REMARK, STORAGE_ORDER_REMARK } from '../../../utils/constant'

const MAX_LEN = 50

Page({
  data: {
    remark: DEFAULT_REMARK,
    maxLen: MAX_LEN,
  },

  onLoad() {
    const remark = wx.getStorageSync(STORAGE_ORDER_REMARK)
    if (remark !== '') {
      this.setData({ remark })
    }
  },

  onRemarkInput(e: WechatMiniprogram.Input) {
    let value = e.detail.value
    if (value.length > MAX_LEN) value = value.slice(0, MAX_LEN)
    this.setData({ remark: value })
  },

  onClear() {
    this.setData({ remark: '' })
  },

  onDone() {
    wx.setStorageSync(STORAGE_ORDER_REMARK, this.data.remark)
    wx.navigateBack()
  },
})
