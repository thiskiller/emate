// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
 cloud.database().collection('collection').where({
   _openid: event.openid
 }).get({
   success(res){
     console.log('123')
     return 123
   }
 })

}