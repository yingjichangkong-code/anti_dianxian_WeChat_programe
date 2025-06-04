const util = require('../../utils/util.js');

       Page({
         data: {
           status: '等待触发...'
         },

         triggerAlert: function () {
           const that = this;

           // 提示用户放松
           wx.showModal({
             title: '注意',
             content: '请放松！',
             showCancel: false,
             success(res) {
               that.setData({
                 status: '即将发作，记录日志中...'
               });

               // 请求位置权限
               wx.getSetting({
                 success(res) {
                   if (!res.authSetting['scope.userLocation']) {
                     wx.authorize({
                       scope: 'scope.userLocation',
                       success() {
                         that.getLocation();
                       },
                       fail() {
                         wx.showModal({
                           title: '提示',
                           content: '需要位置权限，请在设置中授权。',
                           success(res) {
                             if (res.confirm) {
                               wx.openSetting();
                             }
                           }
                         });
                       }
                     });
                   } else {
                     that.getLocation();
                   }
                 }
               });
             }
           });
         },

         getLocation: function () {
           const that = this;
           wx.getLocation({
             type: 'wgs84',
             success(res) {
               const latitude = res.latitude;
               const longitude = res.longitude;
               const location = `纬度: ${latitude}, 经度: ${longitude}`;

               // 记录日志到本地存储
               const log = {
                 time: util.formatTime(new Date()),
                 location: location,
                 status: '即将发作'
               };
               const logs = wx.getStorageSync('logs') || [];
               logs.push(log);
               wx.setStorageSync('logs', logs);

               that.setData({
                 status: '已记录日志'
               });

               // 提示用户手动通知家属
               wx.showModal({
                 title: '提示',
                 content: '请手动通知家属，位置已记录。',
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
         }
       });