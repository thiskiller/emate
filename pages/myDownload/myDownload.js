// pages/myDownload/myDownload.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:'',
    openid: app.globalData.openid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  init(){
    let that = this;
    wx.cloud.database().collection('pull').where({
      _openid: app.globalData.openid
    }).get({
      success(e) {
        console.log(e)
        that.setData({
          dataList: e.data
        })
      }
    })
  },
  onLoad: function (options) {
    this.init()
  },

  recover: function(){

  },
  delete: function(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认删除该文件', 
    success(e){
      if(e.confirm){
        wx.showLoading({
          title: '正在更改',
        })
       db.collection('pull').doc(id).remove(),
       that.init(),
       wx.hideLoading()
       wx.showToast({
         title: '删除成功',
         icon: 'none'
       })
      }
    }
  })
  },

  recover: function(e){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '重新上架该商品？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showLoading({
            title: '正在更改',
          })
          var item = e.currentTarget.dataset.item
          wx.cloud.database().collection('pull').doc(item._id).remove()//删除该内容
            .then(console.log)
          wx.cloud.database().collection('timeline').add({
            data: {
              fileIDs: item.fileIDs,
              data: item.data,
              createTime: app.getNowFormatDate(),
              desc: item.desc,
              images: item.images,
              place: item.place,
              userInfo: item.userInfo,
              nickName: item.nickName,
              money: item.money,
              classes: item.classes,
              views: 0,
              nums: 0
            }
          })
          that.init();
          wx.hideLoading(),
              wx.showToast({
            title: '删除成功',
            icon: 'none'
          })
        }
      }
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