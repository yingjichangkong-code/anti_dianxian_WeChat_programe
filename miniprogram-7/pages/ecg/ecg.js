Page({
  data: {
    isRunning: false,
    tip: '点击“启动”开始显示波形',
    ecgData: []
  },

  onLoad: function () {
    this.ecgInterval = null;
  },

  startWave: function () {
    if (this.data.isRunning) return;

    const that = this;
    this.setData({
      isRunning: true,
      tip: '波形显示中...'
    });

    this.ecgInterval = setInterval(() => {
      const newData = this.data.ecgData;
      newData.push(Math.sin(Date.now() * 0.01) * 50 + 100 + (Math.random() * 10));
      if (newData.length > 100) newData.shift(); // 保持100个数据点
      this.setData({
        ecgData: newData
      });
      this.drawECGWave();
    }, 100); // 每100ms更新一次
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
    const ctx = wx.createCanvasContext('ecgCanvas');
    const canvasWidth = 300;
    const canvasHeight = 300;
    const data = this.data.ecgData;
    const step = canvasWidth / (data.length > 0 ? data.length - 1 : 1);

    ctx.setFillStyle('#fff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.beginPath();
    ctx.setStrokeStyle('#000');
    ctx.setLineWidth(1);

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
    ctx.draw();
  },

  onUnload: function () {
    this.stopWave();
  }
});