# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

苏城e教 - 微信小程序家教智能匹配平台（WeChat Mini Program），使用微信云开发（CloudBase）。家长找家教、大学生找兼职的双角色匹配系统。

## Architecture

- **miniprogram/** - 前端小程序代码（WXML/WXSS/JS）
- **cloudfunctions/** - 云函数（Node.js + wx-server-sdk）
  - `initDB` - 初始化数据库集合及示例数据（Users, Requirements, Tutor_Profiles, Reviews）
  - `matchTutors` - 智能匹配算法（科目50% + 区域30% + 年级20% + 距离加分）

## Cloud Environment

- AppID: `wxbf4c610faa456200`
- 云环境ID: `cloud1-d1gjvyjay739ff1e8`

## Page Flow

login → register（选身份：大学生/家长，填资料）→ index（TabBar首页，推荐匹配列表）→ detail（详情+模拟付费联系）
profile（TabBar我的：认证、评价记录、会员中心）

## Key Patterns

- WXML 模板中**不能**调用 JS 方法（如 `.toFixed()`, `.indexOf()`），需在 JS 中预处理后传给 data
- 用户状态通过 `wx.setStorageSync` / `wx.getStorageSync` 持久化（userRole, userId, userData）
- 云函数修改后需在微信开发者工具中右键**上传并部署**才能生效
- 云函数依赖需要 `npm install wx-server-sdk`，可本地安装后选"上传并部署：所有文件"

## Development

1. 用微信开发者工具打开项目根目录
2. 上传两个云函数到云端
3. 点击登录页"初始化演示数据"写入示例数据
4. 注册后体验匹配流程

## Style

主色调 `#2B8CFF`（蓝色），全局样式在 `app.wxss`，Flex 布局适配。

---

## 🤝 团队开发工作流

**配置文件位置**：`config/团队工作流.md`

### 角色分工
- **产品负责人**：需求分析、PRD编写、优先级排序
- **项目经理**：项目规划、进度跟踪、风险管理
- **Scrum Master**：敏捷流程、冲刺管理、团队协调
- **代码项目经理**：代码审查、质量门禁

### 文档目录
- `docs/prd/` - 产品需求文档
- `docs/plans/` - 项目计划和进度跟踪
- `docs/sprints/` - 冲刺计划和回顾
- `docs/meetings/` - 会议记录
- `docs/reviews/` - 评审报告

### 可用Claude Skills
- `agile-product-owner` - 用户故事生成、冲刺规划
- `scrum-master` - 敏捷仪式、速度预测、回顾分析
- `senior-pm` - 项目组合健康度、风险分析
- `product-manager-toolkit` - RICE优先级排序

### Skill调用示例
```
"作为产品负责人，帮我编写家教匹配功能的用户故事"
"作为Scrum Master，帮我规划Sprint 1的任务分解"
"审查这段小程序代码是否符合最佳实践"
```
