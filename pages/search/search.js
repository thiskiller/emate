const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({
  data: {
    dataList: [],
    table:'',
    list_doWell: {},
    btn_doWell: false,
    index: '',
    openid:'',
    confirmText:''
  },


  //点赞功能，改变图片颜色
  doWell: function (e) {
    
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
  getUser: function (e) {
    wx.navigateTo({
      url: '/pages/user/user?openid=' + e.currentTarget.dataset.openid,
    })
  },
  delete: function (e) {
    console.log(e.currentTarget.dataset.item)
    let index = e.currentTarget.dataset.index;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定下架该商品？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var item = e.currentTarget.dataset.item
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
          wx.showToast({
            title: '下架成功',
            image: '/pages/images/select.png'
          })

        }
      }
    })

  },
  onLoad: function (e) {
   //如果收到的table为空，则将其自动赋值为0
    this.setData({
      confirmText: e.data,
      table: e.table==undefined?'':e.table
    })
    console.log(e.data)
    this.init();
  },
  chat: function (e) {
    console.log(e)
    var item = e.currentTarget.dataset.item;
    if (item._openid == app.globalData.openid) {
      wx.showToast({
        title: '暂不支持与本人私信',
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
    this.setData({
      openid:app.globalData.openid
    })
    //获取用户缓存
    let storage = wx.getStorageSync('doWell');

    if (!storage) {
      wx.setStorageSync('doWell', {})
      storage = wx.getStorageSync('doWell');

    }

    this.setData({
      list_doWell: storage
    })

    //分类搜索调用方法
    if (that.data.table != '') {
      console.log("分类搜索栏")
      wx.cloud.callFunction({
        name: 'searchItemData',
        data: {
          data: that.data.confirmText,
          table: that.data.table,
          length: 0
        },
        success(e) {
          console.log(that.data.table, that.data.confirmText)
          console.log("搜索数据", e)
          that.setData({
            dataList: e.result.data
          })
          console.log(that.data.dataList)
        }
      })
    }
    else {
      //搜索所有数据
      console.log("总搜索栏")
      wx.cloud.callFunction({
        name: 'searchData',
        data: {
          data: that.data.confirmText,
          table: that.data.table,
          length: 0
        },
        success(e) {
          console.log(that.data.table, that.data.confirmText)
          console.log("搜索数据", e)
          that.setData({
            dataList: e.result.data
          })
          console.log(that.data.dataList)
        }
      })
    }
   
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
  },
  onReachBottom: function(){
    let that =this;
    //分类搜索调用方法
    if (that.data.table != '') {
      console.log("分类搜索栏")
      wx.cloud.callFunction({
        name: 'searchItemData',
        data: {
          data: that.data.confirmText,
          table: that.data.table,
          length: that.data.dataList.length
        },
        success(e) {
          console.log(that.data.table, that.data.confirmText)
          console.log("搜索数据", e)
          that.setData({
            dataList: that.data.dataList.concat(e.result.data)
          })
          console.log(that.data.dataList)
        }
      })
    }
    else {
      //搜索所有数据
      console.log("总搜索栏")
      wx.cloud.callFunction({
        name: 'searchData',
        data: {
          data: that.data.confirmText,
          table: that.data.table,
          length: that.data.dataList.length
        },
        success(e) {
          console.log(that.data.table, that.data.confirmText)
          console.log("搜索数据", e)
          that.setData({
            dataList: that.data.dataList.concat(e.result.data)
          })
          console.log(that.data.dataList)
        }
      })
    }
   
  }
})
