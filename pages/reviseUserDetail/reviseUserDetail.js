// pages/reviseUserDetail/reviseUserDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: app.globalData.openid,
    userDetail: '',
    school: '',
    QQ:'',
    weixin:'',
    display: ''
  },

  submit: function(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定向用户展示以上信息',
      success(e){
        if(e.confirm){
          wx.cloud.database().collection('user').doc(that.data.userDetail._id).remove();
          wx.cloud.database().collection('user').add({
            data:{
              userInfo: that.data.userDetail.userInfo,
              time: that.data.userDetail.time,
              createTime: that.data.userDetail.createTime,
              school: that.data.school,
              QQ: that.data.QQ,
              weixin: that.data.weixin,
              display: that.data.display
            },
            success(e){
              console.log(e);
              wx.showToast({
                title: '更新成功',
                image: '/pages/images/select.png'
              })
            }
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({
      openid: app.globalData.openid
    })
    wx.cloud.database().collection('user').where({
      _openid: that.data.openid
    }).get({
      success(e){
        console.log(e.data[0]);
        that.setData({
          userDetail: e.data[0],
          school: e.data[0].school,
          QQ: e.data[0].QQ,
          weixin: e.data[0].weixin,
          display: e.data[0].display,
        })
      }
    })
  },

  inSchool: function(e){
    console.log(e.detail.value)
    this.setData({
      school:e.detail.value
    })
  },
  inQQ: function (e) {
    console.log(e.detail.value)
    this.setData({
      QQ: e.detail.value
    })
  },
  inWeixin: function (e) {
    console.log(e.detail.value)
    this.setData({
      weixin: e.detail.value
    })
  },
  inDisplay: function (e) {
    console.log(e.detail.value)
    this.setData({
      display: e.detail.value
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