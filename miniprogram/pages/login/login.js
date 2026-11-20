const app = getApp()

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 检查是否已登录
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userInfo')
    if (openid && userInfo) {
      app.globalData.openid = openid
      app.globalData.userInfo = userInfo
      // 已选择角色，直接进入首页
      if (userInfo.role) {
        wx.switchTab({ url: '/pages/index/index' })
      } else {
        // 未选择角色，进入角色选择
        wx.navigateTo({ url: '/pages/register/register' })
      }
    }
  },

  // 微信快捷登录
  async onLogin(e) {
    if (this.data.loading) return

    this.setData({ loading: true })
    wx.showLoading({ title: '登录中...' })

    try {
      // 1. wx.login 获取code
      const loginRes = await wx.login()
      console.log('wx.login:', loginRes)

      // 2. 获取用户信息 - 优先使用按钮 open-type 传入的
      let userInfo = e && e.detail && e.detail.userInfo

      // 3. 如果按钮没有获取到，尝试调用 getUserProfile
      if (!userInfo && wx.getUserProfile) {
        try {
          const profileRes = await wx.getUserProfile({
            desc: '用于完善用户资料'
          })
          userInfo = profileRes.userInfo
        } catch (err) {
          console.error('用户拒绝授权', err)
          throw new Error('需要授权才能继续使用')
        }
      }

      // 兜底信息
      if (!userInfo) {
        userInfo = { nickName: '家教用户', avatarUrl: '' }
      }

      console.log('userInfo:', userInfo)

      // 3. 调用登录云函数
      const cloudRes = await wx.cloud.callFunction({
        name: 'login',
        data: { userInfo }
      })

      console.log('登录云函数返回:', cloudRes)

      if (cloudRes.result.success) {
        const { user, openid, isNewUser } = cloudRes.result.data

        // 保存到全局状态
        app.globalData.openid = openid
        app.globalData.userInfo = user

        // 本地持久化存储
        wx.setStorageSync('openid', openid)
        wx.setStorageSync('userInfo', user)

        wx.hideLoading()

        if (isNewUser || !user.role) {
          // 新用户或未选择角色 → 进入角色选择页
          wx.navigateTo({ url: '/pages/register/register' })
        } else {
          // 已有角色 → 进入首页
          wx.switchTab({ url: '/pages/index/index' })
        }
      } else {
        throw new Error(cloudRes.result.message)
      }
    } catch (err) {
      wx.hideLoading()
      console.error('登录失败:', err)
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 初始化演示数据
  async onInitData() {
    wx.showLoading({ title: '初始化中...' })
    try {
      await wx.cloud.callFunction({ name: 'initDB' })
      wx.hideLoading()
      wx.showToast({ title: '数据初始化成功', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '初始化失败', icon: 'none' })
    }
  }
})
