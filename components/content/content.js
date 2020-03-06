// components/content/content.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataList:Array,
    attentionText:String,
    openid: String,
    table :String
  },

  data: {
    btn_doWell: false,
    index: '',
    confirmText: '',
    classes: '',
    count: {},
    list_doWell: {},
  },
 
  //点赞功能，改变图片颜色
  
  /**
   * 组件的方法列表
   */
  methods: {
    doWell: function (e) {
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
      let that = this;
      let index = e.currentTarget.dataset.index;

      this.setData({
        index: index
      })
      //处理收藏记录
        
        if (!that.data.list_doWell[index]) {
        db.collection('collection').add({
          data: {
            collectionId: index,
            createTime: app.getNowFormatDate()
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
          console.log("点赞信息",that.data.list_doWell[index])
          let obj = res.data;
          
          obj[index] = !that.data.list_doWell[index];
          that.setData({
            list_doWell: obj
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
   

    getUser: function (e) {
      wx.navigateTo({
        url: '/pages/user/user?openid=' + e.currentTarget.dataset.openid,
      })
    },

    inc(e) {
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
      this.inc(id)
      wx.previewImage({
        //当前显示图片
        current: imgData[0],
        //所有图片
        urls: imgData[1]
      })
    },

    
   
    
    //搜索
    search: function (e) {
      console.log(e.detail.value)
      this.setData({
        confirmText: e.detail.value
      })
    },
    confirmSearch: function (e) {
      let that = this;
      const db = wx.cloud.database();
      const _ = db.command;
      console.log(that.data.confirmText + "  " + that.properties.table)
          wx.navigateTo({
            url: '/pages/search/search?data=' + that.data.confirmText+'&table='+that.properties.table,
          })

    },

    //评论
    comment: function (e) {
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
      this.inc(id)
      var item = e.currentTarget.dataset.item;
      var data = JSON.stringify(item);
      wx.navigateTo({
        url: '/pages/comment/comment?data=' + data,
      })
        }
      })
    },
    //聊天
    chat: function (e) {
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
      this.inc(id)
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
        }
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
                console.log("删除成功",e)
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
    init: function () {
      let that = this;
      let db = wx.cloud.database();
        db.collection(this.properties.table).orderBy('createTime', 'desc').limit(20) //按发布视频排序
          .get({
            success(res) {
                that.properties.dataList= res.data
             
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

      that.data.list_doWell = storage

    },
  }
})
