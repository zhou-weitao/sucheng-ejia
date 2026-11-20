const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    const { parentId, parentName, childGrade, district, subjects, timeAvailability, budgetRange, description, status } = event

    const reqData = {
      parentId,
      parentName,
      childGrade,
      district,
      subjects,
      timeAvailability,
      budgetRange,
      description,
      status: status || 'open',
      matchedTutors: [],
      alternativeTutors: [],
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const addRes = await db.collection('Requirements').add({
      data: reqData
    })

    return {
      success: true,
      message: '需求发布成功',
      data: {
        requirementId: addRes._id
      }
    }

  } catch (error) {
    console.error('发布需求云函数错误:', error)
    return {
      success: false,
      message: '发布需求失败',
      error: error.message
    }
  }
}
