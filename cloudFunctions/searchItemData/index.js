// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  try {//主要对数据table查询，需要模糊查询并且满足在当前类别（如失物招领类）中查询
    return await db.collection("timeline").where([
      _.or([
        {
          place: db.RegExp({
            regexp: '.*' + event.data,
            options: 'i',
          })
        },
        {
          desc: db.RegExp({
            regexp: '.*' + event.data,
            options: 'i',
          })

        },
        {
          classes: db.RegExp({
            regexp: '.*' + event.data,
            options: 'i',
          })

        },
        {
          money: db.RegExp({
            regexp: '.*' + event.data,
            options: 'i',
          })
        },
        {
          nickName: db.RegExp({
            regexp: '.*' + event.data,
            options: 'i',
          })

        }

      ]),
      _.and({
        table: db.RegExp({
          regexp: event.table,
          options: 'i',
        })
      })
    ]
    ).orderBy('createTime', 'desc').skip(event.length).limit(30).get({
      success(res) {
        return res.data
      }
    }
    )
  } catch (e) {
    console.error(e)
  }
}