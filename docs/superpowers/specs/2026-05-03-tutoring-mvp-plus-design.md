# 苏城e教 MVP+ 运营功能设计规范

**日期**: 2026-05-03
**版本**: v1.0
**状态**: 设计完成，待开发

---

## 1. 整体架构

### 1.1 设计目标
在现有 MVP 基础上，增加 4 个运营子系统，提升用户留存与平台可信度：
- 评价系统：建立平台信任体系
- 认证系统：建立真人审核机制，替换现有模拟认证
- 收藏系统：提升用户留存与回访
- 消息系统：提升活跃度与转化

### 1.2 架构图
```
┌───────────────────────────────────────────────────────────┐
│                    现有核心流程 (MVP)                       │
│  login → register → publish → matchTutors → detail → unlock│
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                    新增运营层 (MVP+)                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 评价系统  │  │ 认证系统  │  │ 收藏系统  │  │ 消息通知  │  │
│  │ Reviews  │  │  Verify  │  │Favorites │  │  Notify   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  云函数: createReview, submitVerification, toggleFavorite  │
│  页面: reviews, verification, favorites, notifications     │
│  存储: 新增 3 个集合 + 本地缓存                             │
└───────────────────────────────────────────────────────────┘
```

### 1.3 设计原则
- **独立部署**: 每个子系统独立云函数 → 可单独上线/回滚
- **UI 复用**: 页面复用现有组件样式 → 保持视觉一致性
- **渐进推广**: 所有功能可选启用 → 通过 profile 页面入口渐进式推广
- **Phase 1 优先**: 评价 + 认证（建立信任）；Phase 2: 收藏 + 消息（提升留存）

---

## 2. 数据库集合设计

### 2.1 Reviews（评价表）
```javascript
{
  _id: ObjectId,
  orderId: String,           // 关联订单（可选，初期可不关联）
  fromUserId: String,        // 评价者
  toUserId: String,          // 被评价者
  role: String,              // 评价者角色 'parent'|'tutor'
  rating: Number,            // 评分 1-5
  tags: Array,               // 标签数组 ["准时", "专业", "耐心"]
  content: String,           // 文字评价
  reply: String,             // 回复内容
  replyTime: Date,
  isAnonymous: Boolean,      // 是否匿名
  createTime: Date,
  updateTime: Date
}
```

### 2.2 Verifications（认证申请表）
```javascript
{
  _id: ObjectId,
  userId: String,
  type: String,              // 'idCard'|'student'|'teacherQual'
  realName: String,          // 真实姓名
  idNumber: String,          // 证件号（脱敏存储，中间打星号）
  imageUrls: Array,          // 证件图片路径（云存储 fileID）
  status: Number,            // 0待审核/1通过/2拒绝
  reason: String,            // 拒绝原因
  reviewerId: String,        // 审核人
  reviewTime: Date,
  createTime: Date,
  updateTime: Date
}
```

### 2.3 Favorites（收藏表）
```javascript
{
  _id: ObjectId,
  userId: String,            // 收藏者
  targetId: String,          // 被收藏者（家教/需求ID）
  targetType: String,        // 'tutor'|'requirement'
  targetSnapshot: Object,    // 快照数据 {name, price, district, subjects}
  createTime: Date
}
```

**命名规范**: 与现有集合一致（PascalCase），外键统一使用 `userId`（关联 Users._id）。

---

## 3. 云函数接口约定

### 3.1 新增云函数清单

| 函数名 | 入参 | 出参 | 说明 |
|--------|------|------|------|
| `createReview` | toUserId, rating, tags, content, isAnonymous | {reviewId} | 创建评价 |
| `getReviewList` | userId, page, pageSize | {list, total, averageRating} | 查看某人收到的评价 |
| `submitVerification` | type, realName, idNumber, imageUrls | {verificationId} | 提交认证申请 |
| `getVerificationStatus` | userId | {status, latest, history} | 获取认证状态与历史 |
| `toggleFavorite` | targetId, targetType, targetSnapshot, action ('add'|'remove') | {success} | 收藏/取消收藏 |
| `getFavoriteList` | userId, page, pageSize | {list, total} | 我的收藏列表 |

### 3.2 复用现有云函数（扩展）
- `matchTutors`: 返回结果中增加 `averageRating`, `reviewCount` 字段
- `updateUserProfile`: 认证通过后更新 `Users.idCardVerified` 字段
- `login`: 登录时返回未读消息数红点提示

### 3.3 通用返回格式
```javascript
{
  success: Boolean,
  message: String,
  data: Object,
  error: String  // 仅失败时返回
}
```

---

## 4. 前端页面设计

### 4.1 页面入口改造（profile 页面）
```
个人中心
├── 我的发布 → 现有
├── 我的订单 → 现有
├── ─────────────────── 分割线
├── 🔘 我的收藏 → pages/favorites/favorites
├── 🔘 我的评价 → pages/reviews/reviews
├── 🔘 认证中心 → pages/verification/verification
├── 🔘 消息通知 → pages/notifications/notifications
└── 退出登录 → 现有
```

### 4.2 新页面清单

| 页面 | 路径 | 核心功能 |
|------|------|---------|
| `favorites` | `pages/favorites/favorites` | 收藏列表，左滑删除，点击跳转详情 |
| `reviews` | `pages/reviews/reviews` | 收到的评价列表，评分星星展示，标签云 |
| `verification` | `pages/verification/verification` | 认证类型选择 → 表单提交 → 状态查询 |
| `notifications` | `pages/notifications/notifications` | 系统消息列表，已读/未读状态 |

### 4.3 detail 页面改造
- 新增收藏按钮：`★ 收藏`（已收藏时高亮）
- 新增评价入口：`查看评价 (5)`

---

## 5. 实施计划与优先级

### Phase 1（高价值低风险）
**目标**: 建立平台信任基础

1. **评价系统**（3 天）
   - 云函数: createReview, getReviewList
   - 页面: reviews
   - 首页列表展示平均评分

2. **认证系统**（3 天）
   - 云函数: submitVerification, getVerificationStatus
   - 页面: verification
   - 替换 profile 页面现有模拟认证弹窗

### Phase 2（次优先）
**目标**: 提升用户留存

3. **收藏系统**（2 天）
   - 云函数: toggleFavorite, getFavoriteList
   - 页面: favorites
   - detail 页面增加收藏按钮

4. **消息通知**（2 天）
   - 云函数: getNotificationList, markAsRead
   - 页面: notifications
   - 配合认证/评价系统发送系统消息

**总预估**: 10 个开发日

---

## 6. 技术规范

### 6.1 代码风格
- 沿用现有小程序代码风格
- 云函数错误处理与现有保持一致
- 本地存储同步逻辑与 register 页面一致

### 6.2 测试要点
- 评价评分边界测试（0 分/6 分拦截）
- 认证图片上传失败重试
- 收藏重复提交防重
- 空列表状态展示

### 6.3 回滚策略
- 每个功能独立云函数，不影响现有核心流程
- 页面入口可通过注释快速关闭
- 数据库集合独立，删除不影响现有数据

---

## 7. 验收标准

- [ ] 评价提交成功后首页列表展示正确评分
- [ ] 认证提交后状态可查询，审核后用户资料更新认证状态
- [ ] 收藏/取消收藏操作立即生效，列表实时更新
- [ ] 所有空状态有友好提示文案
- [ ] 所有异步操作有 loading 反馈
- [ ] 云函数控制台无报错日志
