// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 计算认证状态
 * 状态值说明: 0=未提交, 1=审核中, 2=已通过, 3=已拒绝
 * @param {Array} records - 该类型的所有认证记录
 * @returns {number} 状态值
 */
function calculateStatus(records) {
  if (!records || records.length === 0) {
    return 0 // 未提交
  }
  
  // 按时间排序（最新在前）
  const sorted = records.sort((a, b) => {
    return new Date(b.createTime) - new Date(a.createTime)
  })
  
  const latest = sorted[0]
  return latest.status
}

/**
 * 检查是否整体已认证通过
 * @param {number} idCardStatus - 身份证认证状态
 * @returns {boolean} 是否整体认证通过
 */
function isOverallVerified(idCardStatus) {
  // 整体认证通过要求身份证认证必须通过
  return idCardStatus === 2
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId } = event

  try {
    // 1. 参数验证
    if (!userId) {
      return {
        success: false,
        message: '用户ID不能为空',
        data: null,
        error: 'missing_userId'
      }
    }

    // 2. 查询用户所有认证记录（按创建时间倒序）
    const verificationRes = await db.collection('Verifications')
      .where({
        userId: userId
      })
      .orderBy('createTime', 'desc')
      .get()

    const allRecords = verificationRes.data
    const latest = allRecords.length > 0 ? allRecords[0] : null

    // 3. 按类型分组记录
    const idCardRecords = allRecords.filter(r => r.type === 'idCard')
    const studentRecords = allRecords.filter(r => r.type === 'student')
    const teacherQualRecords = allRecords.filter(r => r.type === 'teacherQual')

    // 4. 计算各类型的认证状态
    const idCardStatus = calculateStatus(idCardRecords)
    const studentStatus = calculateStatus(studentRecords)
    const teacherStatus = calculateStatus(teacherQualRecords)

    // 5. 计算整体是否认证通过
    const overallVerified = isOverallVerified(idCardStatus)

    // 6. 如果身份证已通过(status=2)，更新用户表的idCardVerified=2
    if (idCardStatus === 2) {
      await db.collection('Users')
        .doc(userId)
        .update({
          data: {
            idCardVerified: 2, // 2: 已通过
            updateTime: db.serverDate()
          }
        })
    }

    // 7. 历史记录仅保留必要字段（用于展示）
    const history = allRecords.map(record => ({
      _id: record._id,
      type: record.type,
      status: record.status,
      rejectReason: record.rejectReason || '',
      createTime: record.createTime,
      updateTime: record.updateTime
    }))

    return {
      success: true,
      message: '获取认证状态成功',
      data: {
        latest: latest,
        history: history,
        idCardStatus: idCardStatus,
        studentStatus: studentStatus,
        teacherStatus: teacherStatus,
        overallVerified: overallVerified
      },
      error: null
    }

  } catch (error) {
    console.error('获取认证状态错误:', error)
    return {
      success: false,
      message: '获取认证状态失败',
      data: null,
      error: error.message
    }
  }
}
