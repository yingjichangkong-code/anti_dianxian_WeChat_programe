Page({
  data: {
    familyPhone: '',
    savedPhone: '' // 显示保存的手机号
  },
  onLoad: function () {
    this.setData({
      familyPhone: getApp().globalData.familyPhone || '',
      savedPhone: getApp().globalData.familyPhone || '未设置'
    });
  },
  inputPhone: function (e) {
    this.setData({
      familyPhone: e.detail.value
    });
  },
  savePhone: function () {
    const phone = this.data.familyPhone;
    getApp().globalData.familyPhone = phone;
    this.setData({
      savedPhone: phone || '未设置'
    });
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  }
});