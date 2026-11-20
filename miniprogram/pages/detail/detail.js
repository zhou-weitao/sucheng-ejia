const app = getApp()

Page({
  data: {
    item: {},
    isMember: false,
    contactUnlocked: false,
    userRole: 'parent',
    reviewCount: 0
  },

  onLoad() {
    const item = wx.getStorageSync('detailItem') || {}
    const isMember = wx.getStorageSync('isMember') || false
    const userInfo = wx.getStorageSync('userInfo') || {}

    // 检查是否已解锁过该联系方式
    const unlockedContacts = wx.getStorageSync('unlockedContacts') || []
    const isUnlocked = unlockedContacts.includes(item._id)

    this.setData({
      item,
      isMember,
      contactUnlocked: isUnlocked,
      userRole: userInfo.role || 'parent'
    })

    wx.setNavigationBarTitle({
      title: item.name || item.nickName || '详情'
    })

    // 加载评价数量
    this.loadReviewCount()
  },

  async loadReviewCount() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getReviewList',
        data: {
          userId: this.data.item._id,
          page: 1,
          pageSize: 1
        }
      })

      if (res.result.success) {
        this.setData({
          reviewCount: res.result.data.total || 0
        })
      }
    } catch (err) {
      console.error('加载评价数量失败', err)
    }
  },

  goToReviews() {
    wx.navigateTo({
      url: `/pages/reviews/reviews?userId=${this.data.item._id}`
    })
  },

  onContact() {
    console.log('点击解锁联系方式', this.data)
    const { isMember, contactUnlocked } = this.data

    // 已解锁直接显示
    if (contactUnlocked) {
      wx.showToast({ title: '联系方式已解锁', icon: 'none' })
      return
    }

    // 会员直接解锁
    if (isMember) {
      this.unlockContact()
      wx.showToast({ title: '解锁成功', icon: 'success' })
      return
    }

    // 非会员显示支付弹窗
    wx.showModal({
      title: '会员专享',
      content: '开通会员后可无限查看所有老师/家长联系方式\n\n🔥 会员价格：\n月卡  ¥29.9\n年卡  ¥199',
      confirmText: '开通会员',
      cancelText: '单次解锁 ¥9.9',
      success: (res) => {
        if (res.confirm) {
          this.processPayment('vip_month')
        } else {
          this.processPayment('single_unlock')
        }
      },
      fail: (err) => {
        console.error('showModal失败', err)
        // 兜底直接解锁
        this.unlockContact()
        wx.showToast({ title: '已解锁', icon: 'success' })
      }
    })
  },

  processPayment(type) {
    wx.showLoading({ title: '支付中...' })

    // 模拟支付流程
    setTimeout(() => {
      wx.hideLoading()

      // 生成订单记录
      const order = {
        _id: 'ORD' + Date.now(),
        type: type,
        amount: type === 'vip_month' ? 29.9 : 9.9,
        status: 'paid',
        itemName: type === 'vip_month' ? '会员月卡' : '联系方式解锁',
        createTime: new Date().toLocaleString()
      }

      // 保存订单记录
      const orders = wx.getStorageSync('orders') || []
      orders.unshift(order)
      wx.setStorageSync('orders', orders)

      if (type === 'vip_month') {
        // 开通会员
        wx.setStorageSync('isMember', true)
        wx.setStorageSync('memberExpire', Date.now() + 30 * 24 * 60 * 60 * 1000)
        this.setData({ isMember: true, contactUnlocked: true })
        wx.showToast({ title: '会员开通成功', icon: 'success' })
      } else {
        // 单次解锁
        this.unlockContact()
        wx.showToast({ title: '支付成功，已解锁', icon: 'success' })
      }
    }, 1200)
  },

  unlockContact() {
    // 记录已解锁的联系方式
    const unlockedContacts = wx.getStorageSync('unlockedContacts') || []
    if (!unlockedContacts.includes(this.data.item._id)) {
      unlockedContacts.push(this.data.item._id)
      wx.setStorageSync('unlockedContacts', unlockedContacts)
    }
    this.setData({ contactUnlocked: true })
  },

  // 复制联系方式
  onCopyPhone() {
    const phone = this.data.item.phone || '138****8888'
    wx.setClipboardData({
      data: phone,
      success: () => {
        wx.showToast({ title: '手机号已复制', icon: 'success' })
      }
    })
  },

  // 复制微信
  onCopyWechat() {
    const wechat = this.data.item.wechat || 'wechat_001'
    wx.setClipboardData({
      data: wechat,
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' })
      }
    })
  }
})
