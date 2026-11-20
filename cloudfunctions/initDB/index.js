const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const collections = ['Users', 'Requirements', 'Tutor_Profiles', 'Reviews', 'Orders']
  const results = []

  // 只创建集合，不插入任何模拟数据
  for (const name of collections) {
    try {
      await db.createCollection(name)
      results.push(`集合 ${name} 创建成功`)
    } catch (e) {
      results.push(`集合 ${name} 已存在或创建失败`)
    }
  }

  return { success: true, message: '数据库集合初始化完成', details: results }
}
