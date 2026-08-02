/**
 * 配送时间选择弹窗
 * 周期：今天/明天；时段 9:00-23:00（整点）
 * 默认选择：下单时间后延 1 小时的最近档位
 * 输出：estimatedDeliveryTime + deliveryStatus（0 立即送 / 1 预约送）
 */
function pad2(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

Component({
  properties: {
    show: { type: Boolean, value: false },
  },
  data: {
    dates: [] as { label: string; value: string }[],
    slots: [] as string[],
    selectedDate: '',
    selectedSlot: '',
    activeDateIndex: 0,
    activeSlotIndex: 0,
  },
  observers: {
    show(show: boolean) {
      if (show) this.buildSlots()
    },
  },
  methods: {
    buildSlots() {
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const tomorrowStr = `${tomorrow.getFullYear()}-${pad2(tomorrow.getMonth() + 1)}-${pad2(tomorrow.getDate())}`
      const dates = [
        { label: '今天', value: todayStr },
        { label: '明天', value: tomorrowStr },
      ]

      const nowMin = now.getHours() * 60 + now.getMinutes()
      const slots: string[] = []
      for (let h = 9; h <= 23; h++) {
        const t = `${pad2(h)}:00`
        // 今天只保留晚于当前时间 10 分钟的档位
        if (h * 60 > nowMin + 10) slots.push(t)
      }
      // 默认目标 = 现在 + 1h
      const target = new Date(now.getTime() + 60 * 60 * 1000)
      const targetMin = target.getHours() * 60 + target.getMinutes()

      // 找今天第一个 >= target 的档位；没有则取今天最后一个可用
      let activeSlotIndex = 0
      for (let i = 0; i < slots.length; i++) {
        const [hh, mm] = slots[i].split(':').map(Number)
        if (hh * 60 + mm >= targetMin) {
          activeSlotIndex = i
          break
        }
        activeSlotIndex = i
      }
      if (!slots.length) {
        // 今天无可用档位（已过 23 点）→ 切到明天
        this.setData({ dates, slots, activeDateIndex: 1, activeSlotIndex: 0, selectedDate: tomorrowStr, selectedSlot: '09:00' })
        return
      }
      const activeDateIndex = 0
      this.setData({
        dates,
        slots,
        activeDateIndex,
        activeSlotIndex,
        selectedDate: dates[activeDateIndex].value,
        selectedSlot: slots[activeSlotIndex],
      })
    },
    onSelectDate(e: WechatMiniprogram.CustomEvent) {
      const index = Number(e.currentTarget.dataset.index)
      const date = this.data.dates[index]
      const isToday = index === 0
      if (!isToday) {
        const allSlots: string[] = []
        for (let h = 9; h <= 23; h++) allSlots.push(`${pad2(h)}:00`)
        this.setData({ activeDateIndex: index, slots: allSlots, activeSlotIndex: 0, selectedDate: date.value, selectedSlot: allSlots[0] })
      } else {
        this.buildSlots()
        this.setData({ activeDateIndex: 0 })
      }
    },
    onSelectSlot(e: WechatMiniprogram.CustomEvent) {
      const index = Number(e.currentTarget.dataset.index)
      this.setData({ activeSlotIndex: index, selectedSlot: this.data.slots[index] })
    },
    onConfirm() {
      const time = `${this.data.selectedDate} ${this.data.selectedSlot}`
      // 最早可用档位视为立即送，其余为预约送
      const deliveryStatus = this.data.activeSlotIndex === 0 ? 0 : 1
      this.triggerEvent('confirm', { time, deliveryStatus })
      this.triggerEvent('close')
    },
    onClose() {
      this.triggerEvent('close')
    },
    onNoop() {
      /* 阻止冒泡 */
    },
  },
})
