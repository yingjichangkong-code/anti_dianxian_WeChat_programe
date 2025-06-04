Page({
  data: {
    longitude: 113.324520, // 默认经度（广州）
    latitude: 23.099994,  // 默认纬度（广州）
    markers: [],          // 地图标记点
    tip: '加载中...'     // 提示信息
  },

  onLoad: function () {
    // 读取本地存储的日志
    const logs = wx.getStorageSync('logs') || [];
    if (logs.length === 0) {
      this.setData({
        tip: '暂无位置记录，请先在首页触发异常'
      });
      return;
    }

    // 获取最新一条日志
    const latestLog = logs[logs.length - 1];
    const location = latestLog.location; // 格式为 "纬度: xx, 经度: xx"

    // 解析纬度和经度
    const latitudeMatch = location.match(/纬度: ([\d.]+)/);
    const longitudeMatch = location.match(/经度: ([\d.]+)/);
    
    if (!latitudeMatch || !longitudeMatch) {
      this.setData({
        tip: '位置数据格式错误'
      });
      return;
    }

    const latitude = parseFloat(latitudeMatch[1]);
    const longitude = parseFloat(longitudeMatch[1]);

    // 设置地图中心和标记点
    this.setData({
      latitude: latitude,
      longitude: longitude,
      markers: [{
        id: 0,
        latitude: latitude,
        longitude: longitude,
        width: 30,
        height: 30,
        title: '联系人位置'
      }],
      tip: '显示最新记录的位置'
    });
  }
});