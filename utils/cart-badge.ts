/** tabBar 购物车角标同步（index=1 是购物车 tab） */
const CART_TAB_INDEX = 1

export function syncBadge(count: number) {
  if (!count || count <= 0) {
    wx.removeTabBarBadge({ index: CART_TAB_INDEX })
  } else {
    wx.setTabBarBadge({ index: CART_TAB_INDEX, text: String(count) })
  }
}

export function removeBadge() {
  wx.removeTabBarBadge({ index: CART_TAB_INDEX })
}
