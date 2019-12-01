// pages/onload/onload.js
let app = getApp();
Page({

  data:{
    userInfo:'',
    txt:'',
    imgList:[],
    fileIDs: [],
    place:'',
    money: '',
    desc:'',
    classes:['书籍','生活用品','百货','电子产品','衣物'],
    classIndex: 0
  },
  getInput(e){
    console.log('输入的内容',e.detail.value)
    this.setData({
      desc:e.detail.value
    })
  },
// 选择图片
  ChooseImage(){
    let that= this;
    wx.chooseImage({
      count:9 - this.data.imgList.length,
      sizeType: ['compressed'], 
      sourceType: ['camera', 'album'],
      success: function(res) {
        console.log("选择图片成功",res)
        if(that.data.imgList.length!=0){
          that.setData({
            imgList: that.data.imgList.concat(res.tempFilePaths)
          })
        }
        else{
          that.setData({
            imgList:res.tempFilePaths
          })
        }
        console.log("路径",that.data.imgList)
      }
    });
  },

//删除已选图片
DeleteImg(e){
  let that=this;
  wx.showModal({
    title: '确定删除图片',
    content: '',
    cancelText:'取消',
    confirm:'确定',
    success:res=>{
      if(res.confirm){
        that.data.imgList.splice(e.currentTarget.dataset.index,1);//1的意思是只删除一个
        that.setData({
          imgList:that.data.imgList
        })
      }
    }
  })
},

  placeChange(e){
    this.setData({
      place :e.detail.value
    })
    console.log('place',e.detail.value)
  },
  moneyChange(e) {
    console.log('money',e.detail.value)
    this.setData({
      money: e.detail.value
    })
  },
bindPickerChange(e){
  console.log(e)
  this.setData({
  classIndex: e.detail.value
})
},
//上传数据
publish()  {
  let that=this;
  let desc = this.data.desc
  let imgList = this.data.imgList
  // 内容过少
  if(! desc || desc.length < 6){
    wx.showToast({
      title: '内容大于6个字',
      icon:'none',
      content: ''
    })
    return;
  }
  //图片过少
  // if(!imgList || imgList.length <1) {
  //   wx.showToast({
  //     title: '请选择图片',
  //     icon: 'none',
  //     content: '',
  //   })
  //   return;
  // }
  //选校未选择
  if(that.data.schoolIndex==0){
    wx.showToast({
      title: '请选择交易地点',
      icon: 'none',
      content: '',
    })
    return;
  }
  wx.showLoading({
    title: '发布中',
  })

  const promiserArr = [];
  for (let i = 0;i <this.data.imgList.length; i++){
    let filePath = this.data.imgList[i]
    let suffix = /\.[^\.]+$/.exec(filePath)[0];
    promiserArr.push(new Promise((reslove, reject) =>{
      wx.cloud.uploadFile({
        cloudPath: new Date().getTime() +suffix,
        filePath: filePath,
      }).then(res =>{
        console.log('上传结果', res.fileID)
        this.setData({
          fileIDs: this.data.fileIDs.concat(res.fileID)
        })
        reslove()
      }).catch(error =>{
        console.log("上传失败",error)
      })
    }))
  }

    let db =wx.cloud.database()
    Promise.all(promiserArr).then(res =>{
      db.collection('timeline').add({
        data: {
          fileIDs: this.data.fileIDs,
          createTime: app.getNowFormatDate(),
          desc: this.data.desc,
          images:this.data.imgList,
          place:this.data.place,
          userInfo:this.data.userInfo,
          nickName: this.data.userInfo.nickName,
          money: this.data.money,
          classes:this.data.classes[this.data.classIndex]
        },
      success: res=>{
      wx.hideLoading(),
      wx.showToast({
        title: '发布成功',
        image: '/pages/images/select.png'
      })
      console.log('发布成功',res)
      that.setData({
        imgList:'',
        fileIDs: '',
        txt: '',
        place: '',
        money: '',
      })
      
      
    },
    fail: err =>{
      wx.hideLoading(),
      wx.showToast({
        icon: 'none',
        title: '网络不给力'
      })
      console.log('发布失败',err)
    }
   })
  }
)},

//获取用户授权
getUserInfo(e){
  let that=this;
  wx.getUserInfo({
    success(res){
      console.log(res)
      that.setData({
        userInfo:res.userInfo
      })
      that.publish()
    }
  })
    
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
