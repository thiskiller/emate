// pages/chatroom/chatroom.js
const db=wx.cloud.database();
const chatroom = db.collection('chatroom')
const _ = db.command
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    replyOpenid: '',
    userInfo: '',
    replyUserInfo: '',
    context: '',
    groupId1:'',
    groupId2:'',
    chats: '',
    flag:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data)
      this.setData({
       replyUserInfo: data.userInfo,
       replyOpenid: data._openid,
       userInfo: app.globalData.userInfo,
       openid: app.globalData.openid
     })
     this.init();
    let storage = wx.getStorageSync('message');
    if (!storage) {
      wx.setStorageSync('message', {})
    }
  },
  
  init: function(){
    // console.log(this.data.replyOpenid)
    // console.log(this.data.replyUserInfo)
    // console.log(this.data.openid)
    // console.log(this.data.userInfo)
    let that = this;
    chatroom.where(_.or([
      {
        groupId1: that.data.openid,
        groupId2: that.data.replyOpenid
      },
      {
        groupId1: that.data.replyOpenid,
        groupId2: that.data.openid
      }
    ])).orderBy('createTs', 'desc').limit(10).get({
      success(res){
        that.setData({
          chats: res.data.reverse()
        })
      }
    })

    

  },

  getUser: function (e) {
    wx.navigateTo({
      url: '/pages/user/user?openid=' + e.currentTarget.dataset.openid,
    })
  },

  context: function(e){
    this.setData({
      context: e.detail.value
    })
  },

  onConfirmSendText: function(){
    this.send()
  },

  send: function(){
    let that=this;
    if(this.data.context.length==0)
    return;

    
      this.setData({
        groupId1:app.globalData.openid,
        groupId2:this.data.replyOpenid
      })
      
    chatroom.add({
      data:{
        groupId1:that.data.groupId1,
        groupId2:that.data.groupId2,
        context: that.data.context,
        userInfo: app.globalData.userInfo,
        replyUserInfo: that.data.replyUserInfo,
        createTime: app.getNowFormatDate(),
        createTs: new Date().getTime(),
      },
      success(e){
        that.setData({
          context:''
        })
        //未避免用户反感，特去除
        // wx.showToast({
        //   title: '发送成功',
        // })
        console.log(e)
      }
    })

    

    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    chatroom.where(_.or([{
      _openid: that.data.openid // 填入当前用户 openid
    },
    {
      _openid: that.data.replyOpenid // 填入当前用户 openid
    }
    ])).watch({
      onChange: function (snapshot) {
        that.init()
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
      }
    })
  },

  onScrollToUpper: function () {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    chatroom.where(_.or([
      {
        groupId1: that.data.openid,
        groupId2: that.data.replyOpenid
      },
      {
        groupId1: that.data.replyOpenid,
        groupId2: that.data.openid
      }
    ])).orderBy('createTs', 'desc').skip(that.data.chats.length).limit(10).get({
      success(res) {
        console.log(res)
        that.setData({
          chats: res.data.reverse().concat(that.data.chats)
        })
      }
    })
    wx.hideLoading()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function (e) {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function (e) {
   
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  

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