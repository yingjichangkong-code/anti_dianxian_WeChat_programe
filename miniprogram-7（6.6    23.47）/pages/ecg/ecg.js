Page({
  data: {
    isRunning: false,
    tip: '点击“启动”开始显示波形',
    ecgData: []
  },

  onLoad: function () {
    this.ecgInterval = null;
    // 初始化 Canvas
    this.initCanvas();
  },

  initCanvas: function () {
    const that = this;
    wx.createSelectorQuery()
      .select('#ecgCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        // 设置画布尺寸（适配设备像素比）
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        that.canvas = canvas;
        that.ctx = ctx;
      });
  },

  startWave: function () {
    if (this.data.isRunning || !this.ctx) return;

    const that = this;
    this.setData({
      isRunning: true,
      tip: '波形显示中...'
    });

    let t = 0; // 时间计数器（秒）
    const samplingRate = 200; // 采样率 200 Hz
    const interval = 1000 / samplingRate; // 每 5ms 更新一次
    const heartRate = 60; // 心率 60 次/分钟
    const cycleDuration = 60 / heartRate; // 每个心跳周期 1 秒

    this.ecgInterval = setInterval(() => {
      const newData = this.data.ecgData;
      let value = 100; // 基线位置

      // 计算当前时间在周期中的位置
      const cycleTime = t % cycleDuration;

      // P 波 (0-0.08s)
      if (cycleTime >= 0 && cycleTime < 0.08) {
        const pTime = cycleTime / 0.08;
        value += 25 * Math.sin(Math.PI * pTime); // P 波幅度 25
      }
      // QRS 波群 (0.12-0.20s)
      else if (cycleTime >= 0.12 && cycleTime < 0.20) {
        const qrsTime = (cycleTime - 0.12) / 0.08;
        if (qrsTime < 0.1) {
          value -= 10; // Q 波下降
        } else if (qrsTime < 0.6) {
          value += 100 * (1 - Math.abs((qrsTime - 0.35) / 0.25)); // R 波尖峰
        } else {
          value -= 30; // S 波下降
        }
      }
      // T 波 (0.24-0.40s)
      else if (cycleTime >= 0.24 && cycleTime < 0.40) {
        const tTime = (cycleTime - 0.24) / 0.16;
        value += 35 * Math.sin(Math.PI * tTime); // T 波幅度 35
      }

      // 添加噪声
      value += (Math.random() - 0.5) * 5;

      newData.push(value);
      if (newData.length > 100) newData.shift(); // 保持 100 个数据点

      this.setData({
        ecgData: newData
      });
      this.drawECGWave();

      // 更新时间，添加心率波动
      t += interval / 1000;
      if (t >= cycleDuration) {
        t = 0;
        // 模拟心率波动 ±10%
        const variation = (Math.random() - 0.5) * 0.2;
        t -= variation * cycleDuration;
      }
    }, interval);
  },

  stopWave: function () {
    if (!this.data.isRunning) return;

    clearInterval(this.ecgInterval);
    this.setData({
      isRunning: false,
      tip: '波形已停止'
    });
  },

  drawECGWave: function () {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    const canvasWidth = canvas.width / wx.getSystemInfoSync().pixelRatio;
    const canvasHeight = canvas.height / wx.getSystemInfoSync().pixelRatio;
    const data = this.data.ecgData;
    const step = canvasWidth / (data.length > 0 ? data.length - 1 : 1);

    // 清空画布
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制波形
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000'; // 改为红色
    ctx.lineWidth = 1;

    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = canvasHeight - data[i];
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  },

  onUnload: function () {
    this.stopWave();
  }
});