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
    classes: ['生活用品','学习用品','电子产品','其它'],
    mainClasses: ['二手交易', '失物招领', '免费赠送', '商品拼团'],
    mainIndex: 0,
    classIndex: 0,
    table: 'timeline',
    tag : true,
    flag: app.globalData.flag
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


bindPickerChange(e){//发布类型分类
  console.log(e)
  this.setData({
  classIndex: e.detail.value
})
},


bindMainPickerChange(e){
  console.log(e)
  this.setData({
  mainIndex: e.detail.value
})
if(e.detail.value== 0){
  this.setData({
    tag: true,
    table: 'timeline'
  })
}
else if(e.detail.value==1){
  this.setData({
    tag: false,
    table: 'lost'
  })
}
else if(e.detail.value==2){
  this.setData({
    tag: false,
    table: 'zero'
  })
}
else if (e.detail.value == 3) {
  this.setData({
    tag: true,
    table: 'together'
  })
}

},
//上传数据
publish()  {
  let that=this;
  let desc = this.data.desc
  let imgList = this.data.imgList
  // 内容过少
  if(! desc || desc.length < 4){
    wx.showToast({
      title: '内容大于4个字',
      icon:'none',
      content: ''
    })
    return;
  }
  //地址未选
  if (!that.data.place) {
    wx.showToast({
      title: '请选择交易地点',
      icon: 'none',
      content: ''
    })
    return;
  }
  //交易金额未选

  
  if (!that.data.money&&that.data.tag) {
    wx.showToast({
      title: '请选择出售金额',
      icon: 'none',
      content: ''
    })
    return;
  }
  //金额非数字
    var  regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var  regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数

  if (that.data.tag&&!regPos.test(that.data.money) &&!regNeg.test(that.data.money)) {
          wx.showToast({
            title: '请输入正确售价格式',
            icon: 'none',
            content: ''
          })
          console.log('售价格式有问题')
          return;
         }
  // 图片过少
  if(!imgList || imgList.length <1) {
    wx.showToast({
      title: '请选择图片',
      icon: 'none',
      content: '',
    })
    return;
  }
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

  let promiseArr = []
  let fileIds = []
  // 图片上传
  for (let i = 0, len = this.data.imgList.length; i < len; i++) {
    let p = new Promise((resolve, reject) => {
      let item = this.data.imgList[i]
      if (item.indexOf("cloud:") != -1) {
        fileIds = fileIds.concat(item)
        resolve()
      } else {
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res.fileID)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      }
    })
    promiseArr.push(p)
  }

    let db =wx.cloud.database()
  Promise.all(promiseArr).then(res =>{
      this.setData({
        fileIDs: fileIds
      })
      db.collection("timeline").add({
        data: {
          fileIDs: this.data.fileIDs,
          table: that.data.table,
          createTime: app.getNowFormatDate(),
          desc: this.data.desc,
          images:this.data.imgList,
          place:this.data.place,
          userInfo:this.data.userInfo,
          nickName: this.data.userInfo.nickName,
          money: this.data.money,
          classes:this.data.classes[this.data.classIndex],
          count:0,
          views:1,
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
    },
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
