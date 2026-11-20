Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        icon: "🏠",
        idx: 0
      },
      {
        pagePath: "/pages/publish/publish",
        text: "发布",
        icon: "+",
        isCenter: true,
        idx: 1
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        icon: "👤",
        idx: 2
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({ selected: data.index });
    }
  }
})
