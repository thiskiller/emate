// pages/collection/collection.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    idList: '',
    dataList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log(app.globalData.openid)
    wx.cloud.database().collection('collection').where({
      _openid: app.globalData.openid,
    }).orderBy('createTime', 'desc').get({
      success(e) {
        console.log(e)
        that.setData({
          idList: e.data
        })

        for (var i = 0; i < that.data.idList.length; i++) {
          wx.cloud.database().collection('timeline').where({
            _id: that.data.idList[i].collectionId
          }).get({
            success(res) {
              console.log(that.data.dataList, res)
              if (res.data.length!=0)
              that.setData({
                dataList: that.data.dataList.concat(res.data[0])
              })
            }
          })
        }
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