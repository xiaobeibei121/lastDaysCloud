// miniprogram/pages/index/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: null,
    backgroundColorArr: ['rgb(240, 95, 141)', 'rgb(249, 127, 121)', 'rgb(252, 190, 66)', 'rgb(177, 141, 220)', 'rgb(61, 201, 135)', 'rgb(67, 193, 201)', 'rgb(78, 177, 243)', 'rgb(130, 169, 218)', 'rgb(148, 127, 120)'],
    startX: 0, //开始坐标
    startY: 0,
    navActive: 0,
    navStyle: 'nav-view-absolute',
    // 判断是否有正在倒数的数据
    lasting: 0,
    // 判断是否有已经倒数完的数据
    lasted: 0,
    // 回顾往日页面是否展示
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.startPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //读取缓存刷新，是都是新增返回
    wx.getStorage({
      key: 'back',
      success: (res) => {
        if (res.data === 'addPage') {
          wx.startPullDownRefresh();
          wx.removeStorage({ key: 'back'});
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(this.timer);
  },

 /**
   * 页面滑动事件
   */
  onPageScroll: function (e) {
    if (e.scrollTop < 0) {
      this.setData({ navStyle: 'nav-view-absolute' });
    } else {
      this.setData({ navStyle: '' });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getLists();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        // title: '倒数日',
        path: '/pages/sharePage/sharePage?dayID=' + res.target.id,
        success: function (res) {
          // 转发成功
          wx.showToast({
            title: '转发成功',
            icon: 'success',
            duration: 2000
          })
        },
        fail: function (res) {
        }
      }
    }
  },

  /**
   * 到新增页面
   */
  toAdd: function () {
    wx.navigateTo({
      url: '../add/add?from=home'
    });
  },
  
  /**
   * 获取列表数据
   */
  getLists: function () {
    wx.cloud.callFunction({
      name: "getLists",
      data: {}
    }).then((res) => {
      if (res.result.errMsg === "collection.get:ok") {
        wx.stopPullDownRefresh();
        let listsData = [...res.result.data];
        // listsData.forEach((item, index) => {
        //   item.isTouchMove = false;
        //   item.inviteNumber = item.persons.length - 1;
        //   const curDateTime = new Date();
        //   const curYear = curDateTime.getFullYear();
        //   const curMon = String(curDateTime.getMonth() + 1).padStart(2, '0');
        //   const curDay = String(curDateTime.getDate()).padStart(2, '0');
        //   const dateArr = item.date.split("-");
        //   if (item.periodIndex == 0) {
        //     let compYear = curYear;
        //     if ((parseInt(curMon) < dateArr[1]) || (parseInt(curMon) == dateArr[1] && parseInt(curDay) <= dateArr[2])) {
        //       compYear = curYear;
        //     } else {
        //       compYear = curYear + 1;
        //     }
        //     item.lastDays = parseInt((new Date(`${compYear}-${dateArr[1].padStart(2, '0')}-${dateArr[2].padStart(2, '0')}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
        //   } else if (item.periodIndex == 1) {
        //     let compMon = curMon;
        //     if (parseInt(curDay) <= dateArr[2]) {
        //       compMon = curMon;
        //     } else {
        //       compMon = curMon + 1;
        //     }
        //     compMon = String(compMon).padStart(2, '0');
        //     item.lastDays = parseInt((new Date(`${curYear}-${compMon}-${dateArr[2].padStart(2, '0')}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
        //   }
        // });
        this.setData({
          listData: listsData.sort((a, b) => {
            return a.lastDays - b.lastDays;
          }),
          lasting: listsData.some((a) => a.isLasted === 0),
          lasted: listsData.some((a) => a.isLasted === 1),
        });
      }
    }).catch((err) => {
      wx.showToast({
        icon: "none",
        title: "错误"
      });
    });
  },

  /**
   * 删除
   */
  deleteTap: function (event) {
    wx.showModal({
      title: "确认删除",
      content: "确认删除这个倒数日？",
      cancelColor: "#ee5e7b",
      confirmColor: "#999",
      success: (res) => {
        if (res.confirm) {
          this.confirmDelete(event.currentTarget.dataset.id, event.currentTarget.dataset.parentid, event.currentTarget.dataset.islasted, event.currentTarget.dataset.isrepeat);
        }
      }
    });
  },

  /**
   * 确认删除
   */
  confirmDelete: function (id, parentID, isLasted, isRepeat) {
    wx.cloud.callFunction({
      name: "delete",
      data: { id: id, parentid: parentID, isLasted: isLasted, isRepeat: isRepeat}
    }).then((res) => {
      if (res.result.errMsg === "collection.remove:ok" || res.result.errMsg === "doc.update:ok") {
        wx.showToast({
          icon: "success",
          title: "删除成功",
          success: () => {
            wx.startPullDownRefresh();
          }
        });
      }
    }).catch((err) => {
      wx.showToast({
        icon: "none",
        title: "错误"
      });
    });
  },

  /**
   * nav点击
   */
  navTap: function (res) {
    const index = res.currentTarget.dataset.index;
    if (index == 1) {
      this.setData({ isShow: true });
      this.timer = setTimeout(() => {
        this.setData({ navActive: index });
        clearTimeout(this.timer);
      },300);
    } else {
      this.setData({ navActive: index });
      this.timer = setTimeout(() => {
        this.setData({ navActive: index });
        this.setData({ isShow: false });
      }, 300);
    }
  },

  /**
   * 到倒数提醒页面
   */
  toSetDay: function () {
    wx.navigateTo({
      url: '../setDay/setDay'
    });
  },

  /**
   * 到详情页面
   */
  toDayDetail: function (event) {
    let detail = {...event.currentTarget.dataset.detail};
    detail.index = event.currentTarget.dataset.index;
    wx.setStorage({
      key: 'dayDetail',
      data: detail
    });
    wx.navigateTo({
      url: '../dayDetail/dayDetail?from=lasting'
    });
  },

  /**
   * 手指触摸动作开始 记录起点X坐标
   */
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.listData.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    });

    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      listData: this.data.listData
    });
  },

  /**
   * 滑动事件处理
   */
  touchmove: function (e) {
    let that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.listData.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false;
        else //左滑
          v.isTouchMove = true;
      }
    });
    //更新数据
    that.setData({
      listData: that.data.listData
    });
  },

  /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    let _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  }
})