//index.js
//获取应用实例
const app = getApp();
const db= wx.cloud.database();
const _=db.command;
Page({
  data:{
    dataList: [],
    list_doWell:{},
    btn_doWell:false,
    index: '',
    confirmText:'',
    tabCur:0,
    scrollLeft:0,
    openid: '',
    classes:'',
    attentionText: '下拉更新',
    count: {},
    tabs:[{
      name:'全部商品'
    },
    {
      name:'书籍'
    },
    {
      name:'生活用品'
    },
    {
      name:'百货'
    }, 
    {
      name:'电子产品'
    },
    {
      name:'衣物'
    },
    {
      name:'瓷器'
    },
    {
      name:'厨具'
    },
    ]
  },

  tabSelect(e){
    this.setData({
      tabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 2)*200
    })
  },
//点赞功能，改变图片颜色
doWell: function(e){
  console.log(e)
  let that=this;
  let index=e.currentTarget.dataset.index;

    this.setData({
      index:index
    })
    //处理收藏记录
  if (!that.data.list_doWell[index]){
    db.collection('collection').add({
      data:{
        collectionId:index
      },
      success(res){
        console.log(res,'添加收藏成功')
        wx.showToast({
          title: '收藏成功',
          icon: 'none'
        })
      }
    })
  }
  else{
    wx.cloud.callFunction({
      name:'deleteCollection',
      data:{
        index: index,
        openid: app.globalData.openid
      },
    success(e){
      console.log(e)
      wx.showToast({
        title: '取消收藏',
        icon: 'none'
      })
    },
    fail(res){
      console.log(e,'失败')
    }
    })
    // wx.cloud.callFunction({
    //   // 要调用的云函数名称
    //   name: 'deleteCollection',
    //   // 传递给云函数的参数
    //   data: {
    //     x: 1,
    //     y: 2,
    //   },
    //   success: res => {
    //     console.log(res)
    //     // output: res.result === 3
    //   },
    //   fail: err => {
    //     // handle error
    //   },
    //   complete: () => {
    //     // ...
    //   }
    // })
    
  }
    //从本地取出点赞信息
  wx.getStorage({
    key: 'doWell',
    success: function(res) {
      let obj=res.data;
      obj[index] = !that.data.list_doWell[index];
      that.setData({
        list_doWell:obj,
      })
      //随即加上本次点击 存储到本地
      wx.setStorage({
        key: 'doWell',
        data: obj,
      })
    },
  })

},
  //获取openid
  getOpenid: function () {
    let that = this;
    wx.cloud.callFunction({
      name: 'getopenid',
      complete: res => {
        that.setData({
         openid : res.result.openid

        })

      }
    })
  },

onLoad: function() {
  this.getOpenid()
   this.init();
  wx.getSetting({
    success: res => {
      if (!res.authSetting['scope.userInfo']) {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        wx.redirectTo({
          url: '/pages/login/login',
        })
      }
    }
  })
  
},

init: function(){
  let that = this;
  let db = wx.cloud.database();
  if(this.data.classes==''||this.data.classes=='全部商品'){
    db.collection('timeline').orderBy('createTime', 'desc').limit(5) //按发布视频排序
      .get({
        success(res) {
          that.setData({
            dataList: res.data
          })

          // for (var index = 0; index < that.data.dataList.length; index++) {
          //   console.log(that.data.dataList[index])
  //        that.renew()
          // for (var item in that.data.dataList){
            // db.collection('comment').where({
            //   id: item._id
            // }).count({
            //   success(res){

              // console.log(item.nickName)
            //   }
            // })
          
          // }
        },
        fail(res) {
          console.log("请求失败", res)
        }
      })

  }
  else{
    db.collection('timeline').orderBy('createTime', 'desc').where({
      classes: that.data.classes})
      .limit(5) //按发布视频排序
      .get({
        success(res) {
          that.setData({
            dataList: res.data
          })//评论数
         

        },
        fail(res) {
          console.log("请求失败", res)
        }
      })
  }

  //获取用户缓存
  let storage = wx.getStorageSync('doWell');

  if(!storage){
    wx.setStorageSync('doWell', {})
    storage = wx.getStorageSync('doWell');
  
  }

  this.setData({
    list_doWell:storage,
    attentionText:'下拉更新'
  })
 
},

  select: function(e){
    console.log(e.currentTarget.dataset.name)
    this.setData({
      classes: e.currentTarget.dataset.name
    })
    this.init()
  },
  onShow: function () {
   
  },
  getUser: function(e){
    wx.navigateTo({
      url: '/pages/user/user?openid='+e.currentTarget.dataset.openid,
    })
  },

  previewImg: function (e) {
    let imgData = e.currentTarget.dataset.img;
    let id = e.currentTarget.dataset.id;
    wx.cloud.callFunction({
      name:'inc',
      data: {
        id: id,
      },
      success(e){
        console.log(e)
      }
    })
    wx.previewImage({
      //当前显示图片
      current: imgData[0],
      //所有图片
      urls: imgData[1]
    })
  },

 // 更新评论数
  // renew: function(){
  //   let temp = ''
  //   let that = this
  // new Promise((resolve,reject) =>{
  //   var length = 0;
  //   for (var index=0; index< that.data.dataList.length;index++) {
  //     db.collection('comment').where({
  //       id: that.data.dataList[index]._id
  //     }).count({
  //       success(e) {
  //         console.log(index,e)
  //       }
  //     })
  //   }
  // })  
  // },
  //下拉更新
  onPullDownRefresh: function(e){
    wx.showNavigationBarLoading()
    this.init();
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
  },
  //触底上拉，数据更新
  onReachBottom: function() {
    console.log("下拉通知")
    let that=this;
   //分为两类 收集全部商品 收集单独类别商品
    if (this.data.classes == '' || this.data.classes == '全部商品') {
      db.collection('timeline').orderBy('createTime', 'desc').limit(5) //按发布视频排序
        .skip(that.data.dataList.length).get({
          success(res) {
            var attentionText =''
            if(res.data.length==0){
              attentionText = '到底啦'
            }
            else{
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

    }
    else {
      db.collection('timeline').orderBy('createTime', 'desc').where({
        classes: that.data.classes
      }).skip(that.data.dataList.length)
        .limit(5) //按发布视频排序
        .get({
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
    }
  },

  //搜索
  search: function(e){
    console.log(e.detail.value)
    this.setData({
      confirmText:e.detail.value
    })
  },
  confirmSearch: function(e){
    let that=this;
    const db=wx.cloud.database();
    const _ = db.command;
    db.collection("timeline").where(_.or([{
      schoolName:db.RegExp({
        regexp:'.*'+this.data.confirmText,
        options:'i',
        })
      },
      {
        desc: db.RegExp({
          regexp: '.*' + this.data.confirmText,
          options: 'i',
        })

      },
      {
        data: db.RegExp({
          regexp: '.*' + this.data.confirmText,
          options: 'i',
        })

      },
      {
        nickName: db.RegExp({
          regexp: '.*' + this.data.confirmText,
          options: 'i',
        })

      }
      
    ])).orderBy('createTime', 'desc').get({

      success(res){
        var data=JSON.stringify(res.data)
       wx.navigateTo({
         url: '/pages/search/search?data='+data,
       })
      }
    }
    )
  },
  
//评论
  comment: function(e) {
    var item=e.currentTarget.dataset.item;
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/comment/comment?data=' + data,
    })
  },
//聊天
  chat: function(e){
    var item = e.currentTarget.dataset.item;
    if(item._openid==app.globalData.openid){
      wx.showToast({
        title: '暂不支持与自己聊天',
        icon: 'none'
      })
      return;
    }
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/chatroom/chatroom?data=' + data,
    })
  },
//删除该文件
  delete: function(e){
    console.log(e.currentTarget.dataset.item)
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定下架该商品？',
    success(res){
      if(res.confirm){
        console.log('用户点击确定')//文件还不能完全删除
        var item = e.currentTarget.dataset.item
        wx.cloud.database().collection('timeline').doc(item._id).remove()//删除该内容
          .then(console.log)
        wx.cloud.database().collection('pull').add({
          data:{
            fileIDs: item.fileIDs,
            data: item.data,
            createTime: item.createTime,
            desc: item.desc,
            images: item.images,
            place: item.place,
            userInfo: item.userInfo,
            nickName: item.nickName,
            money: item.money,
            classes: item.classes
          }
        })
        that.init();
        // wx.cloud.callFunction({
        //   name: 'deleteMessage',
        //   data: {
        //    item: e.currentTarget.dataset.item
        //   },
        //   complete: res => {
        //     that.init()
        //     console.log(res)
        //   }
        // })
      }
    }
  })

  }

})
