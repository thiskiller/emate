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
  //设置消息提示框，提示有未读信息
  setTabbar() {
    const db = wx.cloud.database();
    const _ = db.command;
    let that = this;//查询到发给自己的信息数
    let storage = wx.getStorageSync('warnings');
    wx.cloud.database().collection('chatroom').where({
      groupId2: that.globalData.openid,
      createTs: _.and(_.lt(new Date().getTime()), _.gt(storage))
    }).count({
      success(res) {
        console.log("查询未查看数据", res)
        if (res.total != 0) {
          wx.showTabBarRedDot({
            index: 2,
          })
        }
        //第二段，查询comment，待测试
        else {
          wx.cloud.database().collection('comment').where({
            replyOpenid: that.globalData.openid,
            createTs: _.and(_.lt(new Date().getTime()), _.gt(storage))
          }).count({
            success(res) {
              console.log("查询未查看数据", res)
              if (res.total != 0) {
                wx.showTabBarRedDot({
                  index: 2,
                })
              }

            }
          })

        }
      }
    })

  },





  onLaunch: function () {    
   //必加
    wx.cloud.init({
      traceUser: true,
    })
    console.log(new Date().getTime() + 12 * 60 * 60 * 1000)
    if ((new Date().getTime()) < 1578753693473) {
      this.globalData.flag = false
    }
   
   this.getOpenid();
    wx.showShareMenu({
      withShareTicket: true,
      complete: function (res) {
        console.log('分享功能开启', res)
      },
    })
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

    that.getOpenid();
   
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
   
  },

  globalData: {
    motto: 'Hello World',
    user:'',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: '',
    openid:'',
    flag:true
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },




  onLoad: function () {
    
  },

  
  
})

