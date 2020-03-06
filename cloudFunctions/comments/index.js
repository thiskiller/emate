const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  try {
    return await db.collection('comment').orderBy('time', 'asc').where({
      // data 传入需要局部更新的数据
      
        // 表示将 done 字段置为 true
        replyOpenid: event.openid
    }).get({
      success(e) {
        return e;
      }
    })
  } catch (e) {
    return e;
  }
}