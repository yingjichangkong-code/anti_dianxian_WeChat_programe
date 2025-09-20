Page({
  data: {
    longitude: 113.324520, // 默认经度（广州）
    latitude: 23.099994,   // 默认纬度（广州）
    markers: [],           // 地图标记点
    polylines: [],         // 路径线条
    tip: '加载中...',      // 提示信息
    locationText: '',      // 位置文本
    userLocation: null,    // 用户当前位置
    distanceToVictim: 0,   // 到发作者的距离
    distanceToHospital: 0  // 到最近医院的距离
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

    // 设置发作者位置
    this.setData({
      latitude: latitude,
      longitude: longitude,
      markers: [{
        id: 0,
        latitude: latitude,
        longitude: longitude,
        width: 30,
        height: 30,
        title: '癫痫发作者位置'
      }]
    });

    // 获取用户当前位置
    this.getUserLocation();
  },

  getUserLocation: function () {
    const that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.fetchUserLocation();
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
          that.fetchUserLocation();
        }
      }
    });
  },

  fetchUserLocation: function () {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const userLatitude = res.latitude;
        const userLongitude = res.longitude;
        that.setData({
          userLocation: { latitude: userLatitude, longitude: userLongitude },
          locationText: `用户位置: 纬度: ${userLatitude}, 经度: ${userLongitude}`
        });
        that.calculatePath();
        that.addHospitals();
      },
      fail(err) {
        that.setData({
          tip: '获取用户位置失败',
          locationText: '请授权位置权限'
        });
        console.error('获取用户位置失败', err);
      }
    });
  },

  calculatePath: function () {
    const { latitude, longitude, userLocation } = this.data;
    if (!userLocation) return;

    // 绘制从用户到发作者的路径（直线）
    const polyline = [{
      points: [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: latitude, longitude: longitude }
      ],
      color: '#0000FF', // 蓝色
      width: 5,
      dottedLine: false
    }];

    // 估算距离（直线距离，单位：米）
    const R = 6371000; // 地球半径（米）
    const dLat = (userLocation.latitude - latitude) * Math.PI / 180;
    const dLon = (userLocation.longitude - longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latitude * Math.PI / 180) * Math.cos(userLocation.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceToVictim = R * c;

    this.setData({
      polylines: polyline,
      distanceToVictim: distanceToVictim.toFixed(0)
    });
  },

  addHospitals: function () {
    const { latitude, longitude } = this.data;
    // 调整医院位置，确保在地图范围内
    const hospitals = [
      { latitude: latitude + 0.005, longitude: longitude + 0.005, name: '医院A' },
      { latitude: latitude - 0.005, longitude: longitude - 0.005, name: '医院B' },
      { latitude: latitude + 0.003, longitude: longitude - 0.003, name: '医院C' }
    ];

    const markers = this.data.markers;
    hospitals.forEach((hospital, index) => {
      markers.push({
        id: index + 1,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        width: 20,
        height: 20,
        title: hospital.name
      });
    });

    // 找到最近医院
    const R = 6371000; // 地球半径（米）
    let minDistance = Infinity;
    let nearestHospital = null;
    hospitals.forEach(hospital => {
      const dLat = (hospital.latitude - latitude) * Math.PI / 180;
      const dLon = (hospital.longitude - longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(hospital.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      if (distance < minDistance) {
        minDistance = distance;
        nearestHospital = hospital;
      }
    });

    this.setData({
      markers: markers,
      distanceToHospital: minDistance.toFixed(0),
      tip: '地图加载完成'
    });
  },

  showDistanceModal: function () {
    const { distanceToVictim, distanceToHospital, userLocation } = this.data;
    if (!userLocation) {
      wx.showModal({
        title: '提示',
        content: '无法获取用户位置，请确保已授权位置权限。',
        showCancel: false
      });
      return;
    }

    if (distanceToVictim === 0 || distanceToHospital === 0) {
      wx.showModal({
        title: '提示',
        content: '距离计算中，请稍后重试或检查位置数据。',
        showCancel: false
      });
      return;
    }

    wx.showModal({
      title: '距离信息',
      content: `到发作者的最短距离: ${distanceToVictim} 米\n到最近医院的最短距离: ${distanceToHospital} 米`,
      showCancel: false
    });
  },

  onUnload: function () {
    // 清理
  }
});