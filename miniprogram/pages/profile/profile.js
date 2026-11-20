const app = getApp();

Page({
  data: {
    userInfo: {},
    userRole: '',
    isMember: false,
    memberExpire: '',
    isVerified: false,
    stats: {
      views: 128,
      likes: 16,
      orders: 3
    }
  },

  onLoad() {
    this.loadVerificationStatus();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }

    const userInfo = wx.getStorageSync('userInfo') || {}
    const isMember = wx.getStorageSync('isMember') || false
    const memberExpire = wx.getStorageSync('memberExpire') || ''

    this.setData({
      userInfo: { ...userInfo, nickName: userInfo.nickName || userInfo.realName || '用户' },
      userRole: userInfo.role || '',
      isMember,
      memberExpire
    })
  },

  // 加载认证状态
  loadVerificationStatus() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    wx.cloud.callFunction({
      name: 'getVerificationStatus',
      data: { userId: userInfo._id },
      success: (res) => {
        this.setData({
          isVerified: res.result.data?.overallVerified || false
        });
      },
      fail: (err) => {
        console.error('获取认证状态失败:', err);
        // 降级使用本地存储
        this.setData({
          isVerified: userInfo.certified || false
        });
      }
    });
  },

  // 我的发布
  goMyPublish() {
    wx.navigateTo({ url: '/pages/my-publish/my-publish' });
  },

  // 我的订单
  goOrders() {
    wx.navigateTo({ url: '/pages/my-orders/my-orders' });
  },

  // 会员中心
  goMember() {
    wx.showModal({
      title: '会员中心',
      content: '🔥 会员特权\n\n✅ 无限查看联系方式\n✅ 优先推荐曝光\n✅ 专属客服服务\n\n月卡: ¥29.9\n年卡: ¥199',
      confirmText: '开通会员',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '模拟开通成功', icon: 'success' });
          wx.setStorageSync('isMember', true);
          this.setData({ isMember: true });
        }
      }
    });
  },

  // 我的评价
  goToReviews() {
    wx.navigateTo({ url: '/pages/reviews/reviews' });
  },

  // 认证中心
  goToVerification() {
    wx.navigateTo({ url: '/pages/verification/verification' })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  }
})
