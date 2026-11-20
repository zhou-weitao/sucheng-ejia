const app = getApp()

Page({
  data: {
    searchKeyword: '',
    list: [],
    originalList: [],
    userRole: '',
    filterSubject: '',
    filterGrade: '',
    filterPrice: '',
    filterDistrict: '',
    showPopup: false,
    popupTitle: '',
    popupOptions: [],
    popupType: '',
    selectedValue: '',
    subjects: ['数学', '英语', '语文', '物理', '化学', '生物', '历史', '地理', '政治'],
    grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'],
    prices: ['50元以下', '50-80元', '80-120元', '120-200元', '200元以上'],
    districts: ['姑苏区', '工业园区', '高新区', '吴中区', '相城区', '吴江区', '昆山市', '常熟市', '张家港市', '太仓市']
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    const userInfo = wx.getStorageSync('userInfo') || {}
    const role = userInfo.role || 'parent'
    this.setData({ userRole: role })
    this.loadData()
  },

  async loadData() {
    const { userRole } = this.data

    wx.showLoading({ title: '加载中...' })

    if (userRole === 'parent') {
      // 家长查看匹配的家教
      await this.loadMatchedTutors()
    } else {
      // 老师查看需求列表
      await this.loadRequirements()
    }

    wx.hideLoading()
  },

  async loadMatchedTutors() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {}

      // 调用智能匹配云函数
      const res = await wx.cloud.callFunction({
        name: 'matchTutors',
        data: {
          parentId: userInfo._id
        }
      })

      if (res.result.success && res.result.data) {
        const matchedTutors = res.result.data.matchedTutors || []
        const alternativeTutors = res.result.data.alternativeTutors || []

        // 合并结果，匹配优先在前
        const allTutors = [...matchedTutors, ...alternativeTutors]

        // 为每个家教获取评价数据
        const tutorsWithReviews = await Promise.all(
          allTutors.map(async (tutor, idx) => {
            let averageRating = 0
            let reviewCount = 0

            try {
              const reviewRes = await wx.cloud.callFunction({
                name: 'getReviewList',
                data: {
                  userId: tutor._id,
                  page: 1,
                  pageSize: 1
                }
              })

              if (reviewRes.result.success) {
                averageRating = reviewRes.result.data.avgRating || 0
                reviewCount = reviewRes.result.data.total || 0
              }
            } catch (err) {
              console.log('获取评价失败', err)
            }

            return {
              ...tutor,
              name: tutor.realName,
              expectedSalary: tutor.hourlyRate ? parseInt(tutor.hourlyRate.split('-')[0]) : 80,
              certified: tutor.idCardVerified === 2,
              averageRating: averageRating,
              reviewCount: reviewCount,
              intro: tutor.selfIntro || '专业家教，认真负责',
              matchScore: tutor.matchScore,
              isMatch: idx < matchedTutors.length
            }
          })
        )

        this.setData({
          list: tutorsWithReviews,
          originalList: tutorsWithReviews
        })
      }
    } catch (err) {
      console.error('加载匹配家教失败', err)
      wx.showToast({ title: '暂无匹配家教，请先发布需求', icon: 'none', duration: 2500 })
      this.setData({ list: [], originalList: [] })
    }
  },

  async loadRequirements() {
    try {
      // 从云数据库读取需求
      const res = await wx.cloud.callFunction({
        name: 'matchTutors',
        data: {
          tutorId: wx.getStorageSync('userInfo')._id
        }
      })

      let requirements = []

      if (res.result.success && res.result.data) {
        // 如果云函数返回匹配的需求，使用它
        requirements = res.result.data.matchedRequirements || []
      }

      // 如果云函数没有返回，直接读数据库
      if (requirements.length === 0) {
        const db = wx.cloud.database()
        const dbRes = await db.collection('Requirements').where({ status: 'open' }).get()
        requirements = dbRes.data || []
      }

      // 格式化数据
      const formattedReqs = requirements.map(r => ({
        ...r,
        nickName: r.parentName || '家长用户',
        budget: r.budgetRange ? parseInt(r.budgetRange.split('-')[0]) : 80
      }))

      this.setData({
        list: formattedReqs,
        originalList: formattedReqs
      })
    } catch (err) {
      console.error('加载需求列表失败', err)
      wx.showToast({ title: '暂无需求，请稍后重试', icon: 'none' })
      this.setData({ list: [], originalList: [] })
    }
  },

  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase()
    this.setData({ searchKeyword: keyword })
    this.applyFilter()
  },

  showFilterPopup(e) {
    const type = e.currentTarget.dataset.type
    const titles = { subject: '科目', grade: '年级', price: '价格', district: '区域' }
    const options = {
      subject: this.data.subjects,
      grade: this.data.grades,
      price: this.data.prices,
      district: this.data.districts
    }
    const currentValues = {
      subject: this.data.filterSubject,
      grade: this.data.filterGrade,
      price: this.data.filterPrice,
      district: this.data.filterDistrict
    }

    this.setData({
      showPopup: true,
      popupTitle: titles[type],
      popupOptions: ['不限', ...options[type]],
      popupType: type,
      selectedValue: currentValues[type] || '不限'
    })
  },

  hideFilterPopup() {
    this.setData({ showPopup: false })
  },

  stopPropagation() {},

  selectFilter(e) {
    const value = e.currentTarget.dataset.value
    const { popupType } = this.data
    const finalValue = value === '不限' ? '' : value

    this.setData({
      [`filter${popupType.charAt(0).toUpperCase() + popupType.slice(1)}`]: finalValue,
      showPopup: false
    })

    this.applyFilter()
  },

  applyFilter() {
    let { originalList, searchKeyword, filterSubject, filterGrade, filterPrice, filterDistrict } = this.data
    let list = [...originalList]

    if (searchKeyword) {
      list = list.filter(item => {
        const searchText = `${item.name || item.nickName || ''} ${item.school || ''} ${item.subjects ? item.subjects.join(' ') : ''} ${item.district || ''}`.toLowerCase()
        return searchText.includes(searchKeyword)
      })
    }

    if (filterSubject) {
      list = list.filter(item => item.subjects && item.subjects.includes(filterSubject))
    }

    if (filterGrade) {
      list = list.filter(item => item.grade === filterGrade || item.childGrade === filterGrade)
    }

    if (filterDistrict) {
      list = list.filter(item => item.district === filterDistrict)
    }

    if (filterPrice) {
      list = list.filter(item => {
        const price = item.expectedSalary || item.budget || 0
        if (filterPrice === '50元以下') return price <= 50
        if (filterPrice === '50-80元') return price > 50 && price <= 80
        if (filterPrice === '80-120元') return price > 80 && price <= 120
        if (filterPrice === '120-200元') return price > 120 && price <= 200
        if (filterPrice === '200元以上') return price > 200
        return true
      })
    }

    this.setData({ list })
  },

  goDetail(e) {
    const item = e.currentTarget.dataset.item
    wx.setStorageSync('detailItem', item)
    wx.navigateTo({ url: '/pages/detail/detail' })
  }
})
