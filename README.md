# 苏城e教 (sucheng-ejia)

微信小程序家教智能匹配平台，基于微信云开发（CloudBase）。

家长发布需求，大学生（家教）注册接单，平台按 **科目 50% + 区域 30% + 年级 20% + 距离加分** 的权重推荐匹配家教。

## 目录结构

| 目录 | 说明 |
| --- | --- |
| `miniprogram/` | 小程序前端（WXML / WXSS / JS），页面：登录、注册、首页推荐、详情、发布、我的、评价、认证 |
| `cloudfunctions/` | 云函数（Node.js + wx-server-sdk）：`initDB` `login` `matchTutors` `publishRequirement` `updateUserProfile` `submitVerification` `getVerificationStatus` `createReview` `getReviewList` |
| `docs/` | PRD、用户故事、冲刺计划、数据模型设计、代码审查清单 |
| `config/` | 团队工作流配置 |
| `tuge-ai/` | 子项目：Cloudflare Workers API + React/Vite 前端（pnpm workspace） |

## 环境信息

- AppID：`wxbf4c610faa456200`
- 云环境 ID：`cloud1-d1gjvyjay739ff1e8`

> ⚠️ 私有仓库，请勿公开传播。

## 本地开发

1. 用微信开发者工具打开项目根目录
2. 上传 `cloudfunctions/` 下的云函数到云端
3. 登录页点击“初始化演示数据”写入示例数据
4. 注册后体验匹配流程

## 注意事项

- WXML 模板中不能调用 JS 方法（如 `.toFixed()`、`.indexOf()`），需在 JS 中预处理后传入 `data`
- 用户状态通过 `wx.setStorageSync` / `wx.getStorageSync` 持久化（`userRole`、`userId`、`userData`）
- 云函数修改后需在微信开发者工具中右键「上传并部署」才会生效

## 技术约定

- 主色调 `#2B8CFF`，全局样式在 `app.wxss`，Flex 布局适配
- 提交信息遵循 Conventional Commits（见 `.gitmessage`）

详细的开发指引见 [CLAUDE.md](CLAUDE.md)。
