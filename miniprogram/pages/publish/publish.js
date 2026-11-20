const app = getApp()

Page({
  data: {
    userRole: '',

    // 共用选项
    subjectList: [
      { name: '数学', selected: false },
      { name: '英语', selected: false },
      { name: '语文', selected: false },
      { name: '物理', selected: false },
      { name: '化学', selected: false },
      { name: '生物', selected: false },
      { name: '历史', selected: false },
      { name: '地理', selected: false },
      { name: '政治', selected: false }
    ],
    districtOptions: ['姑苏区', '工业园区', '高新区', '吴中区', '相城区', '吴江区', '昆山市', '常熟市', '张家港市', '太仓市'],
    timeOptions: ['周一至周五白天', '周一至周五晚上', '周末白天', '周末晚上', '灵活安排'],

    // 家长专用
    parentGradeOptions: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'],
    budgetOptions: ['50-80元/小时', '80-100元/小时', '100-150元/小时', '150-200元/小时', '200元以上/小时'],
    parentForm: {
      grade: '',
      district: '',
      subjects: [],
      time: '',
      budget: '',
      description: ''
    },

    // 老师专用
    tutorGradeOptions: ['小学', '初中', '高中'],
    educationOptions: ['大专', '本科', '硕士', '博士'],
    rateOptions: ['50-80', '80-100', '100-150', '150-200', '200以上'],
    tutorForm: {
      realName: '',
      education: '',
      school: '',
      grade: '',
      district: '',
      subjects: [],
      experience: '',
      hourlyRate: '',
      description: ''
    },

    submitting: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }

    const userInfo = wx.getStorageSync('userInfo') || {}
    const role = userInfo.role || 'parent'
    this.setData({ userRole: role })
  },

  // 家长表单
  toggleParentSubject(e) {
    const idx = e.currentTarget.dataset.idx
    const list = [...this.data.subjectList]
    list[idx].selected = !list[idx].selected
    const subjects = list.filter(s => s.selected).map(s => s.name)
    this.setData({ subjectList: list, 'parentForm.subjects': subjects })
  },

  onParentGradeChange(e) {
    this.setData({ 'parentForm.grade': this.data.parentGradeOptions[e.detail.value] })
  },

  onParentDistrictChange(e) {
    this.setData({ 'parentForm.district': this.data.districtOptions[e.detail.value] })
  },

  onParentTimeChange(e) {
    this.setData({ 'parentForm.time': this.data.timeOptions[e.detail.value] })
  },

  onParentBudgetChange(e) {
    this.setData({ 'parentForm.budget': this.data.budgetOptions[e.detail.value] })
  },

  onParentDescInput(e) {
    this.setData({ 'parentForm.description': e.detail.value })
  },

  // 老师表单
  onTutorNameInput(e) {
    this.setData({ 'tutorForm.realName': e.detail.value })
  },

  onTutorSchoolInput(e) {
    this.setData({ 'tutorForm.school': e.detail.value })
  },

  toggleTutorSubject(e) {
    const idx = e.currentTarget.dataset.idx
    const list = [...this.data.subjectList]
    list[idx].selected = !list[idx].selected
    const subjects = list.filter(s => s.selected).map(s => s.name)
    this.setData({ subjectList: list, 'tutorForm.subjects': subjects })
  },

  onTutorGradeChange(e) {
    this.setData({ 'tutorForm.grade': this.data.tutorGradeOptions[e.detail.value] })
  },

  onTutorDistrictChange(e) {
    this.setData({ 'tutorForm.district': this.data.districtOptions[e.detail.value] })
  },

  onTutorEducationChange(e) {
    this.setData({ 'tutorForm.education': this.data.educationOptions[e.detail.value] })
  },

  onTutorExperienceChange(e) {
    this.setData({ 'tutorForm.experience': this.data.timeOptions[e.detail.value] })
  },

  onTutorRateChange(e) {
    this.setData({ 'tutorForm.hourlyRate': this.data.rateOptions[e.detail.value] })
  },

  onTutorDescInput(e) {
    this.setData({ 'tutorForm.description': e.detail.value })
  },

  // 发布家长需求
  async submitParent() {
    const { grade, district, subjects, time, budget, description } = this.data.parentForm

    if (!grade) { wx.showToast({ title: '请选择孩子年级', icon: 'none' }); return }
    if (!district) { wx.showToast({ title: '请选择所在区域', icon: 'none' }); return }
    if (subjects.length === 0) { wx.showToast({ title: '请选择至少一个辅导科目', icon: 'none' }); return }
    if (!time) { wx.showToast({ title: '请选择上课时间', icon: 'none' }); return }
    if (!budget) { wx.showToast({ title: '请选择预算范围', icon: 'none' }); return }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    try {
      const userInfo = wx.getStorageSync('userInfo')
      const res = await wx.cloud.callFunction({
        name: 'publishRequirement',
        data: {
          parentId: userInfo._id,
          parentName: userInfo.realName || '家长用户',
          childGrade: grade,
          district,
          subjects,
          timeAvailability: time,
          budgetRange: budget,
          description: description || '',
          status: 'open'
        }
      })

      if (res.result.success) {
        wx.hideLoading()
        wx.showToast({ title: '发布成功', icon: 'success' })
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000)
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 发布老师简历
  async submitTutor() {
    const { realName, education, school, grade, district, subjects, experience, hourlyRate, description } = this.data.tutorForm

    if (!realName) { wx.showToast({ title: '请输入真实姓名', icon: 'none' }); return }
    if (!district) { wx.showToast({ title: '请选择所在区域', icon: 'none' }); return }
    if (subjects.length === 0) { wx.showToast({ title: '请选择至少一个辅导科目', icon: 'none' }); return }
    if (!hourlyRate) { wx.showToast({ title: '请选择期望薪资', icon: 'none' }); return }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    try {
      const userInfo = wx.getStorageSync('userInfo')
      const res = await wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: {
          role: 'tutor',
          userData: { realName },
          tutorData: {
            realName,
            education: education || '',
            school: school || '',
            grade,
            district,
            subjects,
            experience: experience || '',
            hourlyRate,
            selfIntro: description || ''
          }
        }
      })

      if (res.result.success) {
        wx.hideLoading()
        wx.showToast({ title: '发布成功', icon: 'success' })

        // 同步本地存储的用户信息
        const userInfo = wx.getStorageSync('userInfo') || {}
        userInfo.role = 'tutor'
        userInfo.realName = this.data.tutorForm.realName
        wx.setStorageSync('userInfo', userInfo)

        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000)
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      wx.hideLoading()
      console.error('发布失败:', err)
      wx.showToast({ title: '发布失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  onSubmit() {
    if (this.data.userRole === 'tutor') {
      this.submitTutor()
    } else {
      this.submitParent()
    }
  }
})
