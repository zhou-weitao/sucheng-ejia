const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    list: [],
    userRole: '',
    loading: true,
    empty: false
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({ userRole: userInfo.role || '' })
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const { userRole } = this.data
    const userId = userInfo._id || ''

    this.setData({ loading: true })

    let allList = []

    // 尝试从云数据库读取
    try {
      let res

      if (userRole === 'parent') {
        // 家长看自己发布的需求
        res = await db.collection('Requirements')
          .where({ parentId: userId })
          .orderBy('createTime', 'desc')
          .get()
        allList = res.data || []
      } else {
        // 老师看自己的家教简历
        res = await db.collection('Tutor_Profiles')
          .where({ userId: userId })
          .orderBy('createTime', 'desc')
          .get()
        allList = res.data || []
      }

      console.log('我的发布数据:', allList, 'userId:', userId, 'role:', userRole)
    } catch (err) {
      console.error('云数据库加载失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }

    // 字段兼容处理
    allList = allList.map(item => ({
      ...item,
      // 老师数据字段兼容
      name: item.name || item.realName || '家教老师',
      budget: item.budget || item.budgetRange || item.hourlyRate || '面议',
      intro: item.intro || item.selfIntro || item.description || '',
      // 老师简历默认状态
      status: item.status || 'matched'
    }))

    // 按时间排序（数据库字段名是 createTime，不是 createdAt）
    allList.sort((a, b) => {
      const timeA = a.createTime instanceof Date ? a.createTime.getTime() : new Date(a.createTime || 0).getTime();
      const timeB = b.createTime instanceof Date ? b.createTime.getTime() : new Date(b.createTime || 0).getTime();
      return timeB - timeA;
    });

    this.setData({
      list: allList,
      empty: allList.length === 0,
      loading: false
    });
  },

  getStatusText(status) {
    const map = {
      'open': '进行中',
      'matched': '已匹配',
      'closed': '已关闭'
    };
    return map[status] || '未知';
  },

  getStatusClass(status) {
    const map = {
      'open': 'status-open',
      'matched': 'status-matched',
      'closed': 'status-closed'
    };
    return map[status] || '';
  },

  goDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.setStorageSync('detailItem', item);
    wx.navigateTo({ url: '/pages/detail/detail' });
  },

  async onDelete(e) {
    const item = e.currentTarget.dataset.item;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条发布吗？',
      success: async (res) => {
        if (res.confirm) {
          // 删除本地存储的数据
          const localReqs = wx.getStorageSync('localRequirements') || [];
          const updatedLocalReqs = localReqs.filter(i => i._id !== item._id);
          wx.setStorageSync('localRequirements', updatedLocalReqs);

          // 尝试删除云数据库的数据
          let cloudDeleteSuccess = true;
          try {
            const collection = this.data.userRole === 'parent' ? 'Requirements' : 'Tutor_Profiles';
            await db.collection(collection).doc(item._id).remove();
          } catch (err) {
            console.error('云数据库删除失败', err);
            cloudDeleteSuccess = false;
          }

          // 更新页面显示
          const list = this.data.list.filter(i => i._id !== item._id);
          this.setData({ list, empty: list.length === 0 });

          if (cloudDeleteSuccess) {
            wx.showToast({ title: '删除成功', icon: 'success' });
          } else {
            wx.showToast({ title: '删除失败，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  onPublish() {
    wx.switchTab({ url: '/pages/publish/publish' });
  }
});
