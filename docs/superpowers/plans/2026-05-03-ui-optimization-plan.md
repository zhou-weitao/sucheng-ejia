# UI 优化实施计划 v2.0

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将苏城e教微信小程序9个核心页面全面升级为玻璃拟态设计风格，统一 Design Tokens v2.0 视觉系统，提升用户体验和专业感。

**Architecture:** 自底向上实施：先全局 Tokens，再通用组件，最后分页面实施。每个任务独立可测试，完成后立即验收。

**Tech Stack:** 微信小程序原生 WXML/WXSS/JavaScript，CSS 变量系统，云函数

---

## Phase 1: 核心视觉系统（最高优先级）

---

### Task 1: Design Tokens v2.0 全局升级

**Files:**
- Modify: `miniprogram/app.wxss:1-230`

**Goal:** 建立完整的玻璃拟态设计令牌系统，替换原 v1.0 系统。

- [ ] **Step 1: 备份原 app.wxss 内容

```bash
# 复制当前 app.wxss 到备份文件
cp miniprogram/app.wxss miniprogram/app.wxss.v1.bak
```

- [ ] **Step 2: 替换颜色系统为 v2.0

```css
/* ============================================
   苏城e教 - 设计系统 Design Tokens v2.0
   ============================================ */

/* 🔷 颜色系统 - 统一变量 */
page {
  /* 品牌色 */
  --color-primary: #667eea;
  --color-primary-light: #8a9fff;
  --color-primary-dark: #5a67d8;
  --color-secondary: #764ba2;
  --color-gradient: linear-gradient(135deg, #667eea, #764ba2);

  /* 功能色 */
  --color-success: #10b981;
  --color-success-bg: rgba(16, 185, 129, 0.1);
  --color-warning: #f59e0b;
  --color-warning-bg: rgba(245, 158, 11, 0.1);
  --color-error: #ef4444;
  --color-error-bg: rgba(239, 68, 68, 0.1);

  /* 中性色 */
  --color-gray-900: #1a202c;
  --color-gray-700: #4a5568;
  --color-gray-500: #9ca3af;
  --color-gray-300: #e2e8f0;
  --color-gray-100: #f7f8fc;
  --color-white: #ffffff;

  /* 金色（评分专用） */
  --color-gold: #ffd700;
  --color-gold-light: #fff8e1;

  /* ✨ v2.0 新增: 背景系统升级 */
  --bg-primary: #f5f7fa;
  --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  --bg-card: rgba(255, 255, 255, 0.85);
  --bg-card-solid: #ffffff;
  --bg-card-blur: blur(20rpx);

  /* ✨ v2.0 新增: 边框系统 */
  --border-light: 1rpx solid rgba(255, 255, 255, 0.5);
  --border-gray: 1rpx solid rgba(0, 0, 0, 0.06);

  /* 间距系统 */
  --space-xs: 8rpx;
  --space-sm: 16rpx;
  --space-md: 24rpx;
  --space-lg: 32rpx;
  --space-xl: 40rpx;

  /* 圆角系统 */
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 20rpx;
  --radius-xl: 24rpx;
  --radius-2xl: 32rpx;
  --radius-full: 999rpx;

  /* ✨ v2.0 新增: 阴影系统 3 层次 */
  --shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8rpx 32rpx rgba(102, 126, 234, 0.1);
  --shadow-primary: 0 8rpx 32rpx rgba(102, 126, 234, 0.35);

  /* ✨ v2.0 新增: 动画曲线 */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-fast: 0.2s var(--ease-out);
  --animation-normal: 0.3s var(--ease-out);
  --animation-slow: 0.4s var(--ease-out);

  /* ✨ v2.0 新增: 点击热区 */
  --touch-min-size: 48rpx;

  /* ✨ v2.0 新增: 状态变换 */
  --state-hover: translateY(-2rpx);
  --state-active: translateY(2rpx);

  /* 全局样式 */
  background: var(--bg-gradient);
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--color-gray-900);
  padding-bottom: 120rpx;
  box-sizing: border-box;
}
```

- [ ] **Step 3: 更新通用组件样式 (v2.0 玻璃拟态版本)

```css
/* ============================================
   v2.0 玻璃拟态基础组件
   ============================================ */

.container {
  padding: var(--space-md);
  box-sizing: border-box;
}

/* 🔘 按钮系统 - v2.0 升级 */
.btn-primary {
  background: var(--color-gradient);
  color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: 28rpx 0;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  box-shadow: var(--shadow-primary);
  transition: all var(--animation-fast);
}

.btn-primary:active {
  opacity: 0.9;
  transform: var(--state-active);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.btn-primary[disabled] {
  opacity: 0.5;
  box-shadow: none;
}

.btn-ghost {
  background: var(--bg-card);
  color: var(--color-primary);
  border: 2rpx solid var(--color-primary);
  border-radius: var(--radius-xl);
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all var(--animation-fast);
}

.btn-ghost:active {
  background: var(--color-primary);
  color: var(--color-white);
}

/* 🃏 卡片系统 - v2.0 玻璃拟态 */
.card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border-radius: var(--radius-xl);
  border: var(--border-light);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-md);
  transition: all var(--animation-normal);
}

.card:active {
  transform: var(--state-hover);
  box-shadow: var(--shadow-lg);
}

/* 🏷️ 标签系统 */
.tag {
  display: inline-block;
  background: rgba(102, 126, 234, 0.1);
  color: var(--color-primary);
  font-size: 22rpx;
  font-weight: 500;
  padding: 8rpx 20rpx;
  border-radius: var(--radius-full);
  margin-right: 12rpx;
  margin-bottom: 8rpx;
}

.tag-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.tag-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.tag-error {
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* ⭐ 星级评分 */
.stars {
  color: var(--color-gold);
  font-size: 28rpx;
  letter-spacing: 2rpx;
}

/* 📝 标题系统 */
.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: var(--space-md);
  letter-spacing: 1rpx;
}

/* ➖ 分割线 */
.divider {
  height: 1rpx;
  background: var(--color-gray-300);
  margin: var(--space-md) 0;
}

/* ✅ 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: var(--radius-full);
  font-size: 24rpx;
  font-weight: 500;
}

.status-badge.pending {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.status-badge.success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.status-badge.error {
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* ============================================
   v2.0 新增组件: 玻璃拟态输入框
   ============================================ */

.glass-input {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: var(--color-gray-900);
  box-shadow: var(--shadow-sm);
  transition: all var(--animation-fast);
}

.glass-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1), var(--shadow-md);
}

/* ============================================
   常用工具类
   ============================================ */

.text-primary { color: var(--color-primary); }
.text-gray { color: var(--color-gray-500); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }

.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-col { display: flex; flex-direction: column; }

.mb-sm { margin-bottom: var(--space-sm); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }

.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }

/* ✨ v2.0 新增: 触摸热区扩展 */
.touch-target {
  min-width: var(--touch-min-size);
  min-height: var(--touch-min-size);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ✨ v2.0 新增: 淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp var(--animation-normal) ease-out forwards;
}
```

- [ ] **Step 4: 验证样式文件无语法错误

在微信开发者工具中检查 app.wxss 是否有语法错误，确认页面背景渐变正常显示。

- [ ] **Step 5: 提交

```bash
git add miniprogram/app.wxss
git commit -m "feat(ui): upgrade Design Tokens to v2.0 glass morphism"
```

---

### Task 2: 首页列表 - 搜索栏 + 筛选器优化

**Files:**
- Modify: `miniprogram/pages/index/index.wxss`
- Modify: `miniprogram/pages/index/index.wxml`

- [ ] **Step 1: 更新 index.wxss 样式 v2.0

```css
/* ============================================
   首页列表页面 - Design Tokens v2.0
   ============================================ */

.page-container {
  padding: var(--space-md);
  min-height: 100vh;
}

/* ✨ v2.0: 玻璃拟态搜索栏 */
.search-bar {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-2xl);
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--animation-fast);
}

.search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1), var(--shadow-md);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  color: var(--color-gray-500);
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-gray-900);
}

.search-input::placeholder {
  color: var(--color-gray-500);
}

/* ✨ v2.0: 胶囊筛选器 */
.filter-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: var(--space-lg);
  overflow-x: auto;
  padding-bottom: 8rpx;
}

.filter-item {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-gray);
  border-radius: var(--radius-full);
  padding: 16rpx 28rpx;
  font-size: 26rpx;
  color: var(--color-gray-700);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  transition: all var(--animation-fast);
}

.filter-item:active {
  transform: scale(0.96);
}

.filter-item.active {
  background: var(--color-gradient);
  color: var(--color-white);
  border-color: transparent;
  font-weight: 500;
  box-shadow: var(--shadow-primary);
}

/* ✨ v2.0: 玻璃拟态列表卡片 */
.tutor-card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-md);
  transition: all var(--animation-normal);
  position: relative;
}

.tutor-card:active {
  transform: var(--state-hover);
  box-shadow: var(--shadow-lg);
}

/* 匹配度角标 */
.match-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  background: var(--color-gradient);
  color: var(--color-white);
  font-size: 22rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: var(--radius-full);
}

.tutor-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

/* ✨ v2.0: 大尺寸渐变色头像 */
.tutor-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: var(--radius-xl);
  background: var(--color-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-white);
  margin-right: 20rpx;
  flex-shrink: 0;
}

.tutor-info {
  flex: 1;
  padding-right: 100rpx;
}

.tutor-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.tutor-name {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-right: 12rpx;
}

.verified-badge {
  background: var(--color-success-bg);
  color: var(--color-success);
  font-size: 20rpx;
  font-weight: 500;
  padding: 4rpx 12rpx;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.tutor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.tutor-tag {
  font-size: 24rpx;
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.tutor-rating-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tutor-rating {
  color: var(--color-gold);
  font-size: 24rpx;
}

.rating-count {
  font-size: 24rpx;
  color: var(--color-gray-500);
}

.tutor-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.tutor-location {
  font-size: 24rpx;
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.tutor-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-primary);
}

.tutor-price span {
  font-size: 24rpx;
  font-weight: 400;
  color: var(--color-gray-500);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  opacity: 0.3;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: var(--color-gray-500);
}

/* 列表淡入动画 */
.tutor-card:nth-child(1) { animation-delay: 0.05s; }
.tutor-card:nth-child(2) { animation-delay: 0.1s; }
.tutor-card:nth-child(3) { animation-delay: 0.15s; }
.tutor-card:nth-child(4) { animation-delay: 0.2s; }
.tutor-card:nth-child(5) { animation-delay: 0.25s; }
```

- [ ] **Step 2: 更新 index.wxml 模板结构

```xml
<view class="page-container">
  <!-- 玻璃拟态搜索栏 -->
  <view class="search-bar">
    <text class="search-icon">🔍</text>
    <input class="search-input" placeholder="搜索科目、大学、区域..." value="{{searchKeyword}}" bindinput="onSearchInput" confirm-type="search" bindconfirm="onSearch" />
  </view>

  <!-- 胶囊筛选器 -->
  <scroll-view class="filter-tabs" scroll-x="true" show-scrollbar="false">
    <view class="filter-item {{currentFilter === item.key ? 'active' : ''}}" wx:for="{{filterList}}" wx:key="key" data-key="{{item.key}}" bindtap="onFilterTap">
      {{item.name}}
    </view>
  </scroll-view>

  <!-- 家教列表 -->
  <view class="tutor-list">
    <view class="tutor-card fade-in-up" wx:for="{{tutorList}}" wx:key="_id" bindtap="goToDetail" data-id="{{item._id}}">
      <!-- 匹配度角标 -->
      <view class="match-badge" wx:if="{{item.matchRate}}">{{item.matchRate}}% 🎯</view>

      <view class="tutor-header">
        <view class="tutor-avatar">{{item.realName.charAt(0)}}</view>
        <view class="tutor-info">
          <view class="tutor-name-row">
            <text class="tutor-name">{{item.realName}}</text>
            <view class="verified-badge" wx:if="{{item.verified}}">✅ 已认证</view>
          </view>
          <view class="tutor-tags">
            <text class="tutor-tag">🏫 {{item.education || '本科'}}</text>
            <text class="tutor-tag">📚 {{item.subjects && item.subjects[0] || '数学'}}</text>
          </view>
          <view class="tutor-rating-row">
            <text class="tutor-rating">⭐⭐⭐⭐⭐</text>
            <text class="rating-count">({{item.reviewCount || 0}}条评价)</text>
          </view>
        </view>
      </view>

      <view class="tutor-bottom">
        <text class="tutor-location">📍 {{item.location || '姑苏区'}}</text>
        <text class="tutor-price">¥{{item.price || 100}}<text>/小时</text></text>
      </view>
    </view>
  </view>

  <!-- 空状态 -->
  <view class="empty-state" wx:if="{{tutorList.length === 0}}">
    <text class="empty-icon">📭</text>
    <text class="empty-title">暂无匹配结果</text>
    <text class="empty-desc">调整筛选条件试试</text>
  </view>
</view>
```

- [ ] **Step 3: 在微信开发者工具中预览效果

检查搜索栏玻璃拟态效果、筛选器选中状态、卡片点击动画、空状态显示

- [ ] **Step 4: 运行验证测试

测试：1) 搜索框聚焦边框高亮 2) 筛选器点击切换 3) 卡片点击跳转 4) 列表滚动流畅

- [ ] **Step 5: 提交

```bash
git add miniprogram/pages/index/index.wxml miniprogram/pages/index/index.wxss
git commit -m "feat(ui): optimize index page with glass morphism design"
```

---

### Task 3: 个人中心页面优化

**Files:**
- Modify: `miniprogram/pages/profile/profile.wxss`
- Modify: `miniprogram/pages/profile/profile.wxml`

- [ ] **Step 1: 更新 profile.wxss 样式

```css
/* ============================================
   个人中心页面 - Design Tokens v2.0
   ============================================ */

/* ✨ v2.0: 渐变头部区域 */
.profile-header {
  background: var(--color-gradient);
  padding: 60rpx var(--space-lg) 80rpx;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.profile-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-primary);
  margin-right: var(--space-lg);
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  z-index: 1;
}

.profile-info {
  flex: 1;
  z-index: 1;
}

.profile-name {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 8rpx;
}

.profile-role {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-white);
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: var(--radius-full);
  gap: 6rpx;
}

/* ✨ v2.0: 玻璃拟态数据统计卡片 */
.stats-card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  margin: -40rpx var(--space-md) var(--space-lg);
  padding: var(--space-lg);
  display: flex;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 2;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 var(--space-sm);
}

.stat-item:not(:last-child) {
  border-right: 1rpx solid rgba(0, 0, 0, 0.06);
}

.stat-number {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: var(--color-gray-500);
}

/* ✨ v2.0: 玻璃拟态菜单卡片 */
.menu-section {
  padding: 0 var(--space-md);
  margin-bottom: var(--space-lg);
}

.menu-card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: var(--space-lg);
  transition: background var(--animation-fast);
  position: relative;
}

.menu-item:active {
  background: rgba(102, 126, 234, 0.05);
}

.menu-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 100rpx;
  right: 0;
  height: 1rpx;
  background: rgba(0, 0, 0, 0.06);
}

.menu-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: var(--space-md);
  flex-shrink: 0;
}

.menu-icon-wrap.publish { background: rgba(102, 126, 234, 0.1); }
.menu-icon-wrap.order { background: rgba(16, 185, 129, 0.1); }
.menu-icon-wrap.vip { background: rgba(245, 158, 11, 0.1); }
.menu-icon-wrap.review { background: rgba(118, 75, 162, 0.1); }
.menu-icon-wrap.verify { background: rgba(239, 68, 68, 0.1); }

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.menu-title {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--color-gray-900);
}

.menu-desc {
  font-size: 24rpx;
  color: var(--color-gray-500);
}

.menu-badge {
  background: var(--color-gradient);
  color: var(--color-white);
  font-size: 20rpx;
  font-weight: 500;
  padding: 4rpx 12rpx;
  border-radius: var(--radius-full);
  margin-right: 12rpx;
}

.menu-arrow {
  font-size: 28rpx;
  color: var(--color-gray-400);
}

/* 退出按钮 */
.logout-section {
  padding: 0 var(--space-md) 40rpx;
}

.logout-btn {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  padding: 28rpx;
  text-align: center;
  font-size: 30rpx;
  color: var(--color-error);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  transition: all var(--animation-fast);
}

.logout-btn:active {
  background: var(--color-error-bg);
  transform: var(--state-active);
}
```

- [ ] **Step 2: 更新 profile.wxml 模板结构

```xml
<view class="profile-page">
  <!-- 渐变头部区域 -->
  <view class="profile-header">
    <view class="profile-avatar">{{userInfo.realName && userInfo.realName.charAt(0)}}</view>
    <view class="profile-info">
      <view class="profile-name">{{userInfo.realName || '用户'}}</view>
      <view class="profile-role">
        <text>👨‍👩‍👧</text>
        <text>{{userInfo.role === 'tutor' ? '家教老师' : '家长用户'}}</text>
      </view>
    </view>
  </view>

  <!-- 数据统计卡片 -->
  <view class="stats-card">
    <view class="stat-item">
      <text class="stat-number">{{userInfo.viewCount || 0}}</text>
      <text class="stat-label">被查看</text>
    </view>
    <view class="stat-item">
      <text class="stat-number">{{userInfo.likeCount || 0}}</text>
      <text class="stat-label">获赞</text>
    </view>
    <view class="stat-item">
      <text class="stat-number">{{userInfo.orderCount || 0}}</text>
      <text class="stat-label">接单</text>
    </view>
  </view>

  <!-- 菜单列表 -->
  <view class="menu-section">
    <view class="menu-card">
      <view class="menu-item" bindtap="goToMyPublish">
        <view class="menu-icon-wrap publish">📝</view>
        <view class="menu-content">
          <text class="menu-title">我的发布</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" bindtap="goToMyOrders">
        <view class="menu-icon-wrap order">💰</view>
        <view class="menu-content">
          <text class="menu-title">我的订单</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" bindtap="goToVip">
        <view class="menu-icon-wrap vip">👑</view>
        <view class="menu-content">
          <text class="menu-title">会员中心</text>
          <text class="menu-desc">解锁更多功能</text>
        </view>
        <text class="menu-badge">VIP</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" bindtap="goToReviews">
        <view class="menu-icon-wrap review">💬</view>
        <view class="menu-content">
          <text class="menu-title">我的评价</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" bindtap="goToVerification">
        <view class="menu-icon-wrap verify">🪪</view>
        <view class="menu-content">
          <text class="menu-title">认证中心</text>
          <text class="menu-desc" wx:if="{{!userInfo.verified}}">去认证获得更多信任</text>
          <text class="menu-desc" wx:else>已认证</text>
        </view>
        <text class="menu-badge" wx:if="{{!userInfo.verified}}">去认证</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>

  <!-- 退出按钮 -->
  <view class="logout-section">
    <view class="logout-btn" bindtap="logout">退出登录</view>
  </view>
</view>
```

- [ ] **Step 3: 在微信开发者工具中预览效果

检查渐变头部、玻璃拟态统计卡片、菜单点击状态

- [ ] **Step 4: 测试验证

测试菜单项点击跳转、统计数据显示、认证状态徽章

- [ ] **Step 5: 提交

```bash
git add miniprogram/pages/profile/profile.wxml miniprogram/pages/profile/profile.wxss
git commit -m "feat(ui): optimize profile page with glass morphism design"
```

---

### Task 4: 登录页面品牌升级

**Files:**
- Modify: `miniprogram/pages/login/login.wxss`
- Modify: `miniprogram/pages/login/login.wxml`

- [ ] **Step 1: 更新 login.wxss 样式

```css
/* ============================================
   登录页面 - Design Tokens v2.0
   ============================================ */

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 80rpx var(--space-xl) 40rpx;
  box-sizing: border-box;
}

/* ✨ v2.0: 品牌大Logo区域 */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 80rpx;
}

.brand-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 40rpx;
  background: var(--color-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72rpx;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 32rpx;
  box-shadow: var(--shadow-primary);
}

.brand-name {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: 12rpx;
  letter-spacing: 4rpx;
}

.brand-slogan {
  font-size: 28rpx;
  color: var(--color-gray-500);
}

/* 登录按钮区域 */
.login-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ✨ v2.0: 微信登录大按钮 */
.wechat-login-btn {
  width: 100%;
  background: var(--color-gradient);
  color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: 32rpx 0;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: var(--shadow-primary);
  transition: all var(--animation-fast);
  margin-bottom: 40rpx;
}

.wechat-login-btn:active {
  transform: var(--state-active);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.wechat-icon {
  font-size: 36rpx;
}

/* 分割线 */
.divider-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: var(--color-gray-300);
}

.divider-text {
  padding: 0 24rpx;
  font-size: 26rpx;
  color: var(--color-gray-500);
}

/* ✨ v2.0: 角色选择卡片 */
.role-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.role-card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: 2rpx solid transparent;
  border-radius: var(--radius-xl);
  padding: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-md);
  transition: all var(--animation-fast);
}

.role-card:active {
  transform: var(--state-active);
  border-color: var(--color-primary);
  background: rgba(102, 126, 234, 0.05);
}

.role-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--radius-lg);
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.role-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.role-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-gray-900);
}

.role-desc {
  font-size: 24rpx;
  color: var(--color-gray-500);
}

.role-arrow {
  font-size: 32rpx;
  color: var(--color-gray-400);
}

/* 底部提示 */
.tip-text {
  text-align: center;
  font-size: 24rpx;
  color: var(--color-gray-500);
  margin-top: 40rpx;
}
```

- [ ] **Step 2: 更新 login.wxml 模板结构

```xml
<view class="login-page">
  <!-- 品牌区域 -->
  <view class="brand-section">
    <view class="brand-logo">苏</view>
    <text class="brand-name">苏城e教</text>
    <text class="brand-slogan">家教智能匹配平台</text>
  </view>

  <!-- 登录按钮区域 -->
  <view class="login-section">
    <view class="wechat-login-btn" bindtap="wechatLogin">
      <text class="wechat-icon">🔗</text>
      <text>微信一键登录</text>
    </view>

    <view class="divider-wrap">
      <view class="divider-line"></view>
      <text class="divider-text">或</text>
      <view class="divider-line"></view>
    </view>

    <view class="role-cards">
      <view class="role-card" bindtap="selectRole" data-role="parent">
        <view class="role-icon">👨‍👩‍👧</view>
        <view class="role-info">
          <text class="role-title">我是家长</text>
          <text class="role-desc">找家教，给孩子更好的教育</text>
        </view>
        <text class="role-arrow">›</text>
      </view>

      <view class="role-card" bindtap="selectRole" data-role="tutor">
        <view class="role-icon">🎓</view>
        <view class="role-info">
          <text class="role-title">我是家教老师</text>
          <text class="role-desc">发布简历，找到合适的家教工作</text>
        </view>
        <text class="role-arrow">›</text>
      </view>
    </view>

    <text class="tip-text">首次登录将自动创建账号</text>
  </view>
</view>
```

- [ ] **Step 3: 在微信开发者工具中预览效果

检查品牌Logo渐变效果、微信登录按钮、角色选择卡片交互

- [ ] **Step 4: 测试验证

测试微信登录按钮点击、角色选择跳转、页面整体布局

- [ ] **Step 5: 提交

```bash
git add miniprogram/pages/login/login.wxml miniprogram/pages/login/login.wxss
git commit -m "feat(ui): optimize login page with brand upgrade"
```

---

## Phase 1 验收清单

- [ ] Design Tokens v2.0 全部生效
- [ ] 首页玻璃拟态卡片显示正常
- [ ] 个人中心渐变头部效果正确
- [ ] 登录页品牌Logo视觉效果良好
- [ ] 所有点击元素有状态反馈
- [ ] 微信开发者工具无样式警告

---

## Phase 2: 次高优先级页面

---

### Task 5: 详情页面信息重组

**Files:**
- Modify: `miniprogram/pages/detail/detail.wxss`
- Modify: `miniprogram/pages/detail/detail.wxml`

- [ ] **Step 1: 更新 detail.wxss 样式

```css
/* ============================================
   详情页面 - Design Tokens v2.0
   ============================================ */

.detail-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
}

/* 顶部导航 */
.nav-bar {
  position: sticky;
  top: 0;
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  padding: 24rpx var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  border-bottom: var(--border-light);
}

.nav-back, .nav-share {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  border-radius: var(--radius-lg);
  transition: background var(--animation-fast);
}

.nav-back:active, .nav-share:active {
  background: rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-gray-900);
}

/* 头部信息区域 */
.header-section {
  padding: var(--space-lg);
}

.tutor-header-card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: flex-start;
}

.detail-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-xl);
  background: var(--color-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-white);
  margin-right: var(--space-lg);
  flex-shrink: 0;
}

.detail-info {
  flex: 1;
}

.detail-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  gap: 12rpx;
}

.detail-name {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-gray-900);
}

.verified-tag {
  background: var(--color-success-bg);
  color: var(--color-success);
  font-size: 22rpx;
  font-weight: 500;
  padding: 6rpx 16rpx;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.detail-rating-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.detail-rating {
  color: var(--color-gold);
  font-size: 28rpx;
}

.detail-rating-text {
  font-size: 26rpx;
  color: var(--color-gray-700);
  font-weight: 500;
}

.detail-review-count {
  font-size: 24rpx;
  color: var(--color-gray-500);
}

.detail-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.detail-meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 26rpx;
  color: var(--color-gray-500);
}

/* 信息分组卡片 */
.info-section {
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-md);
}

.info-card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
}

.info-item:not(:last-child) {
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.info-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 26rpx;
  color: var(--color-gray-500);
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: var(--color-gray-900);
  line-height: 1.6;
}

/* 底部固定操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border-top: var(--border-light);
  padding: 20rpx var(--space-lg);
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-main {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-primary);
}

.price-unit {
  font-size: 24rpx;
  color: var(--color-gray-500);
  font-weight: 400;
}

.contact-btn {
  background: var(--color-gradient);
  color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: var(--shadow-primary);
  transition: all var(--animation-fast);
}

.contact-btn:active {
  transform: var(--state-active);
}
```

- [ ] **Step 2: 更新 detail.wxml 模板结构

```xml
<view class="detail-page">
  <!-- 顶部导航 -->
  <view class="nav-bar">
    <view class="nav-back" bindtap="goBack">←</view>
    <text class="nav-title">老师详情</text>
    <view class="nav-share" bindtap="onShare">分享</view>
  </view>

  <!-- 头部信息区域 -->
  <view class="header-section">
    <view class="tutor-header-card">
      <view class="detail-avatar">{{tutorInfo.realName && tutorInfo.realName.charAt(0)}}</view>
      <view class="detail-info">
        <view class="detail-name-row">
          <text class="detail-name">{{tutorInfo.realName || '老师'}}</text>
          <view class="verified-tag" wx:if="{{tutorInfo.verified}}">✅ 已认证</view>
        </view>
        <view class="detail-rating-row">
          <text class="detail-rating">⭐⭐⭐⭐⭐</text>
          <text class="detail-rating-text">{{tutorInfo.rating || 5.0}}</text>
          <text class="detail-review-count">({{tutorInfo.reviewCount || 0}}条评价)</text>
        </view>
        <view class="detail-meta-row">
          <text class="detail-meta-item">🏫 {{tutorInfo.education || '本科'}}</text>
          <text class="detail-meta-item">📍 {{tutorInfo.location || '姑苏区'}}</text>
        </view>
      </view>
    </view>
  </view>

  <!-- 详细信息 -->
  <view class="info-section">
    <view class="info-card">
      <view class="info-item">
        <text class="info-icon">📚</text>
        <view class="info-content">
          <text class="info-label">可授科目</text>
          <text class="info-value">{{tutorInfo.subjects && tutorInfo.subjects.join('、') || '数学、物理'}}</text>
        </view>
      </view>

      <view class="info-item">
        <text class="info-icon">🎓</text>
        <view class="info-content">
          <text class="info-label">教学年级</text>
          <text class="info-value">{{tutorInfo.grades || '高中一年级 ~ 三年级'}}</text>
        </view>
      </view>

      <view class="info-item">
        <text class="info-icon">💵</text>
        <view class="info-content">
          <text class="info-label">价格区间</text>
          <text class="info-value">¥{{tutorInfo.price || 100}} ~ {{(tutorInfo.price || 100) + 50}} / 小时</text>
        </view>
      </view>

      <view class="info-item">
        <text class="info-icon">📝</text>
        <view class="info-content">
          <text class="info-label">个人简介</text>
          <text class="info-value">{{tutorInfo.description || '重点高中在职老师，有多年教学经验，擅长数学辅导，认真负责。'}}</text>
        </view>
      </view>
    </view>
  </view>

  <!-- 底部固定操作栏 -->
  <view class="bottom-bar">
    <view class="price-info">
      <text class="price-main">¥{{tutorInfo.price || 100}}<text class="price-unit">/小时</text></text>
    </view>
    <view class="contact-btn" bindtap="unlockContact">解锁联系方式</view>
  </view>
</view>
```

- [ ] **Step 3: 预览并测试效果

检查信息分组显示、底部固定按钮、整体视觉层次

- [ ] **Step 4: 提交

```bash
git add miniprogram/pages/detail/detail.wxml miniprogram/pages/detail/detail.wxss
git commit -m "feat(ui): optimize detail page with information restructuring"
```

---

### Task 6: 发布页面表单样式统一

**Files:**
- Modify: `miniprogram/pages/publish/publish.wxss`
- Modify: `miniprogram/pages/publish/publish.wxml`

- [ ] **Step 1: 更新 publish.wxss 样式

```css
/* ============================================
   发布页面 - Design Tokens v2.0
   ============================================ */

.publish-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
}

.page-header {
  padding: var(--space-lg);
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: 8rpx;
}

.step-indicator {
  font-size: 26rpx;
  color: var(--color-primary);
  font-weight: 500;
}

/* 玻璃拟态表单卡片 */
.form-section {
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-md);
}

.form-card {
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border: var(--border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.form-item {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  position: relative;
}

.form-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--space-lg);
  right: 0;
  height: 1rpx;
  background: rgba(0, 0, 0, 0.06);
}

.form-label {
  font-size: 26rpx;
  color: var(--color-gray-500);
  margin-bottom: 16rpx;
}

.form-input {
  font-size: 30rpx;
  color: var(--color-gray-900);
  padding: 0;
}

.form-input::placeholder {
  color: var(--color-gray-400);
}

/* 选择器样式 */
.picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-value {
  font-size: 30rpx;
  color: var(--color-gray-900);
}

.picker-placeholder {
  font-size: 30rpx;
  color: var(--color-gray-400);
}

.picker-arrow {
  font-size: 28rpx;
  color: var(--color-gray-400);
}

/* 多选标签 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-option {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  border-radius: var(--radius-full);
  border: 2rpx solid transparent;
  transition: all var(--animation-fast);
}

.tag-option:active {
  transform: scale(0.96);
}

.tag-option.selected {
  background: var(--color-gradient);
  color: var(--color-white);
  border-color: transparent;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx var(--space-lg);
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  backdrop-filter: var(--bg-card-blur);
  -webkit-backdrop-filter: var(--bg-card-blur);
  border-top: var(--border-light);
}

.next-btn {
  width: 100%;
  background: var(--color-gradient);
  color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: 28rpx 0;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  box-shadow: var(--shadow-primary);
  transition: all var(--animation-fast);
}

.next-btn:active {
  transform: var(--state-active);
}

.next-btn[disabled] {
  opacity: 0.5;
  box-shadow: none;
}
```

- [ ] **Step 2: 更新 publish.wxml 模板结构

```xml
<view class="publish-page">
  <view class="page-header">
    <text class="page-title">发布{{currentStep === 1 ? '需求' : '简历'}}</text>
    <text class="step-indicator">Step {{currentStep}} / 3</text>
  </view>

  <!-- 基本信息表单 -->
  <view class="form-section">
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">真实姓名</text>
        <input class="form-input" placeholder="请输入真实姓名" value="{{formData.realName}}" bindinput="onNameInput" />
      </view>

      <view class="form-item">
        <text class="form-label">毕业院校</text>
        <input class="form-input" placeholder="请输入毕业院校" value="{{formData.school}}" bindinput="onSchoolInput" />
      </view>

      <view class="form-item">
        <text class="form-label">学历</text>
        <picker mode="selector" range="{{educationList}}" value="{{formData.educationIndex}}" bindchange="onEducationChange">
          <view class="picker-row">
            <text class="{{formData.educationIndex >= 0 ? 'picker-value' : 'picker-placeholder'}}">
              {{formData.educationIndex >= 0 ? educationList[formData.educationIndex] : '请选择学历'}}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">期望薪资</text>
        <picker mode="selector" range="{{priceList}}" value="{{formData.priceIndex}}" bindchange="onPriceChange">
          <view class="picker-row">
            <text class="{{formData.priceIndex >= 0 ? 'picker-value' : 'picker-placeholder'}}">
              {{formData.priceIndex >= 0 ? priceList[formData.priceIndex] : '请选择期望薪资'}}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>
  </view>

  <!-- 可授科目 -->
  <view class="form-section">
    <view class="form-card" style="padding: var(--space-lg);">
      <text class="form-label" style="margin-bottom: 20rpx;">可授科目（可多选）</text>
      <view class="tags-container">
        <view class="tag-option {{item.selected ? 'selected' : ''}}" wx:for="{{subjectList}}" wx:key="*this" data-index="{{index}}" bindtap="onSubjectTap">
          {{item}}
        </view>
      </view>
    </view>
  </view>

  <!-- 底部按钮 -->
  <view class="bottom-actions">
    <view class="next-btn" bindtap="nextStep">下一步</view>
  </view>
</view>
```

- [ ] **Step 3: 预览并测试效果

检查表单输入框玻璃拟态样式、标签多选交互、按钮状态

- [ ] **Step 4: 提交

```bash
git add miniprogram/pages/publish/publish.wxml miniprogram/pages/publish/publish.wxss
git commit -m "feat(ui): optimize publish page with unified form styles"
```

---

### Task 7: 注册页面样式升级

**Files:**
- Modify: `miniprogram/pages/register/register.wxss`
- Modify: `miniprogram/pages/register/register.wxml`

- [ ] **Step 1: 更新 register.wxss 样式（参考 login 页面风格统一即可，保持角色选择大卡片设计）

- [ ] **Step 2: 更新 register.wxml 模板结构

- [ ] **Step 3: 预览并测试效果

- [ ] **Step 4: 提交

```bash
git add miniprogram/pages/register/register.wxml miniprogram/pages/register/register.wxss
git commit -m "feat(ui): optimize register page with consistent design"
```

---

## Phase 3: 低优先级页面

---

### Task 8: 我的发布页面优化

**Files:**
- Modify: `miniprogram/pages/my-publish/my-publish.wxss`
- Modify: `miniprogram/pages/my-publish/my-publish.wxml`

- [ ] **Step 1: 应用玻璃拟态卡片设计
- [ ] **Step 2: 统一状态标签样式
- [ ] **Step 3: 添加列表项交互动画
- [ ] **Step 4: 测试并提交

```bash
git add miniprogram/pages/my-publish/my-publish.wxml miniprogram/pages/my-publish/my-publish.wxss
git commit -m "feat(ui): optimize my-publish page with glass morphism"
```

---

### Task 9: 我的订单页面优化

**Files:**
- Modify: `miniprogram/pages/my-orders/my-orders.wxss`
- Modify: `miniprogram/pages/my-orders/my-orders.wxml`

- [ ] **Step 1: 应用玻璃拟态卡片设计
- [ ] **Step 2: 统一订单状态标签样式
- [ ] **Step 3: 添加操作按钮统一风格
- [ ] **Step 4: 测试并提交

```bash
git add miniprogram/pages/my-orders/my-orders.wxml miniprogram/pages/my-orders/my-orders.wxss
git commit -m "feat(ui): optimize my-orders page with glass morphism"
```

---

## 最终验收

### Task 10: 整体验收与调试

- [ ] **Step 1: 全页面视觉走查

逐个页面打开确认：
- 所有页面背景渐变显示正常
- 所有卡片玻璃拟态效果一致
- 所有可点击元素有状态反馈
- 所有字体大小、颜色符合 Design Tokens
- 点击热区符合 48rpx 最小要求

- [ ] **Step 2: 交互测试

测试：
- 所有按钮点击有反馈动画
- 页面切换流畅无卡顿
- 输入框聚焦有高亮边框
- 列表滚动流畅

- [ ] **Step 3: 兼容性测试

在不同尺寸手机上预览，确认布局无错乱

- [ ] **Step 4: 性能检查

微信开发者工具中无警告、无错误
Lighthouse 性能评分达标

- [ ] **Step 5: 最终提交

```bash
git add .
git commit -m "feat(ui): complete all 9 pages UI optimization v2.0"
```

---

## 实施总结

| 阶段 | 页面数 | 优先级 | 预计耗时 |
|--------|----------|-----------|-----------|
| Phase 1 | 4 页面 | 最高 | 2-3 小时 |
| Phase 2 | 3 页面 | 次高 | 1-2 小时 |
| Phase 3 | 2 页面 | 低 | 1 小时 |
| **总计** | **9 页面** | | **4-6 小时** |

---

## Design Tokens 覆盖率检查清单

验收时确认以下变量在所有页面样式中的使用率达到 90% 以上：

- [x] `--color-primary` 品牌色
- [x] `--color-gradient` 渐变背景
- [x] `--bg-card` 卡片背景
- [x] `--radius-xl` 大圆角
- [x] `--shadow-md` 中阴影
- [x] `--space-md` 中间距
- [x] `--animation-fast` 快动画
- [x] `--color-gray-500` 中性色
