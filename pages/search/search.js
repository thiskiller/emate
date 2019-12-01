//index.js
//获取应用实例
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({
  data: {
    dataList: [],
    list_doWell: {},
    btn_doWell: false,
    index: '',
  },


  //点赞功能，改变图片颜色
  doWell: function (e) {
    console.log(e)
    let that = this;
    let index = e.currentTarget.dataset.index;

    this.setData({
      index: index
    })
    //处理收藏记录
    if (!that.data.list_doWell[index]) {
      db.collection('collection').add({
        data: {
          collectionId: index
        },
        success(res) {
          console.log(res, '添加收藏成功')
          wx.showToast({
            title: '收藏成功',
            icon: 'none'
          })
        }
      })
    }
    else {
      wx.cloud.callFunction({
        name: 'deleteCollection',
        data: {
          index: index,
          openid: app.globalData.openid
        },
        success(e) {
          console.log(e)
          wx.showToast({
            title: '取消收藏',
            icon: 'none'
          })
        },
        fail(res) {
          console.log(e, '失败')
        }
      })

    }
    //从本地取出点赞信息
    wx.getStorage({
      key: 'doWell',
      success: function (res) {
        let obj = res.data;
        obj[index] = !that.data.list_doWell[index];
        that.setData({
          list_doWell: obj,
        })
        //随即加上本次点击 存储到本地
        wx.setStorage({
          key: 'doWell',
          data: obj,
        })
      },
    })

  },

  onLoad: function (e) {
    var data = JSON.parse(e.data)
    console.log(data)
    this.setData({
      dataList: data
    })
    this.init();
  },
  chat: function (e) {
    var item = e.currentTarget.dataset.item;
    if (item._openid == app.globalData.openid) {
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
  init: function () {
    let that = this;

    //获取用户缓存
    let storage = wx.getStorageSync('doWell');

    if (!storage) {
      wx.setStorageSync('doWell', {})
      storage = wx.getStorageSync('doWell');

    }

    this.setData({
      list_doWell: storage
    })

  },


  onShow: function () {


  },

  previewImg: function (e) {
    let imgData = e.currentTarget.dataset.img;
    console.log("eeee", imgData[0])
    console.log("图片s", imgData[1])
    wx.previewImage({
      //当前显示图片
      current: imgData[0],
      //所有图片
      urls: imgData[1]
    })
  },

  comment: function (e) {
    var item = e.currentTarget.dataset.item;
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/comment/comment?data=' + data,
    })
  },

  onPullDownRefresh: function(){
    this.init();
    wx.stopPullDownRefresh()
  }

})
