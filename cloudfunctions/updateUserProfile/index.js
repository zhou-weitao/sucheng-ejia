// 云函数：更新用户资料
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { role, userData, tutorData } = event

  try {
    // 1. 先查询用户信息获取 userId
    const userRes = await db.collection('Users')
      .where({ openid: wxContext.OPENID })
      .get()

    if (userRes.data.length === 0) {
      return { success: false, message: '用户不存在' }
    }

    const userId = userRes.data[0]._id

    // 2. 更新Users表
    await db.collection('Users')
      .doc(userId)
      .update({
        data: {
          ...userData,
          role: role,
          updateTime: db.serverDate()
        }
      })

    // 3. 如果是家教，同时更新Tutor_Profiles表
    if (role === 'tutor' && tutorData) {
      // 检查是否已存在家教资料
      const tutorRes = await db.collection('Tutor_Profiles')
        .where({ userId })  // 使用userId关联，不是openid
        .get()

      if (tutorRes.data.length > 0) {
        // 更新
        await db.collection('Tutor_Profiles')
          .doc(tutorRes.data[0]._id)
          .update({
            data: {
              ...tutorData,
              updateTime: db.serverDate()
            }
          })
      } else {
        // 新增
        await db.collection('Tutor_Profiles').add({
          data: {
            userId,  // 使用Users表的_id关联
            ...tutorData,
            verifyStatus: 1, // 审核中
            averageRating: 0,
            reviewCount: 0,
            totalStudents: 0,
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        })
      }
    }
    
    return {
      success: true,
      message: '资料更新成功'
    }
    
  } catch (error) {
    console.error('更新用户资料错误:', error)
    return {
      success: false,
      message: '资料更新失败',
      error: error.message
    }
  }
}
