// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const item = event.item
  cloud.database().collection('comment').add({
    data: {
      hello:'zhe',
    }
  })
  return '运行成功'
}