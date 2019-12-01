//app.js
const app = getApp()
App({
  getNowFormatDate: function () {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var strHour = date.getHours();
    var strMinute = date.getMinutes();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    if (strHour >= 0 && strHour <= 9) {
      strHour = "0" + strHour;
    }
    if (strMinute >= 0 && strMinute <= 9) {
      strMinute = "0" + strMinute;
    }

    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
      " " + strHour + seperator2 + strMinute;
    return currentdate;
  },
  onLaunch: function () {    
   //必加
    wx.cloud.init({
      traceUser: true
    })
   console.log("确实运转了")
   this.getOpenid();
    

      let that=this;    
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              that.globalData.userInfo=res.userInfo
            
            }
          })
        }        
      }
    })

    that.getOpenid()

   
  },

  
  getOpenid: function () {
    let that = this;
    wx.cloud.callFunction({
      name: 'getopenid',
      complete: res => {
        var openid = res.result.openid
        that.globalData.openid = openid

      }
    })
  },
  onShow: function(){
   wx.showShareMenu({
     withShareTicket: true,
     complete: function(res) {
       console.log('已分享',res)
     },
   })
  },

  globalData: {
    motto: 'Hello World',
    user:'',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: '',
    openid:''

  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  //初始化user
  User: function (userInfo) {
    let db = wx.cloud.database();
    db.collection('user').where({
        _openid: userInfo.openid   
    }).get({
      success: res=>{
         if(res.data.length==0){
           db.collection('user').add({
             data:{
               userInfo: userInfo,
               name: userInfo.nickName,
               message: 0,
               praise: 0,
               collection: 0
             }
           })
         }
      }
    })
  },


  onLoad: function () {
    
  },

  
  
})

