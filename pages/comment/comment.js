// pages/comment/comment.js
const app = getApp();
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
    replyInfo:'',//被回复人信息
    inputTxt: ''//回复内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data)
    this.setData({
      host: data,
      replyName: data.nickName,
      replyInfo: data
    })
    this.init();
    
  },
  onShow: function(e){
    this.init();
  },

  //点赞功能，改变图片颜色
  doWell: function (e) {
    console.log(e)
    let that = this;
    let index = e.currentTarget.dataset.index;
    console.log(index)
    this.setData({
      index: index
    })
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


  init: function () {
    let that = this;
    wx.getUserInfo({
      success(e){
        that.setData({
          userInfo:e.userInfo
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
      id:that.data.host._id
    }).orderBy('time', 'desc').get({
    
    }).then(res =>{
      that.setData({
        commentList: res.data
      })
    }).catch(err =>console.error(err))
    
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

  replyInp: function(e){
    this.setData({
      inputTxt: e.detail.value
    })
  },

  addComment: function(e) {
    let that=this;
    const _=wx.cloud.database().command;
    wx.cloud.database().collection('comment').add({
      data:{
        id:that.data.host._id,
        tag: that.data.replyName===that.data.host.nickName,
        replyName: that.data.replyName,
        replyInfo: that.data.replyInfo,
        name: that.data.userInfo.nickName,
        avatarUrl: that.data.userInfo.avatarUrl,
        userInfo: that.data.userInfo,
        time: app.getNowFormatDate(),
        context: that.data.inputTxt,
      },
      success:res =>{
       wx.showToast({
         title: '添加成功',
         image: '/pages/images/select.png'
       })
       that.setData({
         inputTxt:''
       })
       that.init()
      }
    })
  },

    changeHost: function(e){
      let temp=e.currentTarget.dataset.host;//发表评论人
      this.setData({
        replyName:temp.name,
        replyInfo:temp.userInfo,

      })

    }

})