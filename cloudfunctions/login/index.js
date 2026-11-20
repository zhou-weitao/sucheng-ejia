// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userInfo } = event
  
  try {
    // 1. 查询用户是否已存在
    const userRes = await db.collection('Users')
      .where({
        openid: wxContext.OPENID
      })
      .get()
    
    let user = null

    if (userRes.data.length > 0) {
      // 用户已存在，更新登录时间
      user = userRes.data[0]
      await db.collection('Users')
        .doc(user._id)
        .update({
          data: {
            updateTime: db.serverDate(),
            nickName: userInfo.nickName || user.nickName,
            avatarUrl: userInfo.avatarUrl || user.avatarUrl
          }
        })
    } else {
      // 新用户，创建账号
      const newUser = {
        openid: wxContext.OPENID,
        nickName: userInfo.nickName || '',
        avatarUrl: userInfo.avatarUrl || '',
        role: '', // 待选择
        phone: '',
        realName: '',
        idCardVerified: 0, // 0未认证/1审核中/2已认证
        isVip: false,
        vipExpireTime: null,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
      
      const addRes = await db.collection('Users').add({
        data: newUser
      })
      
      user = {
        _id: addRes._id,
        ...newUser
      }
    }
    
    return {
      success: true,
      message: '登录成功',
      data: {
        user: user,
        openid: wxContext.OPENID,
        isNewUser: userRes.data.length === 0
      }
    }
    
  } catch (error) {
    console.error('登录云函数错误:', error)
    return {
      success: false,
      message: '登录失败',
      error: error.message
    }
  }
}
