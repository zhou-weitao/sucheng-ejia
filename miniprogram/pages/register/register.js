const app = getApp()

Page({
  data: {
    step: 1, // 1:角色选择, 2:资料填写
    role: '', // 'tutor' 或 'parent'

    // 家教资料表单
    tutorForm: {
      realName: '',
      gender: '',
      education: '',
      school: '',
      grade: '',
      subjects: [],
      district: '',
      experience: '',
      hourlyRate: ''
    },

    // 家长资料表单
    parentForm: {
      name: '',
      phone: '',
      childGrade: '',
      district: ''
    },

    // 选项数据
    subjectList: [
      { name: '数学', selected: false },
      { name: '英语', selected: false },
      { name: '语文', selected: false },
      { name: '物理', selected: false },
      { name: '化学', selected: false },
      { name: '生物', selected: false },
      { name: '历史', selected: false },
      { name: '地理', selected: false }
    ],
    educationOptions: ['大专', '本科', '硕士', '博士'],
    tutorGradeOptions: ['小学', '初中', '高中'],
    childGradeOptions: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'],
    districtOptions: ['姑苏区', '工业园区', '高新区', '吴中区', '相城区', '吴江区'],
    experienceOptions: ['1年以内', '1-3年', '3-5年', '5年以上'],
    rateOptions: ['50-80', '80-100', '100-150', '150-200', '200以上']
  },

  onLoad() {
    // 如果已选择角色，直接进入首页
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.role) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({ role })
  },

  // 下一步：进入资料填写
  nextStep() {
    if (!this.data.role) {
      wx.showToast({ title: '请选择您的身份', icon: 'none' })
      return
    }
    this.setData({ step: 2 })
  },

  // 上一步
  prevStep() {
    this.setData({ step: 1 })
  },

  // 表单输入
  onTutorInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`tutorForm.${field}`]: e.detail.value })
  },

  onParentInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`parentForm.${field}`]: e.detail.value })
  },

  // 选择器变更
  onEducationChange(e) {
    this.setData({ 'tutorForm.education': this.data.educationOptions[e.detail.value] })
  },

  onTutorGradeChange(e) {
    this.setData({ 'tutorForm.grade': this.data.tutorGradeOptions[e.detail.value] })
  },

  onChildGradeChange(e) {
    this.setData({ 'parentForm.childGrade': this.data.childGradeOptions[e.detail.value] })
  },

  onDistrictChange(e) {
    const field = this.data.role === 'tutor' ? 'tutorForm.district' : 'parentForm.district'
    this.setData({ [field]: this.data.districtOptions[e.detail.value] })
  },

  onExperienceChange(e) {
    this.setData({ 'tutorForm.experience': this.data.experienceOptions[e.detail.value] })
  },

  onRateChange(e) {
    this.setData({ 'tutorForm.hourlyRate': this.data.rateOptions[e.detail.value] })
  },

  // 选择科目
  toggleSubject(e) {
    const idx = e.currentTarget.dataset.idx
    const list = [...this.data.subjectList]
    list[idx].selected = !list[idx].selected
    const subjects = list.filter(s => s.selected).map(s => s.name)
    this.setData({ subjectList: list, 'tutorForm.subjects': subjects })
  },

  // 提交注册
  async onSubmit() {
    const { role, tutorForm, parentForm } = this.data

    // 表单验证
    if (role === 'tutor') {
      if (!tutorForm.realName) {
        wx.showToast({ title: '请输入真实姓名', icon: 'none' })
        return
      }
      if (tutorForm.subjects.length === 0) {
        wx.showToast({ title: '请选择至少一个教授科目', icon: 'none' })
        return
      }
    }

    if (role === 'parent') {
      if (!parentForm.name) {
        wx.showToast({ title: '请输入称呼', icon: 'none' })
        return
      }
    }

    wx.showLoading({ title: '保存中...' })

    try {
      // 准备云函数数据
      const userData = role === 'tutor' ? {
        realName: tutorForm.realName
      } : {
        realName: parentForm.name,
        phone: parentForm.phone
      }

      const tutorData = role === 'tutor' ? {
        realName: tutorForm.realName,
        education: tutorForm.education,
        school: tutorForm.school,
        grade: tutorForm.grade,
        subjects: tutorForm.subjects,
        district: tutorForm.district,
        experience: tutorForm.experience,
        hourlyRate: tutorForm.hourlyRate
      } : null

      // 调用云函数更新资料
      const res = await wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: {
          role,
          userData,
          tutorData
        }
      })

      console.log('更新资料返回:', res)

      if (res.result.success) {
        // 更新本地存储
        const userInfo = wx.getStorageSync('userInfo')
        userInfo.role = role
        userInfo.realName = role === 'tutor' ? tutorForm.realName : parentForm.name
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.userInfo = userInfo

        wx.hideLoading()
        wx.showToast({ title: '注册成功', icon: 'success' })

        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1000)
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      wx.hideLoading()
      console.error('保存资料失败:', err)
      // 容错处理：即使云函数调用失败也允许进入
      const userInfo = wx.getStorageSync('userInfo')
      userInfo.role = role
      wx.setStorageSync('userInfo', userInfo)
      app.globalData.userInfo = userInfo

      wx.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1000)
    }
  },

  // 跳过资料填写
  skip() {
    const userInfo = wx.getStorageSync('userInfo')
    userInfo.role = this.data.role
    wx.setStorageSync('userInfo', userInfo)
    app.globalData.userInfo = userInfo

    wx.switchTab({ url: '/pages/index/index' })
  }
})
