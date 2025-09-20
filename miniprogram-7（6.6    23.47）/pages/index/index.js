const util = require('../../utils/util.js');

Page({
  data: {
    status: '等待触发...',          // 触发异常状态
    bluetoothStatus: '未连接',       // 蓝牙状态
    locationText: '点击“被检测人位置”获取', // 位置信息
    deviceId: '',                    // 蓝牙设备ID
  },

  // 触发异常（新增短信发送）
  triggerAlert: function () {
    const that = this;

    wx.showModal({
      title: '注意',
      content: '请放松！',
      showCancel: false,
      success(res) {
        that.setData({
          status: '即将发作，记录日志中...'
        });

        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              wx.authorize({
                scope: 'scope.userLocation',
                success() {
                  that.getLocationAndSendSMS();
                },
                fail() {
                  wx.showModal({
                    title: '提示',
                    content: '需要位置权限，请授权以记录位置。',
                    success(res) {
                      if (res.confirm) {
                        wx.openSetting();
                      }
                    }
                  });
                }
              });
            } else {
              that.getLocationAndSendSMS();
            }
          }
        });
      }
    });
  },

  getLocationAndSendSMS: function () {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        const location = `纬度: ${latitude}, 经度: ${longitude}`;

        // 模拟风险等级（1-5星）
        const riskLevel = Math.floor(Math.random() * 5) + 1;
        const stars = '★'.repeat(riskLevel);

        // 获取保存的手机号
        const familyPhone = getApp().globalData.familyPhone || '未设置';
        const message = `癫痫发作警报！位置: ${location}, 风险等级: ${stars}`;
        
        // 模拟短信发送（记录到日志）
        const log = {
          time: util.formatTime(new Date()),
          location: location,
          status: '即将发作',
          message: message,
          phone: familyPhone
        };
        const logs = wx.getStorageSync('logs') || [];
        logs.push(log);
        wx.setStorageSync('logs', logs);

        that.setData({
          status: '已记录日志，短信已模拟发送'
        });

        wx.showModal({
          title: '提示',
          content: `已向 ${familyPhone} 发送警报（模拟），位置: ${location}, 风险: ${stars}。请手动确认。`,
          showCancel: false
        });
      },
      fail(err) {
        that.setData({
          status: '获取位置失败'
        });
        console.error('获取位置失败', err);
      }
    });
  },

  // 蓝牙配对（暂时禁用）
  pairBluetooth: function () {
    wx.showToast({
      title: '蓝牙功能需在 Mac 或真机上测试',
      icon: 'none'
    });
  },

  // 跳转到心电图页面
  showECG: function () {
    wx.navigateTo({
      url: '/pages/ecg/ecg'
    });
  },

  // 被检测人位置
  getUserLocation: function () {
    const that = this;

    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.fetchLocation();
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '需要位置权限，请授权以获取位置。',
                success(res) {
                  if (res.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          that.fetchLocation();
        }
      }
    });
  },

  fetchLocation: function () {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        that.setData({
          locationText: `纬度: ${latitude}, 经度: ${longitude}`
        });
      },
      fail(err) {
        that.setData({
          locationText: '获取位置失败'
        });
        console.error('获取位置失败', err);
      }
    });
  },

  onUnload: function () {
    // 蓝牙关闭逻辑暂时禁用
  }
});