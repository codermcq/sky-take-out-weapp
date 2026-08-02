# 苍穹外卖小程序用户端（sky-takeout-weapp）

原生微信小程序 + TypeScript + Vant Weapp + hy-event-store 实现的「苍穹外卖」用户端点餐闭环。

## 功能

首页为唯一入口（无 tabBar），进入后可完成点餐到下单的完整闭环：

- **首页**：分类点餐（无商品分类自动隐藏）、有规格菜品弹窗选口味、无规格菜品步进加减、商品详情弹窗、购物车弹窗、拨打商家电话、休息中整页禁用
- **确认订单**：收货地址、配送时间（9:00-23:00 / 今天·明天）、餐具数量、备注独立页、费用明细（打包费1元/份 + 配送费6元）
- **支付**：15 分钟倒计时 + 模拟支付 + 下单成功页（预计送达 = 下单+1h）
- **订单**：历史订单（全部/待付款/退款 三 tab + 分页）、订单详情按状态渲染操作（催单/取消/退款/再来一单）
- **地址**：省市区三级联动选择、标签（公司/家/学校）、默认地址
- **套餐详情**：套餐内菜品明细 + 加入购物车
- **进入即自动登录**：启动时静默 `wx.login` 拿 code → 调后端 `/user/user/login` 换 token（header `authentication`）；失败时可浏览，需登录操作时引导登录页重试

## 技术栈

| 项 | 选型 |
|---|---|
| 框架 | 原生微信小程序 + TypeScript（`useCompilerPlugins: ["typescript"]`） |
| UI | Vant Weapp `@vant/weapp` |
| 状态 | `hy-event-store` |
| 分包 | packageOrder / packageAddress |

## 网络层

仿 `02_mq_music` 的三层结构（`services/config.ts` → `services/index.ts` 的 `mqRequest` 类 → 业务模块），增强：
- 自动解析 `{code, msg, data}`（code===1 成功）
- 自动注入 `authentication` header（登录 token）
- HTTP 401 / 未登录 → 清 token 跳登录页

## 运行步骤

1. `npm install`
2. 微信开发者工具 → 导入项目 → 选择本目录 → AppID 用你的或测试号
3. 工具提示启用 TypeScript 编译时选「启用」
4. 「详情 → 本地设置」勾选 **不校验合法域名**（开发期访问 `http://127.0.0.1:8080`）
5. 「工具 → 构建 npm」生成 `miniprogram_npm`
6. 启动后端后，首页应能拉到分类/菜品

> 后端接口契约见 [`docs/接口契约.md`](docs/接口契约.md)，按它实现你的 Spring Boot 后端。

## 待办配置

- `services/config.ts`：上线前替换 `PROD_BASE_URL`，并在小程序后台配置 request 合法域名
- `utils/constant.ts`：替换 `SHOP_PHONE` 为真实商家电话
- `project.config.json`：确认 appid
