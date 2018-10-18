// miniprogram/pages/add/add.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 主题
    title: "",
    // 日期
    date: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
    // 倒数周期value
    periodIndex: 0,
    // 倒数周期选择
    periodArr: ["年", "月"],
    // 说明
    des: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 主题
   */
  bindTitle: function (e) {
    this.setData({
      title: e.detail.value
    });
  },

  /**
   * 日期改变事件
   */
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    });
  },

  /**
   * 倒数日周期
   */
  bindLastPeriodChange: function (e) {
    this.setData({
      periodIndex: e.detail.value
    });
  },

  /**
   * 备注说明
   */
  bindDes: function (e) {
    this.setData({
      des: e.detail.value
    });
  },

  /**
   * 保存数据
   */
  saveDays: function () {
    if (!this.data.title) {
      wx.showToast({
        icon: "none",
        title: "倒数日主题不能为空",
      });
      return;
    }
    const personInfo = app.globalData.personInfo;
    const that = this;
    wx.showLoading({mask: true});
    wx.cloud.callFunction({
      name: "add",
      data: {
        title: this.data.title,
        date: this.data.date,
        periodIndex: this.data.periodIndex,
        des: this.data.des,
        createNickname: personInfo.nickName,
        createAvatarUrl: personInfo.avatarUrl
      }
    }).then((res) => {
      if (res.result.errMsg === "collection.add:ok") {
        wx.hideLoading();
        wx.showToast({
          icon: "success",
          title: "保存成功",
          success: function () {
            // 1秒后返回
            that.timer = setTimeout(() => {
              wx.navigateBack({
                delta: 1
              });
            }, 1000);
          }
        });
      }
    }).catch((err) => {
      wx.showToast({
        icon: "none",
        title: err
      });
    });
  }
})