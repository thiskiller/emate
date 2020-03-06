// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    await db.collection('timeline').doc(event.id).remove()
    return await db.collection('comment').where({
      id: event.id
    }).remove()
  } catch (e) {
    console.error(e)
  }
}