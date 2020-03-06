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
    context:{},
    tag: true,
    comments:''
  },

 init: function(){

   let db = wx.cloud.database();
  let chatroom = db.collection('chatroom')
  let _ = db.command
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
        temp.push(list[key])
      }
      that.setData({
        chats : temp
      })
      
       let message={}//显示信息
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
        
        ])).orderBy('createTs', 'asc').count({
          success(e){
// 为超出二十个信息
            chatroom.where(_.or([{
              groupId1: data.groupId1,
              groupId2: data.groupId2
            },
            {
              groupId1: data.groupId2,
              groupId2: data.groupId1,
            }

            ])).skip(e.total-10).orderBy('createTs', 'asc').get({
              success(e) {
                if (data.groupId1 == app.globalData.openid)
                  //更改前     message[data.groupId2] = e.data[e.data.length-1]
                  message[data.groupId2] = e.data[e.data.length - 1]
                else
                  //更改前   message[data.groupId1] = e.data[e.data.length - 1]
                  message[data.groupId1] = e.data[e.data.length - 1]
                // console.log(message[key],'第六十七行')
                that.setData({
                  context: message
                })
                console.log('搜索成功', e)
              }
            })
//查找出总个数，然后跳过信息总个数-10，再排序，避免微信一次只能操作二十的限制


          }
        })
      }
 },

 

       
     })
     //评论
   wx.cloud.callFunction({
     name: 'comments',
     data: {
       openid: app.globalData.openid
     },
     success(e) {
      console.log('评论搜索成功',e)
      that.setData({
        comments: e.result.data
      })
     }
   })


 },
  chat: function (e) {
    var item = e.currentTarget.dataset.item;
    if (item._openid == app.globalData.openid) {//上传更改
      wx.showToast({
        title: '暂不支持与本人私信',
        icon: 'none'
      })
      return;
    }//上传更改
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/chatroom/chatroom?data=' + data,
    })
  },
  comment: function(e){
    var item = e.currentTarget.dataset.item;
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/comment/comment?data=' + data,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  change1: function(){
    this.setData({
      tag:true
    })
  },
  change2: function () {
    this.setData({
      tag: false
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
    this.init();
    wx.hideTabBarRedDot({
      index: 2,
    });
    wx.setStorageSync('warnings', new Date().getTime());
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