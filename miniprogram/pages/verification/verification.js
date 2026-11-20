const app = getApp()

Page({
  data: {
    // 认证类型: idCard, student, teacherQual
    selectedType: 'idCard',
    typeList: [
      { key: 'idCard', name: '身份证认证', icon: '🪪', desc: '基础身份认证' },
      { key: 'student', name: '学生证认证', icon: '🎓', desc: '学生身份验证' },
      { key: 'teacherQual', name: '教师资格证', icon: '📜', desc: '教师资质认证' }
    ],

    // 表单数据
    formData: {
      realName: '',
      idNumber: '',
      imageUrls: []
    },

    // 认证状态: 0待审核, 1已通过, 2已拒绝
    status: null,
    statusText: '',
    rejectReason: '',

    // 历史记录
    historyList: [],

    submitting: false,
    uploading: false
  },

  onLoad() {
    this.loadVerificationStatus()
  },

  onPullDownRefresh() {
    this.loadVerificationStatus().then(() => wx.stopPullDownRefresh())
  },

  // 加载认证状态 - 从 getVerificationStatus 获取包含历史记录
  async loadVerificationStatus() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {}
      const res = await wx.cloud.callFunction({
        name: 'getVerificationStatus',
        data: { userId: userInfo._id }
      })

      if (res.result.success && res.result.data) {
        const { idCardStatus, latest, history } = res.result.data

        this.setData({
          status: idCardStatus,
          statusText: this.getStatusText(idCardStatus),
          selectedType: latest?.type || 'idCard',
          rejectReason: latest?.rejectReason || '',
          historyList: (history || []).map(item => ({
            ...item,
            statusText: this.getStatusText(item.status),
            formattedTime: this.formatTime(item.createTime)
          }))
        })
      }
    } catch (err) {
      console.error('加载认证状态失败', err)
    }
  },

  getStatusText(status) {
    const map = { 0: '审核中', 1: '已通过', 2: '已拒绝' }
    return map[status] || '未提交'
  },

  formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  },

  // 选择认证类型
  selectType(e) {
    if (this.data.status === 0) {
      wx.showToast({ title: '认证审核中，无法修改', icon: 'none' })
      return
    }
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type,
      'formData.imageUrls': []
    })
  },

  // 输入真实姓名
  onNameInput(e) {
    this.setData({ 'formData.realName': e.detail.value })
  },

  // 输入证件号码
  onIdNumberInput(e) {
    this.setData({ 'formData.idNumber': e.detail.value })
  },

  // 选择图片
  chooseImage() {
    if (this.data.status === 0) {
      wx.showToast({ title: '认证审核中，无法修改', icon: 'none' })
      return
    }

    const { imageUrls } = this.data.formData
    const maxCount = 3 - imageUrls.length

    if (maxCount <= 0) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' })
      return
    }

    wx.chooseMedia({
      count: maxCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(f => f.tempFilePath)
        this.uploadImages(tempFiles)
      }
    })
  },

  // 上传图片到云存储
  async uploadImages(filePaths) {
    this.setData({ uploading: true })
    wx.showLoading({ title: '上传中...' })

    try {
      const uploadPromises = filePaths.map((filePath, index) => {
        const cloudPath = `verification/${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}.jpg`
        return wx.cloud.uploadFile({ cloudPath, filePath })
      })

      const results = await Promise.all(uploadPromises)
      const newUrls = results.map(r => r.fileID)
      const imageUrls = [...this.data.formData.imageUrls, ...newUrls]

      this.setData({ 'formData.imageUrls': imageUrls })
    } catch (err) {
      console.error('图片上传失败', err)
      wx.showToast({ title: '图片上传失败', icon: 'none' })
    } finally {
      this.setData({ uploading: false })
      wx.hideLoading()
    }
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const imageUrls = [...this.data.formData.imageUrls]
    imageUrls.splice(index, 1)
    this.setData({ 'formData.imageUrls': imageUrls })
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const { imageUrls } = this.data.formData
    wx.previewImage({
      current: imageUrls[index],
      urls: imageUrls
    })
  },

  // 提交认证
  async submitForm() {
    const { realName, idNumber, imageUrls } = this.data.formData
    const { selectedType } = this.data

    if (!realName.trim()) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' })
      return
    }

    if (!idNumber.trim()) {
      wx.showToast({ title: '请输入证件号码', icon: 'none' })
      return
    }

    if (imageUrls.length === 0) {
      wx.showToast({ title: '请上传证件图片', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      const userInfo = wx.getStorageSync('userInfo') || {}
      const res = await wx.cloud.callFunction({
        name: 'submitVerification',
        data: {
          userId: userInfo._id,
          type: selectedType,
          realName: realName.trim(),
          idNumber: idNumber.trim(),
          imageUrls
        }
      })

      if (res.result.success) {
        wx.hideLoading()
        wx.showToast({ title: '提交成功，等待审核', icon: 'success' })
        this.setData({ status: 0, statusText: '审核中' })
        this.loadHistory()
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      wx.hideLoading()
      console.error('提交失败', err)
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 重新申请 - 重置表单
  reapply() {
    wx.showModal({
      title: '提示',
      content: '确定要重新申请认证吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            status: null,
            statusText: '',
            rejectReason: '',
            formData: {
              realName: '',
              idNumber: '',
              imageUrls: []
            }
          })
        }
      }
    })
  }
})
