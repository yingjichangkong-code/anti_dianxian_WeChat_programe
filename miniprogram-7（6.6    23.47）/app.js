App({
  onLaunch: function () {
    // 初始化全局数据
    this.globalData = {
      familyPhone: '' // 家属手机号，初始为空
    };

    // 检查登录状态
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    if (!isLoggedIn) {
      // 未登录，跳转到登录页面
      wx.redirectTo({
        url: '/pages/login/login'
      });
    } else {
      // 已登录，跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
      // 间接引用 settings 页面
      this.checkSettings();
    }
  },

  checkSettings: function () {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const settingsPage = pages.find(page => page.route === 'pages/settings/settings');
      if (settingsPage) {
        settingsPage.onLoad(); // 触发 settings 页面加载
      }
    }
  }
});