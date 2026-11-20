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
    this.setData({ loading: true })

    // 从本地存储获取订单记录（支付产生的）
    const localOrders = wx.getStorageSync('orders') || []

    this.setData({
      list: localOrders,
      empty: localOrders.length === 0,
      loading: false
    })
  },


  getStatusText(status) {
    const map = {
      'pending': '待上课',
      'processing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return map[status] || '未知';
  },

  getStatusClass(status) {
    const map = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return map[status] || '';
  },

  onContact(e) {
    wx.showModal({
      title: '联系对方',
      content: '确定要联系对方吗？',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '模拟拨打成功', icon: 'success' });
        }
      }
    });
  },

  onCancel(e) {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '订单已取消', icon: 'success' });
        }
      }
    });
  },

  goIndex() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
