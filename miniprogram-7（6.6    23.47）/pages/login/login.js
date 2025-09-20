Page({
  data: {
    username: '',
    password: '',
    error: ''
  },

  // 输入框绑定：更新用户名
  bindUsernameInput: function (e) {
    this.setData({
      username: e.detail.value,
      error: ''
    });
  },

  // 输入框绑定：更新密码
  bindPasswordInput: function (e) {
    this.setData({
      password: e.detail.value,
      error: ''
    });
  },

  // 登录按钮点击事件
  login: function () {
    const { username, password } = this.data;

    // 简单验证
    if (!username || !password) {
      this.setData({
        error: '请输入用户名和密码'
      });
      return;
    }

    // 设置初始用户名和密码
    const initialUsername = 'zuo';
    const initialPassword = '196911';

    // 验证用户名和密码
    if (username === initialUsername && password === initialPassword) {
      // 保存登录状态
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('username', username);

      // 跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    } else {
      this.setData({
        error: '用户名或密码错误'
      });
    }
  }
});