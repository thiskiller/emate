// pages/zero/zero.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    list_doWell: {},
    openid: '',
    table: 'lost'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.getOpenid()
    this.init();

  },
  init: function () {
    let that = this;
    let db = wx.cloud.database();
    db.collection('timeline').orderBy('createTime', 'desc').where({
      table: that.data.table
    }).limit(20) //按发布视频排序
        .get({
          success(res) {
            that.setData({
              dataList: res.data
            })
          },
          fail(res) {
            console.log("请求失败", res)
          }
        })

    

    //获取用户缓存
    let storage = wx.getStorageSync('doWell');

    if (!storage) {
      wx.setStorageSync('doWell', {})
      storage = wx.getStorageSync('doWell');

    }

    this.setData({
      list_doWell: storage,
      attentionText: '下拉更新'
    })

  },
  //获取openid
  getOpenid: function () {
    let that = this;
    wx.cloud.callFunction({
      name: 'getopenid',
      complete: res => {
        that.setData({
          openid: res.result.openid

        })

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
  onPullDownRefresh: function (e) {
    wx.showNavigationBarLoading()
    this.init();
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  //触底上拉，数据更新
  onReachBottom: function () {
    console.log("下拉通知")
    let that = this;
    //分为两类 收集全部商品 收集单独类别商品
    db.collection('timeline').orderBy('createTime', 'desc').where({
      table: that.data.table
    }).limit(20) //按发布视频排序
        .skip(that.data.dataList.length).get({
          success(res) {
            var attentionText = ''
            if (res.data.length == 0) {
              attentionText = '到底啦'
            }
            else {
              attentionText = '下拉更新'
            }
            that.setData({
              attentionText: attentionText,
              dataList: that.data.dataList.concat(res.data),
            })
          },
          fail(res) {
            console.log("请求失败", res)
          }
        })

    
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})