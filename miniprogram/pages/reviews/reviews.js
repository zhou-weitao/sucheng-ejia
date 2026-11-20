const app = getApp()

Page({
  data: {
    userId: '',
    list: [],
    averageRating: 0,
    totalReviews: 0,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true,
    empty: false,
    isRefreshing: false
  },

  onLoad(options) {
    // 从 options 或本地存储获取 userId
    const userId = options.userId || wx.getStorageSync('userInfo')._id || ''
    this.setData({ userId })
    this.loadReviews()
  },

  onPullDownRefresh() {
    this.setData({ isRefreshing: true })
    this.loadReviews(true).then(() => {
      wx.stopPullDownRefresh()
      this.setData({ isRefreshing: false })
    })
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadReviews(false, true)
  },

  async loadReviews(isRefresh = false, isLoadMore = false) {
    if (isRefresh) {
      this.setData({ page: 1, hasMore: true, list: [] })
    }

    this.setData({ loading: true })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getReviewList',
        data: {
          userId: this.data.userId,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      if (res.result.success) {
        const { list, total, averageRating } = res.result.data
        const formattedList = list.map(item => ({
          ...item,
          starArray: this.getStarArray(item.rating),
          formattedDate: this.formatDate(item.createTime)
        }))

        const newList = isLoadMore ? [...this.data.list, ...formattedList] : formattedList

        // 计算各星级评分条宽度
        const allReviews = this.data.list.concat(formattedList)
        const ratingCounts = [0, 0, 0, 0, 0, 0] // index 0 unused, 1-5 for star ratings
        allReviews.forEach(r => {
          const star = Math.floor(r.rating)
          if (star >= 1 && star <= 5) {
            ratingCounts[star]++
          }
        })

        const ratingBarWidths = {}
        for (let i = 1; i <= 5; i++) {
          ratingBarWidths[i] = total > 0 ? Math.round((ratingCounts[i] / total) * 100) : 0
        }

        this.setData({
          list: newList,
          totalReviews: total,
          averageRating: averageRating || 0,
          ratingBarWidths,
          empty: newList.length === 0,
          hasMore: newList.length < total,
          loading: false
        })
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('加载评价列表失败', err)
      this.setData({
        list: [],
        empty: true,
        loading: false
      })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  getStarArray(rating) {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('full')
      } else if (i === fullStars && hasHalfStar) {
        stars.push('half')
      } else {
        stars.push('empty')
      }
    }
    return stars
  },

  formatDate(timestamp) {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    if (year === now.getFullYear()) {
      return `${month}月${day}日`
    }
    return `${year}年${month}月${day}日`
  },

  goBack() {
    wx.navigateBack()
  }
})
