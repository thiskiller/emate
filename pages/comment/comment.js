// pages/comment/comment.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list_doWell: {},
    index: '',//以上与赞相关
    host:'',//
    userInfo:'',
    dataList: [],
    commentList: [],//评论区
    replyName:'',//被回复人的名字
    replyInfo:'',
    replyOpenid:'',//被回复人信息
    inputTxt: ''//回复内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
 
    onLoad: function (options) {
      var data = JSON.parse(options.data)
      console.log(data)
      this.setData({
        host: data,
        replyName: data.nickName,
        replyInfo: data,
        replyOpenid:data._openid
      })
      this.init();

    },
    onShow: function (e) {
      this.init();
    },

    //点赞功能，改变图片颜色
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
        wx.showLoading({
          title: '处理中',
        })
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
              wx.hideLoading()
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
              wx.hideLoading()
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
      }
    })
  },


    init: function () {
      let that = this;
      wx.getUserInfo({
        success(e) {
          that.setData({
            userInfo: e.userInfo
          })
        }
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
      wx.cloud.database().collection('comment').where({
        id: that.data.host._id
      }).orderBy('time', 'desc').get({

      }).then(res => {
        that.setData({
          commentList: res.data
        })
      }).catch(err => console.error(err))

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

    replyInp: function (e) {
      this.setData({
        inputTxt: e.detail.value
      })
    },


    addComment: function (e) {
      let that = this;
      console.log('通过1')
      if (that.data.inputTxt == '')
        return;


      wx.cloud.callFunction({
        name: 'isSafe',
        data: {
          text: that.data.inputTxt
        }
      }).then((res) => {
        if (res.result.code == 200) {
          //检测通过
          console.log(res)


        //安全测试后输入评论
          const _ = wx.cloud.database().command;
          wx.cloud.database().collection('comment').add({
            data: {
              id: that.data.host._id,
              tag: that.data.replyOpenid === that.data.host._openid,
              replyName: that.data.replyName,
              replyInfo: that.data.replyInfo,
              name: that.data.userInfo.nickName,
              avatarUrl: that.data.userInfo.avatarUrl,
              userInfo: that.data.userInfo,
              time: app.getNowFormatDate(),
              item: that.data.host,
              context: that.data.inputTxt,
              replyOpenid: that.data.replyOpenid,
            },
            success: res => {
              wx.cloud.callFunction({
                name: 'incCount',
                data: {
                  id: that.data.host._id
                },
                success(e) {
                  console.log("更新评论数量成功", e)
                }
              })
              wx.showToast({
                title: '添加成功',
                image: '/pages/images/select.png'
              })
              that.setData({
                inputTxt: ''
              })
              that.init()
            }
          })






        }
        if (res.result.code == 500) {
          console.log(res)
          //执行不通过
          wx.showToast({
            title: '您的输入包含敏感字',
            icon: 'none',
            duration: 3000
          })

        }
      })
     
    },

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
        var item = e.currentTarget.dataset.host;
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
      }
    })
  },
  getUser: function (e) {
    wx.navigateTo({
      url: '/pages/user/user?openid=' + e.currentTarget.dataset.openid,
    })
  },
    changeHost: function (e) {
      let temp = e.currentTarget.dataset.host;//发表评论人
      console.log(temp)
      this.setData({
        replyName: temp.name,
        replyInfo: temp.userInfo,
        replyOpenid: temp._openid,
      })

    },
    comment: function(){
      this.setData({
        replyName: this.data.host.nickName,
        replyInfo: this.data.host,
        replyOpenid: this.data.host._openid
      })
    },
  longtap: function(e){
    let that = this;
    console.log(e);
    let index = e.currentTarget.dataset.index;
    console.log(app.globalData.openid , e.currentTarget.dataset.openid)
    if(app.globalData.openid==e.currentTarget.dataset.openid){
      wx.showModal({
        title: '提示',
        content: '确定删除该评论',
        success(res){
          if(res.confirm){
            wx.cloud.database().collection('comment').doc(e.currentTarget.dataset.id).remove();
            wx.cloud.callFunction({
              name: 'decCount',
              data: {
                id: that.data.host._id
              },
              success(e){
                console.log(e)//删除评论
                that.data.commentList.splice(index, 1);//1的意思是只删除一个
                that.setData({
                  commentList: that.data.commentList
                })
              }
            })
          }
        }

      })
    }
  }

})