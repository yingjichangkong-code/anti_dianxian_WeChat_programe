Page({
  data: {
    familyPhone: ''
  },
  onLoad: function () {
    this.setData({
      familyPhone: getApp().globalData.familyPhone || ''
    });
  },
  inputPhone: function (e) {
    this.setData({
      familyPhone: e.detail.value
    });
  },
  savePhone: function () {
    getApp().globalData.familyPhone = this.data.familyPhone;
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  }
});