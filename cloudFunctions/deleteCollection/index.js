// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = (event, context) => {
  console.log(event.index)
  cloud.database().collection('collection').where({
    collectionId: event.index,
    _openid: event.openid,
  }).remove()
  return '取消收藏成功'
}