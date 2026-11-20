// 云函数：创建评价
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { toUserId, rating, content = '', tags = [], isAnonymous = false } = event

  try {
    // 1. 参数校验
    if (!toUserId) {
      return {
        success: false,
        message: '被评价用户ID不能为空'
      }
    }

    if (!rating || rating < 1 || rating > 5) {
      return {
        success: false,
        message: '评分必须在1-5之间'
      }
    }

    // 2. 获取评价人用户ID (fromUserId)
    const fromUserRes = await db.collection('Users')
      .where({ openid: wxContext.OPENID })
      .get()

    if (fromUserRes.data.length === 0) {
      return {
        success: false,
        message: '评价人用户不存在'
      }
    }

    const fromUserId = fromUserRes.data[0]._id

    // 3. 检查被评价用户是否存在
    const toUserRes = await db.collection('Users')
      .doc(toUserId)
      .get()

    if (!toUserRes.data) {
      return {
        success: false,
        message: '被评价用户不存在'
      }
    }

    // 4. 创建评价文档
    const reviewData = {
      fromUserId: fromUserId,
      toUserId: toUserId,
      rating: rating,
      content: content,
      tags: tags,
      isAnonymous: isAnonymous,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const addRes = await db.collection('Reviews').add({
      data: reviewData
    })

    // 5. TODO: 更新家教的平均评分和评价数量 (待Phase 2实现)

    return {
      success: true,
      message: '评价创建成功',
      data: {
        reviewId: addRes._id,
        ...reviewData
      }
    }

  } catch (error) {
    console.error('创建评价云函数错误:', error)
    return {
      success: false,
      message: '评价创建失败',
      error: error.message
    }
  }
}
