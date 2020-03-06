//index.js
//获取应用实例
const app = getApp();
const db= wx.cloud.database();
const _=db.command;
const that  = this;
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
    flag:app.globalData.flag,
    attentionText: '上拉更新',
    count: {},
    tabs:[{
      name:'全部商品'
    },
    {
      name:'生活用品'
    },
    {
      name:'学习用品'
    }, 
    {
      name:'电子产品'
    },
    {
      name:'其它'
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
  wx.getSetting({
    success: res => {
      if (!res.authSetting['scope.userInfo']) {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        wx.showToast({
          title: '您尚未登录',
          icon: 'none'
        })
        return;
      }
  console.log(e)
  wx.showLoading({
    title: '处理中',
  })
  let that=this;
  let index=e.currentTarget.dataset.index;

    this.setData({
      index:index
    })
    //处理收藏记录
  if (!that.data.list_doWell[index]){
    db.collection('collection').add({
      data:{
        collectionId:index,
        createTime: app.getNowFormatDate()
      },
      success(res){
        console.log(res,'添加收藏成功')
        wx.hideLoading()
        wx.showToast({
          title: '收藏成功',
          icon: 'none'
        })
      }
    })
  }
  else{
    console.log(index,app.globalData.openid)
    wx.cloud.callFunction({
      name:'deleteCollection',
      data:{
        index: index,
        openid: app.globalData.openid
      },
    success(e){
      console.log(e)
      wx.hideLoading()
      wx.showToast({
        title: '取消收藏',
        icon: 'none'
      })
    },
    fail(res){
      console.log(e,'失败')
    }
    })
    
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
    }
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
},

init: function(){
  let that = this;
  let db = wx.cloud.database();
  if(this.data.classes==''||this.data.classes=='全部商品'){
    db.collection('timeline').orderBy('createTime', 'desc').limit(20) //按发布视频排序
      .get({
        success(res) {
          that.setData({
            dataList: res.data
          })
          console.log('总数据',res)
        },
        fail(res) {
          console.log("请求失败", res)
        }
      })

  }
  else{
    db.collection('timeline').orderBy('createTime', 'desc').where({
      classes: that.data.classes})//刚改过
      .limit(20) //按发布视频排序
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
    attentionText:'上拉更新'
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
    let storage = wx.getStorageSync('warnings');
    if (!storage) {
      wx.setStorageSync('warnings', new Date().getTime())
    }
    setTimeout(function () {
      app.setTabbar()
    }, 1000)
  },
  getUser: function(e){
    wx.navigateTo({
      url: '/pages/user/user?openid='+e.currentTarget.dataset.openid,
    })
  },

  inc(e){
    let that = this;
    wx.cloud.callFunction({
      name: 'inc',
      data: {
        id: e,
      },
      success(e) {
        console.log(e)
      }
    })
  },
  previewImg: function (e) {
    let imgData = e.currentTarget.dataset.img;
    let id = e.currentTarget.dataset.id;
    console.log(id);
    this.inc(id)
    wx.previewImage({
      //当前显示图片
      current: imgData[0],
      //所有图片
      urls: imgData[1]
    })
  },

 
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
      db.collection('timeline').orderBy('createTime', 'desc').limit(20) //按发布视频排序
        .skip(that.data.dataList.length).get({
          success(res) {
            var attentionText =''
            if(res.data.length==0){
              attentionText = '到底啦'
            }
            else{
              attentionText = '上拉更新'
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
        .limit(20) //按发布视频排序
        .get({
          success(res) {
            var attentionText = ''
            if (res.data.length == 0) {
              attentionText = '到底啦'
            }
            else {
              attentionText = '上拉更新'
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
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.showToast({
            title: '您尚未登录',
            icon: 'none'
          })
          return;
        }
    wx.showLoading({
      title: '正在加载数据',
    })
    let that=this;
    const db=wx.cloud.database();
    const _ = db.command;
        // console.log('搜索到的数据', e)
        // var data = JSON.stringify(e.result.data)
        wx.hideLoading()
        wx.navigateTo({
          url: '/pages/search/search?data=' + that.data.confirmText,
        })
      }
    })
   
  },
  
//评论
  comment: function(e) {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
         wx.showToast({
           title: '您尚未登录',
           icon:'none'
         })
         return;
        }
   
    let id = e.currentTarget.dataset.id;
    this.inc(id)
    var item=e.currentTarget.dataset.item;
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/comment/comment?data=' + data,
    })
      }
    })
  },
//聊天
  chat: function(e){
    let that = this;
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.showToast({
            title: '您尚未登录',
            icon: 'none'
          })
          return;
        }
    
    let id = e.currentTarget.dataset.id;
    that.inc(id)
    var item = e.currentTarget.dataset.item;
    if(item._openid==app.globalData.openid){//上传更改
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
      }
    })
  },
  put: function(){
    wx.navigateTo({
      url: '/pages/onload/onload',
    })
  },
//删除该文件
  delete: function (e) {
    console.log(e.currentTarget.dataset.item)
    let index = e.currentTarget.dataset.index;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定下架该商品？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')//文件还不能完全删除
          var item = e.currentTarget.dataset.item
          // wx.cloud.database().collection('timeline').doc(item._id).remove()//删除该内容
          //   .then(console.log)
          wx.cloud.callFunction({
            name: 'deleteItem',
            data: {
              id: item._id
            },
            success(e) {
              that.data.dataList.splice(index, 1);//1的意思是只删除一个
              that.setData({
                dataList: that.data.dataList
              })
              console.log("下架成功")
            }
          })
          wx.cloud.database().collection('pull').add({
            data: {
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
          // that.init();
          wx.showToast({
            title: '下架成功',
            image: '/pages/images/select.png'
          })
          
        }
      }
    })

  }

})
