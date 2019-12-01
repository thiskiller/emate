// pages/message/message.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '',
    chats: '',
  },

  init: function () {
    let db = wx.cloud.database();
    let chatroom = db.collection('chatroom')
    let _ = db.command
    let that = this
    chatroom.where({
      groupId2: that.data.userInfo._openid
    }).orderBy('createTime', 'desc').get({
      success(res) {
        var list = []
        for (var i = 0; i < res.data.length; i++) {
          list[res.data.groupId1] = res.data[i]
        }
        that.setData({
          chats: list
        })
      }
    })
  },

  handleCollection: function(){
    wx.navigateTo({
      url: '/pages/myCollection/myCollection',
    })
  },

  handleUpload: function(){
    wx.navigateTo({
      url: '/pages/myUpload/myUpload',
    })
  },
  handlePull: function () {
    wx.navigateTo({
      url: '/pages/myDownload/myDownload',
    })
  },
  handleIdeas: function () {
    wx.navigateTo({
      url: '/components/im/im',
    })
  },
  handleDetail: function(){
    wx.navigateTo({
      url: '/pages/detail/detail',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.init()

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