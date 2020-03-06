// pages/login/login.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: ''
  },

  init(){
    wx.getSetting({
      success: res => {
    if (res.authSetting['scope.userInfo']) {
      // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
      }
    })
  },

  getUserInfo(e) {
    let that = this;
    const db = wx.cloud.database();
    const _ = db.command;//当是新用户是将其信息插入到user中
    
    wx.getUserInfo({
      success(res1) {
        app.globalData.userInfo = res1.userInfo;
        wx.cloud.callFunction({
          name:'getopenid',
          success(e){
            let openid=e.result.openid;
            db.collection('user').where({
              _openid:openid
            }).get({
              success(res){
                if(res.data.length==0){
                  db.collection('user').add({
                    data: {
                      userInfo: res1.userInfo,
                      createTime: app.getNowFormatDate(),
                      time: new Date().getTime()

                    },
                    success(e) {
                      console.log(e)
                    }
                  })
                }
              }
            })
          }
        })
        wx.switchTab({
          url: '/pages/index/index',
        })
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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