Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.setData({
      logs: wx.getStorageSync('logs') || []
    });
  }
});