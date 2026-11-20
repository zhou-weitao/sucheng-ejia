// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 身份证号脱敏处理
 * 显示前3位和后4位，中间用*号代替
 * @param {string} idNumber - 完整身份证号
 * @returns {string} 脱敏后的身份证号
 */
function maskIdNumber(idNumber) {
  if (!idNumber || idNumber.length < 7) {
    return idNumber
  }
  const prefix = idNumber.substring(0, 3)
  const suffix = idNumber.substring(idNumber.length - 4)
  const maskLength = idNumber.length - 7
  const mask = '*'.repeat(maskLength)
  return prefix + mask + suffix
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type, realName, idNumber, imageUrls } = event

  try {
    // 1. 参数验证
    if (!type) {
      return {
        success: false,
        message: '认证类型不能为空',
        data: null,
        error: 'missing_type'
      }
    }

    if (!realName || realName.trim().length < 2) {
      return {
        success: false,
        message: '真实姓名至少需要2个字符',
        data: null,
        error: 'invalid_realName'
      }
    }

    if (!idNumber || idNumber.length !== 18) {
      return {
        success: false,
        message: '身份证号格式不正确',
        data: null,
        error: 'invalid_idNumber'
      }
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return {
        success: false,
        message: '请上传身份证图片',
        data: null,
        error: 'missing_imageUrls'
      }
    }

    // 2. 根据openid查询用户信息
    const userRes = await db.collection('Users')
      .where({
        openid: wxContext.OPENID
      })
      .get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在，请先登录',
        data: null,
        error: 'user_not_found'
      }
    }

    const user = userRes.data[0]
    const userId = user._id

    // 3. 检查是否存在待审核的认证记录，防止重复提交
    const pendingRes = await db.collection('Verifications')
      .where({
        userId: userId,
        status: 0 // 0: 待审核
      })
      .get()

    if (pendingRes.data.length > 0) {
      return {
        success: false,
        message: '您有实名认证正在审核中，请勿重复提交',
        data: null,
        error: 'duplicate_submission'
      }
    }

    // 4. 身份证号脱敏处理（隐私保护）
    const maskedIdNumber = maskIdNumber(idNumber)

    // 5. 创建实名认证记录
    const verificationData = {
      userId: userId,
      type: type,
      realName: realName,
      idNumber: maskedIdNumber, // 仅存储脱敏后的身份证号
      imageUrls: imageUrls,
      status: 0, // 0: 待审核
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const addRes = await db.collection('Verifications').add({
      data: verificationData
    })

    // 6. 更新用户表的认证状态为审核中
    await db.collection('Users')
      .doc(userId)
      .update({
        data: {
          idCardVerified: 1, // 1: 审核中
          updateTime: db.serverDate()
        }
      })

    return {
      success: true,
      message: '实名认证提交成功，请等待审核',
      data: {
        verificationId: addRes._id,
        status: 0
      },
      error: null
    }

  } catch (error) {
    console.error('提交实名认证错误:', error)
    return {
      success: false,
      message: '提交实名认证失败',
      data: null,
      error: error.message
    }
  }
}
