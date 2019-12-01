// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
 const id = event.id;
 console.log('hello',id)
 const _ = cloud.database().command;
 cloud.database().collection('timeline').doc(id).update({
   data:{
     views:5
   }, 
 })
  cloud.database().collection('timeline').get({
    success(e){
      console.log(e)
    }
  })
 return id;
}