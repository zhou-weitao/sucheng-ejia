# Phase 1: Review + Verification Systems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the trust foundation for the 苏城e家教 platform by adding review and identity verification features. Parents can review tutors, tutors can submit ID for verification, and both are displayed on profile cards.

**Architecture:** Purely additive changes. Two new database collections (Reviews, Verifications) with independent cloud functions. Frontend pages added as new routes with profile page entry points. No changes to core matching/requirements flow.

**Tech Stack:** WeChat Mini-Program (WXML/WXSS/JS), WeChat Cloud Functions (wx-server-sdk), NoSQL Database

---

## Phase 1A: Review System

### Task 1: Add Reviews Collection to initDB

**Files:**
- Modify: `cloudfunctions/initDB/index.js`

- [ ] **Step 1: Add Reviews collection creation**

```javascript
// Find the existing collections array and add 'Reviews' to it:
const collections = ['Users', 'Requirements', 'Tutor_Profiles', 'Orders', 'Reviews'];

// The rest of the initDB logic handles each collection identically,
// so no other changes needed beyond adding the collection name.
```

- [ ] **Step 2: Deploy and test initDB**

Run: In WeChat Developer Tools, right-click `cloudfunctions/initDB` → "Upload and Deploy: Cloud Installation Dependencies"
Run: Call `wx.cloud.callFunction({ name: 'initDB' })`
Expected: Console shows "Reviews collection created successfully"

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/initDB/index.js
git commit -m "feat: add Reviews collection to initDB"
```

---

### Task 2: Create createReview Cloud Function

**Files:**
- Create: `cloudfunctions/createReview/index.js`
- Create: `cloudfunctions/createReview/package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "createReview",
  "version": "1.0.0",
  "description": "Create a user review",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Write cloud function implementation**

```javascript
// cloudfunctions/createReview/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { toUserId, rating, tags, content, isAnonymous } = event

  // Validation
  if (!toUserId) {
    return { success: false, message: '缺少被评价用户ID', error: 'toUserId required' }
  }
  if (!rating || rating < 1 || rating > 5) {
    return { success: false, message: '评分必须在1-5之间', error: 'invalid rating' }
  }

  try {
    // Get reviewer's user ID
    const userRes = await db.collection('Users')
      .where({ openid: wxContext.OPENID })
      .get()

    if (userRes.data.length === 0) {
      return { success: false, message: '用户不存在', error: 'user not found' }
    }

    const fromUserId = userRes.data[0]._id
    const role = userRes.data[0].role || 'parent'

    // Create review
    const now = new Date()
    const result = await db.collection('Reviews').add({
      data: {
        orderId: '', // Optional - not implemented yet
        fromUserId,
        toUserId,
        role,
        rating: Number(rating),
        tags: tags || [],
        content: content || '',
        reply: '',
        replyTime: null,
        isAnonymous: isAnonymous || false,
        createTime: now,
        updateTime: now
      }
    })

    return {
      success: true,
      message: '评价提交成功',
      data: { reviewId: result._id }
    }
  } catch (err) {
    console.error('createReview error:', err)
    return { success: false, message: '评价提交失败', error: err.message }
  }
}
```

- [ ] **Step 3: Deploy cloud function**

Run: In WeChat Developer Tools, right-click `cloudfunctions/createReview` → "Upload and Deploy: Cloud Installation Dependencies"
Expected: No deployment errors

- [ ] **Step 4: Test cloud function**

Run: Call via console or test page:
```javascript
wx.cloud.callFunction({
  name: 'createReview',
  data: {
    toUserId: 'SOME_TUTOR_ID',
    rating: 5,
    tags: ['准时', '专业'],
    content: '老师非常专业',
    isAnonymous: false
  }
})
```
Expected: Returns `{ success: true, data: { reviewId: "..." } }`

- [ ] **Step 5: Test rating validation (should fail)**

Run: Call with rating=6
Expected: Returns `{ success: false, message: "评分必须在1-5之间" }`

- [ ] **Step 6: Commit**

```bash
git add cloudfunctions/createReview/index.js cloudfunctions/createReview/package.json
git commit -m "feat: add createReview cloud function"
```

---

### Task 3: Create getReviewList Cloud Function

**Files:**
- Create: `cloudfunctions/getReviewList/index.js`
- Create: `cloudfunctions/getReviewList/package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "getReviewList",
  "version": "1.0.0",
  "description": "Get reviews for a user with average rating",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Write cloud function implementation**

```javascript
// cloudfunctions/getReviewList/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { userId, page = 1, pageSize = 10 } = event

  if (!userId) {
    return { success: false, message: '缺少用户ID', error: 'userId required' }
  }

  try {
    // Get reviews for this user
    const result = await db.collection('Reviews')
      .where({ toUserId: userId })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // Get total count for pagination
    const countResult = await db.collection('Reviews')
      .where({ toUserId: userId })
      .count()

    // Calculate average rating - handle empty list case
    const allReviews = await db.collection('Reviews')
      .where({ toUserId: userId })
      .field({ rating: true })
      .get()

    let averageRating = 0
    if (allReviews.data.length > 0) {
      const total = allReviews.data.reduce((sum, r) => sum + r.rating, 0)
      averageRating = Math.round((total / allReviews.data.length) * 10) / 10
    }

    // Get reviewer names (non-anonymous only)
    const reviewsWithNames = []
    for (const review of result.data) {
      const reviewCopy = { ...review }
      if (!review.isAnonymous) {
        const reviewer = await db.collection('Users')
          .doc(review.fromUserId)
          .field({ nickName: true })
          .get()
        reviewCopy.reviewerName = reviewer.data?.nickName || '匿名用户'
      } else {
        reviewCopy.reviewerName = '匿名用户'
      }
      reviewsWithNames.push(reviewCopy)
    }

    return {
      success: true,
      message: '获取评价列表成功',
      data: {
        list: reviewsWithNames,
        total: countResult.total,
        averageRating,
        reviewCount: allReviews.data.length
      }
    }
  } catch (err) {
    console.error('getReviewList error:', err)
    return { success: false, message: '获取评价失败', error: err.message }
  }
}
```

- [ ] **Step 3: Deploy cloud function**

Run: In WeChat Developer Tools, right-click `cloudfunctions/getReviewList` → "Upload and Deploy: Cloud Installation Dependencies"
Expected: No deployment errors

- [ ] **Step 4: Test cloud function**

Run: Call with a tutor userId that has reviews
Expected: Returns list with averageRating calculated correctly

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/getReviewList/index.js cloudfunctions/getReviewList/package.json
git commit -m "feat: add getReviewList cloud function with average rating"
```

---

### Task 4: Reviews Page Frontend

**Files:**
- Create: `miniprogram/pages/reviews/reviews.js`
- Create: `miniprogram/pages/reviews/reviews.wxml`
- Create: `miniprogram/pages/reviews/reviews.wxss`
- Modify: `miniprogram/app.json` (add route)

- [ ] **Step 1: Add route to app.json**

In `app.json` -> `pages` array, add:
```json
"pages/reviews/reviews"
```

- [ ] **Step 2: Write reviews.js logic**

```javascript
// miniprogram/pages/reviews/reviews.js
const db = wx.cloud.database()

Page({
  data: {
    userId: '',
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
    loading: true,
    empty: false,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const userId = options.userId || userInfo._id || ''
    this.setData({ userId })
    this.loadReviews()
  },

  async loadReviews(isRefresh = false) {
    const { userId, pageSize } = this.data
    const page = isRefresh ? 1 : this.data.page

    wx.showLoading({ title: '加载中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getReviewList',
        data: { userId, page, pageSize }
      })

      if (res.result.success) {
        const { list, total, averageRating, reviewCount } = res.result.data
        const newReviews = isRefresh ? list : [...this.data.reviews, ...list]
        const hasMore = newReviews.length < total

        this.setData({
          reviews: newReviews,
          averageRating,
          reviewCount,
          hasMore,
          page: isRefresh ? 2 : page + 1,
          empty: total === 0,
          loading: false
        })
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('加载评价失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    } finally {
      wx.hideLoading()
    }
  },

  onPullDownRefresh() {
    this.loadReviews(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadReviews(false)
    }
  },

  // Render star rating helper
  getStarArray(rating) {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'full' : 'empty')
    }
    return stars
  },

  // Format date
  formatDate(dateStr) {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
})
```

- [ ] **Step 3: Write reviews.wxml template**

```xml
<!-- miniprogram/pages/reviews/reviews.wxml -->
<view class="container">
  <!-- 头部统计 -->
  <view class="header" wx:if="{{reviewCount > 0}}">
    <view class="rating-display">
      <text class="rating-number">{{averageRating}}</text>
      <view class="stars">
        <text class="star" wx:for="{{getStarArray(averageRating)}}" wx:key="*this">
          {{item === 'full' ? '★' : '☆'}}
        </text>
      </view>
    </view>
    <text class="review-count">共 {{reviewCount}} 条评价</text>
  </view>

  <!-- 评价列表 -->
  <view class="review-list" wx:if="{{!loading && !empty}}">
    <view class="review-item" wx:for="{{reviews}}" wx:key="_id">
      <view class="review-header">
        <text class="reviewer-name">{{item.reviewerName}}</text>
        <view class="rating-small">
          <text wx:for="{{getStarArray(item.rating)}}" wx:key="*this">{{item === 'full' ? '★' : '☆'}}</text>
        </view>
      </view>
      
      <view class="review-tags" wx:if="{{item.tags && item.tags.length > 0}}">
        <text class="tag" wx:for="{{item.tags}}" wx:key="*this">{{item}}</text>
      </view>
      
      <view class="review-content" wx:if="{{item.content}}">
        {{item.content}}
      </view>
      
      <view class="review-footer">
        <text class="review-date">{{formatDate(item.createTime)}}</text>
      </view>
    </view>
  </view>

  <!-- 空状态 -->
  <view class="empty-wrap" wx:if="{{!loading && empty}}">
    <view class="empty-icon">💬</view>
    <text class="empty-text">暂无评价</text>
    <text class="empty-subtext">成为第一个评价的人吧</text>
  </view>

  <!-- 加载中 -->
  <view class="loading" wx:if="{{loading}}">
    <text>加载中...</text>
  </view>

  <!-- 加载更多提示 -->
  <view class="load-more" wx:if="{{hasMore && !loading && !empty}}">
    <text>上拉加载更多</text>
  </view>
</view>
```

- [ ] **Step 4: Write reviews.wxss styles**

```css
/* miniprogram/pages/reviews/reviews.wxss */
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  text-align: center;
}

.rating-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.rating-number {
  font-size: 64rpx;
  font-weight: bold;
  color: #ff9500;
}

.stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 32rpx;
  color: #ff9500;
}

.review-count {
  color: #999;
  font-size: 28rpx;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.review-item {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.reviewer-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.rating-small {
  display: flex;
  gap: 2rpx;
}

.rating-small text {
  font-size: 24rpx;
  color: #ff9500;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag {
  background: #f0f7ff;
  color: #007aff;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.review-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.review-footer {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.review-date {
  font-size: 24rpx;
  color: #999;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-subtext {
  font-size: 28rpx;
  color: #999;
}

.loading {
  text-align: center;
  padding: 80rpx;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
```

- [ ] **Step 5: Test the page**

Run: In WeChat Developer Tools, navigate to `pages/reviews/reviews`
Expected: Page loads without errors, shows reviews (or empty state)

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/reviews/reviews.js miniprogram/pages/reviews/reviews.wxml miniprogram/pages/reviews/reviews.wxss miniprogram/app.json
git commit -m "feat: add reviews page frontend"
```

---

### Task 5: Integrate Ratings into Index and Detail Pages

**Files:**
- Modify: `miniprogram/pages/index/index.js` (add rating to tutor cards)
- Modify: `miniprogram/pages/index/index.wxml`
- Modify: `miniprogram/pages/detail/detail.js` (add review entry point)
- Modify: `miniprogram/pages/detail/detail.wxml`

- [ ] **Step 1: Update index.js to pass rating data**

```javascript
// In the matchTutors success handler, after getting tutorData:
// Find where tutor cards are rendered and ensure averageRating is included:

// Add this logic after getting match results:
const tutorsWithRating = []
for (const tutor of tutorData) {
  // Get review stats for this tutor
  const reviewRes = await wx.cloud.callFunction({
    name: 'getReviewList',
    data: { userId: tutor.userId, page: 1, pageSize: 1 }
  })
  
  tutorsWithRating.push({
    ...tutor,
    averageRating: reviewRes.result.success ? reviewRes.result.data.averageRating : 0,
    reviewCount: reviewRes.result.success ? reviewRes.result.data.reviewCount : 0
  })
}

this.setData({ tutors: tutorsWithRating })
```

Note: For performance, ideally batch this or add rating denormalization to Tutor_Profiles. For MVP, calling per tutor is acceptable.

- [ ] **Step 2: Update index.wxml to show rating on tutor cards**

```xml
<!-- Add this inside the tutor card, after the subject/district info: -->
<view class="tutor-rating" wx:if="{{item.averageRating > 0}}">
  <text class="rating-stars">★ {{item.averageRating}}</text>
  <text class="rating-count">({{item.reviewCount}}条评价)</text>
</view>
```

- [ ] **Step 3: Add rating styles to index.wxss**

```css
.tutor-rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
}

.rating-stars {
  color: #ff9500;
  font-size: 26rpx;
  font-weight: 500;
}

.rating-count {
  color: #999;
  font-size: 24rpx;
}
```

- [ ] **Step 4: Update detail.wxml to add "查看评价" button**

```xml
<!-- Add this in the action area of detail page: -->
<view class="detail-actions">
  <button class="action-btn secondary" bindtap="goToReviews">
    查看评价 ({{reviewCount}})
  </button>
</view>
```

- [ ] **Step 5: Add goToReviews method to detail.js**

```javascript
// In pages/detail/detail.js, add:
goToReviews() {
  const item = this.data.item
  if (item && item._id) {
    wx.navigateTo({
      url: `/pages/reviews/reviews?userId=${item._id}`
    })
  }
}

// Also load review count on page load:
async loadReviewCount() {
  const item = this.data.item
  if (!item || !item._id) return

  try {
    const res = await wx.cloud.callFunction({
      name: 'getReviewList',
      data: { userId: item._id, page: 1, pageSize: 1 }
    })
    if (res.result.success) {
      this.setData({ reviewCount: res.result.data.reviewCount })
    }
  } catch (err) {
    console.error('加载评价数失败:', err)
  }
}
```

Call `loadReviewCount()` in the `onLoad` handler.

- [ ] **Step 6: Test integration**

Run: Navigate from index → detail → reviews
Expected: Rating stars visible on tutor cards, "查看评价" button navigates correctly

- [ ] **Step 7: Commit**

```bash
git add miniprogram/pages/index/index.js miniprogram/pages/index/index.wxml miniprogram/pages/index/index.wxss miniprogram/pages/detail/detail.js miniprogram/pages/detail/detail.wxml
git commit -m "feat: integrate review ratings into index and detail pages"
```

---

## Phase 1B: Verification System

### Task 6: Create submitVerification Cloud Function

**Files:**
- Create: `cloudfunctions/submitVerification/index.js`
- Create: `cloudfunctions/submitVerification/package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "submitVerification",
  "version": "1.0.0",
  "description": "Submit identity verification request",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Write cloud function with ID masking**

```javascript
// cloudfunctions/submitVerification/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// Mask ID number: show first 3 and last 4 digits
function maskIdNumber(idNumber) {
  if (!idNumber || idNumber.length < 7) return idNumber
  const first = idNumber.slice(0, 3)
  const last = idNumber.slice(-4)
  const middle = '*'.repeat(idNumber.length - 7)
  return first + middle + last
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type, realName, idNumber, imageUrls } = event

  // Validation
  if (!type) {
    return { success: false, message: '缺少认证类型', error: 'type required' }
  }
  if (!realName) {
    return { success: false, message: '请输入真实姓名', error: 'realName required' }
  }
  if (!idNumber) {
    return { success: false, message: '请输入证件号', error: 'idNumber required' }
  }
  if (!imageUrls || imageUrls.length === 0) {
    return { success: false, message: '请上传证件照片', error: 'imageUrls required' }
  }

  try {
    // Get user ID
    const userRes = await db.collection('Users')
      .where({ openid: wxContext.OPENID })
      .get()

    if (userRes.data.length === 0) {
      return { success: false, message: '用户不存在', error: 'user not found' }
    }

    const userId = userRes.data[0]._id

    // Check if pending verification already exists
    const pendingRes = await db.collection('Verifications')
      .where({
        userId,
        type,
        status: 0 // pending
      })
      .get()

    if (pendingRes.data.length > 0) {
      return {
        success: false,
        message: '已有认证在审核中，请耐心等待',
        error: 'pending verification exists'
      }
    }

    // Store masked ID number for privacy
    const maskedIdNumber = maskIdNumber(idNumber)
    const now = new Date()

    // Create verification record
    const result = await db.collection('Verifications').add({
      data: {
        userId,
        type,
        realName,
        idNumber: maskedIdNumber, // Store masked version only
        imageUrls,
        status: 0, // 0=pending, 1=approved, 2=rejected
        reason: '',
        reviewerId: '',
        reviewTime: null,
        createTime: now,
        updateTime: now
      }
    })

    return {
      success: true,
      message: '认证申请已提交，请等待审核',
      data: { verificationId: result._id }
    }
  } catch (err) {
    console.error('submitVerification error:', err)
    return { success: false, message: '提交失败，请重试', error: err.message }
  }
}
```

- [ ] **Step 3: Deploy cloud function**

Run: In WeChat Developer Tools, right-click `cloudfunctions/submitVerification` → "Upload and Deploy: Cloud Installation Dependencies"
Expected: No deployment errors

- [ ] **Step 4: Test cloud function**

Run: Call via console with test data
Expected: Returns success with verificationId

- [ ] **Step 5: Test duplicate submission**

Run: Call again with same type before first one is approved
Expected: Returns "已有认证在审核中" error

- [ ] **Step 6: Commit**

```bash
git add cloudfunctions/submitVerification/index.js cloudfunctions/submitVerification/package.json
git commit -m "feat: add submitVerification cloud function with ID masking"
```

---

### Task 7: Create getVerificationStatus Cloud Function

**Files:**
- Create: `cloudfunctions/getVerificationStatus/index.js`
- Create: `cloudfunctions/getVerificationStatus/package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "getVerificationStatus",
  "version": "1.0.0",
  "description": "Get verification status and history for a user",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Write cloud function implementation**

```javascript
// cloudfunctions/getVerificationStatus/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event

  if (!userId) {
    return { success: false, message: '缺少用户ID', error: 'userId required' }
  }

  try {
    // Get all verification records for this user
    const result = await db.collection('Verifications')
      .where({ userId })
      .orderBy('createTime', 'desc')
      .get()

    const history = result.data

    // Find latest record overall
    const latest = history.length > 0 ? history[0] : null

    // Calculate current status for each type
    const idCardStatus = history.find(h => h.type === 'idCard')?.status || 0
    const studentStatus = history.find(h => h.type === 'student')?.status || 0
    const teacherStatus = history.find(h => h.type === 'teacherQual')?.status || 0

    // Update Users collection if any verification approved
    // This keeps the profile badge in sync
    if (idCardStatus === 1) {
      await db.collection('Users').doc(userId).update({
        data: {
          idCardVerified: 2, // 2 = verified
          updateTime: new Date()
        }
      })
    }

    return {
      success: true,
      message: '获取认证状态成功',
      data: {
        latest,
        history,
        idCardStatus,
        studentStatus,
        teacherStatus,
        overallVerified: idCardStatus === 1 // ID card verified = overall verified
      }
    }
  } catch (err) {
    console.error('getVerificationStatus error:', err)
    return { success: false, message: '获取认证状态失败', error: err.message }
  }
}
```

- [ ] **Step 3: Deploy cloud function**

Run: In WeChat Developer Tools, right-click `cloudfunctions/getVerificationStatus` → "Upload and Deploy: Cloud Installation Dependencies"
Expected: No deployment errors

- [ ] **Step 4: Test cloud function**

Run: Call with a user ID
Expected: Returns history and status fields correctly

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/getVerificationStatus/index.js cloudfunctions/getVerificationStatus/package.json
git commit -m "feat: add getVerificationStatus cloud function"
```

---

### Task 8: Verification Page Frontend with Image Upload

**Files:**
- Create: `miniprogram/pages/verification/verification.js`
- Create: `miniprogram/pages/verification/verification.wxml`
- Create: `miniprogram/pages/verification/verification.wxss`
- Modify: `miniprogram/app.json` (add route)

- [ ] **Step 1: Add route to app.json**

In `app.json` -> `pages` array, add:
```json
"pages/verification/verification"
```

- [ ] **Step 2: Write verification.js logic**

```javascript
// miniprogram/pages/verification/verification.js
Page({
  data: {
    // Type selection
    selectedType: '',
    typeOptions: [
      { value: 'idCard', label: '身份证认证', icon: '🪪' },
      { value: 'student', label: '学生证认证', icon: '🎓' },
      { value: 'teacherQual', label: '教师资格证', icon: '📜' }
    ],

    // Form data
    realName: '',
    idNumber: '',
    imageUrls: [],

    // Status display
    status: null, // 0=pending, 1=approved, 2=rejected
    statusText: '',
    reason: '',
    history: [],

    submitting: false,
    uploading: false
  },

  onLoad() {
    this.loadStatus()
  },

  async loadStatus() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const userId = userInfo._id

    if (!userId) return

    wx.showLoading({ title: '加载中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getVerificationStatus',
        data: { userId }
      })

      if (res.result.success) {
        const { latest, history, idCardStatus } = res.result.data
        this.setData({
          status: idCardStatus,
          statusText: this.getStatusText(idCardStatus),
          reason: latest?.reason || '',
          history
        })
      }
    } catch (err) {
      console.error('加载认证状态失败:', err)
    } finally {
      wx.hideLoading()
    }
  },

  getStatusText(status) {
    const map = { 0: '审核中', 1: '已认证', 2: '未通过' }
    return map[status] || '未认证'
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ selectedType: type })
  },

  onNameInput(e) {
    this.setData({ realName: e.detail.value })
  },

  onIdInput(e) {
    this.setData({ idNumber: e.detail.value })
  },

  chooseImage() {
    const { imageUrls } = this.data
    if (imageUrls.length >= 3) {
      wx.showToast({ title: '最多上传3张', icon: 'none' })
      return
    }

    wx.chooseMedia({
      count: 3 - imageUrls.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(f => f.tempFilePath)
        this.uploadImages(tempFiles)
      }
    })
  },

  async uploadImages(tempFiles) {
    this.setData({ uploading: true })
    const uploadedUrls = []

    for (const tempFile of tempFiles) {
      try {
        const result = await wx.cloud.uploadFile({
          cloudPath: `verification/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
          filePath: tempFile
        })
        uploadedUrls.push(result.fileID)
      } catch (err) {
        console.error('图片上传失败:', err)
        wx.showToast({ title: '图片上传失败', icon: 'none' })
      }
    }

    this.setData({
      imageUrls: [...this.data.imageUrls, ...uploadedUrls],
      uploading: false
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const imageUrls = [...this.data.imageUrls]
    imageUrls.splice(index, 1)
    this.setData({ imageUrls })
  },

  async submitForm() {
    const { selectedType, realName, idNumber, imageUrls } = this.data

    if (!selectedType) {
      wx.showToast({ title: '请选择认证类型', icon: 'none' })
      return
    }
    if (!realName.trim()) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' })
      return
    }
    if (!idNumber.trim()) {
      wx.showToast({ title: '请输入证件号', icon: 'none' })
      return
    }
    if (imageUrls.length === 0) {
      wx.showToast({ title: '请上传证件照片', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'submitVerification',
        data: {
          type: selectedType,
          realName: realName.trim(),
          idNumber: idNumber.trim(),
          imageUrls
        }
      })

      if (res.result.success) {
        wx.hideLoading()
        wx.showToast({ title: '提交成功', icon: 'success' })
        // Reset form and reload status
        this.setData({
          selectedType: '',
          realName: '',
          idNumber: '',
          imageUrls: [],
          submitting: false
        })
        setTimeout(() => this.loadStatus(), 1500)
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  },

  reapply() {
    this.setData({
      status: null,
      selectedType: '',
      realName: '',
      idNumber: '',
      imageUrls: []
    })
  }
})
```

- [ ] **Step 3: Write verification.wxml template**

```xml
<!-- miniprogram/pages/verification/verification.wxml -->
<view class="container">
  <!-- 状态显示区 -->
  <view class="status-card" wx:if="{{status !== null}}">
    <view class="status-icon">
      {{status === 1 ? '✅' : status === 0 ? '⏳' : '❌'}}
    </view>
    <text class="status-title">{{statusText}}</text>
    <text class="status-desc" wx:if="{{status === 0}}">审核通常在1-2个工作日内完成，请耐心等待</text>
    <text class="status-desc" wx:if="{{status === 2}}">{{reason}}</text>
    <text class="status-desc" wx:if="{{status === 1}}">您的身份已通过认证</text>
    
    <button class="reapply-btn" wx:if="{{status === 2}}" bindtap="reapply">
      重新申请
    </button>
  </view>

  <!-- 表单区域 -->
  <view class="form-card" wx:if="{{status !== 1 && status !== 0}}">
    <view class="section-title">选择认证类型</view>
    <view class="type-options">
      <view 
        class="type-option {{selectedType === item.value ? 'selected' : ''}}"
        wx:for="{{typeOptions}}" 
        wx:key="value"
        data-type="{{item.value}}"
        bindtap="selectType"
      >
        <text class="type-icon">{{item.icon}}</text>
        <text class="type-label">{{item.label}}</text>
      </view>
    </view>

    <view class="section-title">填写信息</view>
    
    <view class="form-group">
      <text class="label">真实姓名</text>
      <input 
        class="input" 
        placeholder="请输入真实姓名" 
        value="{{realName}}"
        bindinput="onNameInput"
      />
    </view>

    <view class="form-group">
      <text class="label">证件号码</text>
      <input 
        class="input" 
        placeholder="请输入证件号码" 
        value="{{idNumber}}"
        bindinput="onIdInput"
      />
    </view>

    <view class="section-title">上传证件照片</view>
    <view class="image-upload-area">
      <view class="uploaded-images">
        <view class="image-item" wx:for="{{imageUrls}}" wx:key="*this">
          <image src="{{item}}" mode="aspectFill" />
          <view class="remove-btn" data-index="{{index}}" bindtap="removeImage">×</view>
        </view>
      </view>
      <view class="add-image-btn" bindtap="chooseImage" wx:if="{{imageUrls.length < 3}}">
        <text class="add-icon">+</text>
        <text class="add-text">添加照片</text>
      </view>
    </view>
    <text class="image-hint">请上传清晰的证件照片，支持最多3张</text>

    <button 
      class="submit-btn {{submitting ? 'disabled' : ''}}" 
      bindtap="submitForm"
      disabled="{{submitting}}"
    >
      {{submitting ? '提交中...' : '提交认证'}}
    </button>
  </view>

  <!-- 历史记录 -->
  <view class="history-card" wx:if="{{history.length > 0}}">
    <view class="section-title">认证历史</view>
    <view class="history-list">
      <view class="history-item" wx:for="{{history}}" wx:key="_id">
        <view class="history-type">{{item.type === 'idCard' ? '身份证' : item.type === 'student' ? '学生证' : '教师资格证'}}</view>
        <view class="history-status {{item.status === 1 ? 'approved' : item.status === 0 ? 'pending' : 'rejected'}}">
          {{item.status === 1 ? '已通过' : item.status === 0 ? '审核中' : '已拒绝'}}
        </view>
        <view class="history-date">{{item.createTime}}</view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 4: Write verification.wxss styles**

```css
/* miniprogram/pages/verification/verification.wxss */
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.status-card {
  background: white;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.status-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.status-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.status-desc {
  font-size: 28rpx;
  color: #999;
  line-height: 1.5;
  display: block;
}

.reapply-btn {
  margin-top: 40rpx;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 60rpx;
  font-size: 30rpx;
}

.form-card {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.type-options {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.type-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.type-option.selected {
  border-color: #007aff;
  background: #f0f7ff;
}

.type-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.type-label {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.form-group {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
  border-radius: 8rpx;
  overflow: hidden;
}

.image-item image {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.add-image-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ccc;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.add-icon {
  font-size: 48rpx;
  color: #ccc;
}

.add-text {
  font-size: 22rpx;
  color: #999;
}

.image-hint {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
}

.submit-btn.disabled {
  background: #ccc;
}

.history-card {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.history-type {
  font-size: 28rpx;
  color: #333;
}

.history-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.history-status.approved {
  background: #e8f5e9;
  color: #4caf50;
}

.history-status.pending {
  background: #fff8e1;
  color: #ff9800;
}

.history-status.rejected {
  background: #ffebee;
  color: #f44336;
}

.history-date {
  font-size: 24rpx;
  color: #999;
}
```

- [ ] **Step 5: Test the page**

Run: In WeChat Developer Tools, navigate to `pages/verification/verification`
Expected: Form renders correctly, image upload works, submission flow works

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/verification/verification.js miniprogram/pages/verification/verification.wxml miniprogram/pages/verification/verification.wxss miniprogram/app.json
git commit -m "feat: add verification page with image upload"
```

---

### Task 9: Update Profile Page Entry Points

**Files:**
- Modify: `miniprogram/pages/profile/profile.wxml`
- Modify: `miniprogram/pages/profile/profile.js`

- [ ] **Step 1: Add menu items to profile.wxml**

```xml
<!-- Find the menu list in profile.wxml and add these items BEFORE "退出登录": -->

<view class="menu-item" bindtap="goToReviews">
  <text class="menu-icon">💬</text>
  <text class="menu-text">我的评价</text>
  <text class="menu-arrow">></text>
</view>

<view class="menu-item" bindtap="goToVerification">
  <text class="menu-icon">🪪</text>
  <text class="menu-text">认证中心</text>
  <text class="menu-badge" wx:if="{{!isVerified}}">去认证</text>
  <text class="menu-arrow">></text>
</view>
```

- [ ] **Step 2: Add navigation methods to profile.js**

```javascript
// In pages/profile/profile.js:

goToReviews() {
  wx.navigateTo({ url: '/pages/reviews/reviews' })
},

goToVerification() {
  wx.navigateTo({ url: '/pages/verification/verification' })
},

// Also load verification status on page load:
async loadVerificationStatus() {
  const userInfo = wx.getStorageSync('userInfo') || {}
  if (!userInfo._id) return

  try {
    const res = await wx.cloud.callFunction({
      name: 'getVerificationStatus',
      data: { userId: userInfo._id }
    })
    if (res.result.success) {
      this.setData({ isVerified: res.result.data.overallVerified })
    }
  } catch (err) {
    console.error('加载认证状态失败:', err)
  }
}

// Call loadVerificationStatus() in onLoad
```

- [ ] **Step 3: Add badge styles to profile.wxss**

```css
.menu-badge {
  background: #ff3b30;
  color: white;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-right: 8rpx;
}
```

- [ ] **Step 4: Test navigation**

Run: Go to profile page, click "我的评价" and "认证中心"
Expected: Navigate to correct pages

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/profile/profile.wxml miniprogram/pages/profile/profile.js miniprogram/pages/profile/profile.wxss
git commit -m "feat: add review and verification entry points to profile"
```

---

### Task 10: Full Smoke Test & Documentation

**Files:**
- None (testing only)

- [ ] **Step 1: Deploy all cloud functions**

Run: Deploy all cloud functions to cloud environment:
- `initDB`
- `createReview`
- `getReviewList`
- `submitVerification`
- `getVerificationStatus`

- [ ] **Step 2: Run initDB to create collections**

Run: `wx.cloud.callFunction({ name: 'initDB' })`
Expected: Collections Reviews and Verifications created

- [ ] **Step 3: Full review flow test**

1. Register as parent
2. Create a review for a tutor
3. Verify review appears in Reviews collection
4. Navigate to tutor's reviews page
5. Verify average rating is correct
6. Verify rating shows on index page tutor cards

- [ ] **Step 4: Full verification flow test**

1. Register as tutor
2. Navigate to Verification page
3. Submit ID card verification
4. Verify record created in Verifications collection
5. Verify "审核中" status shows on page
6. Manually approve in database (set status=1)
7. Refresh page and verify "已认证" badge shows
8. Verify profile page badge updates

- [ ] **Step 5: Edge case tests**

- [ ] Test duplicate verification submission (should fail)
- [ ] Test rating validation (0 and 6 should fail)
- [ ] Test empty review list state
- [ ] Test image upload with network failure

- [ ] **Step 6: Final commit of all changes**

```bash
git add -A
git commit -m "feat: complete Phase 1 - Review and Verification systems"
```

---

## Deployment Notes

**Cloud Function Deployment Order:**
1. `initDB` - Always first to ensure collections exist
2. `getReviewList`, `getVerificationStatus` - Read-only functions
3. `createReview`, `submitVerification` - Write functions

**Environment Configuration:**
- Ensure `cloud.DYNAMIC_CURRENT_ENV` is used (not hardcoded env ID)
- Verify cloud storage has `verification/` folder permissions
- Check database permissions: All users can read Reviews, only creator can write

**Rollback Procedure:**
If issues arise:
1. Comment out profile page menu items (quickest UI disable)
2. Cloud functions can remain deployed (just unused)
3. Collections can stay (data preservation)
