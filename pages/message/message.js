// pages/message/message.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:'',
    chats: '',
    createTs:'',
    startTime: '',
    time:'',
    context:'',
    tag: true,
  },

 init: function(){

   let db = wx.cloud.database();
  let chatroom = db.collection('chatroom')
  let _ = db.command
 // let storage = wx.getStorageSync('message');
  //读取最近出聊天室缓存
  // if (!storage) {
  //   wx.setStorageSync('message', {})
  //   storage = wx.getStorageSync('message');

  // }

  // this.setData({
  //   createTs: storage
  // })

  let that = this
  chatroom.where({
    groupId2: app.globalData.openid
  }).orderBy('createTime', 'asc').get({
    success(res){
      var list=[]
      var temp=[]
      for(var i=0;i<res.data.length;i++){
        list[res.data[i].groupId1]=res.data[i]
      }

      for(var key in list){
        temp.unshift(list[key])
      }
      that.setData({
        chats : temp
      })
      
       let message=[]//显示信息
       let length = 0;
      for ( var k = 0; k < that.data.chats.length; k++){
        let data = that.data.chats[k];
        chatroom.where(_.or([{
          groupId1: data.groupId1,
          groupId2: data.groupId2
        },
        {
            groupId1: data.groupId2,
            groupId2: data.groupId1,
        }
        
        ])).orderBy('createTime', 'asc').get({
          success(e){
             message[length++] = e.data[e.data.length-1]
            // console.log(message[key],'第六十七行')
             that.setData({
               context:message
             })
             console.log('搜索成功',e)
          }
        })
      }
    


    //红点数据设置
    // for (var key = 0; key < that.data.chats.length; key++) {
    //   let a = 1570000000000;
    //   let b = 1580000000000;
    //   let c = that.data.createTs[that.data.chats[key].groupId1];
    //   let d = new Date().getTime();
    //   console.log(a,b,c,d)
    //   chatroom.where({
    //     groupId2: that.data.chats[key].groupId2,
    //     groupId1: that.data.chats[key].groupId1,
    //     createTs: _.and(_.gt(c), _.lt(d))//还是无法搜索出结果
    //   }).count({
    //     success(e) {
    //       console.log(e)
    //       // that.setData({
    //       //   time: that.data.time.concat(e.total)
    //       // })
    //     }
    //   })
    // }
 },

 

       
     })


 },

  chat: function(e){
    var item = e.currentTarget.dataset.item;
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/chatroom/chatroom?data=' + data,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  change: function(){
    this.setData({
      tag:!this.data.tag
    })
  },
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
    this.init()
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
    this.init();
    wx.stopPullDownRefresh()
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