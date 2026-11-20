// 云函数：获取评价列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { userId, page = 1, pageSize = 10 } = event

  try {
    // 1. 参数校验
    if (!userId) {
      return {
        success: false,
        message: '用户ID不能为空'
      }
    }

    // 2. 分页参数处理
    const pageNum = Math.max(1, parseInt(page) || 1)
    const size = Math.min(100, Math.max(1, parseInt(pageSize) || 10))
    const skip = (pageNum - 1) * size

    // 3. 查询该用户的所有评价（用于计算平均分）
    const allReviewsRes = await db.collection('Reviews')
      .where({
        toUserId: userId,
        isDeleted: _.neq(true)
      })
      .get()

    // 4. 计算平均评分
    let avgRating = 0
    const reviews = allReviewsRes.data
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0)
      avgRating = Math.round((totalRating / reviews.length) * 10) / 10 // 保留一位小数
    }

    // 5. 分页查询评价列表（按创建时间倒序）
    const reviewRes = await db.collection('Reviews')
      .where({
        toUserId: userId,
        isDeleted: _.neq(true)
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(size)
      .get()

    // 6. 获取评价人信息（非匿名评价）
    const reviewList = []
    for (const review of reviewRes.data) {
      let reviewerName = '匿名用户'
      let reviewerAvatar = ''

      // 如果评价人存在，获取其信息
      if (review.fromUserId) {
        try {
          const userRes = await db.collection('Users')
            .doc(review.fromUserId)
            .get()

          if (userRes.data) {
            reviewerName = userRes.data.nickname || '用户'
            reviewerAvatar = userRes.data.avatarUrl || ''
          }
        } catch (err) {
          console.log('获取评价人信息失败:', err)
        }
      }

      reviewList.push({
        _id: review._id,
        fromUserId: review.fromUserId,
        toUserId: review.toUserId,
        rating: review.rating,
        content: review.content || '',
        reviewerName: reviewerName,
        reviewerAvatar: reviewerAvatar,
        createTime: review.createTime
      })
    }

    // 7. 返回统一格式
    return {
      success: true,
      message: '获取评价列表成功',
      data: {
        list: reviewList,
        total: reviews.length,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(reviews.length / size),
        avgRating: avgRating
      }
    }

  } catch (error) {
    console.error('获取评价列表云函数错误:', error)
    return {
      success: false,
      message: '获取评价列表失败',
      error: error.message
    }
  }
}
