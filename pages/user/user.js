// pages/collection/collection.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    idList: '',
    dataList: [],
    user:'',
    time:'',
    school: '',
    QQ: '',
    weixin: '',
    display: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.cloud.database().collection('timeline').where({
      _openid: options.openid
    }).orderBy('createTime', 'desc').get({
      success(res) {
        that.setData({
          dataList: res.data
        })
      }
    })
    
    wx.cloud.database().collection('user').where({
      _openid: options.openid
    }).get({
      success(e) {
        that.setData({
          user: e.data[0],
          time: ((new Date().getTime() - e.data[0].time) / (1000 * 60 * 60 * 24)).toFixed(0),
          school: e.data[0].school,
          QQ: e.data[0].QQ,
          weixin: e.data[0].weixin,
          display: e.data[0].display,
        })
      }
    })
},

  comment: function (e) {
    var item = e.currentTarget.dataset.item;
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/comment/comment?data=' + data,
    })
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

  }
})