// 云函数：智能匹配家教
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 匹配权重配置
const WEIGHT = {
  SUBJECT: 0.5,    // 科目 50%
  DISTRICT: 0.3,   // 区域 30%
  GRADE: 0.2       // 年级 20%
}

// 距离加分（同区域且距离小于2公里，加5分）
const DISTANCE_BONUS = 5

// 年级相似度映射
const GRADE_SIMILARITY = {
  '小学': { '一年级': 1, '二年级': 1, '三年级': 1, '四年级': 1, '五年级': 1, '六年级': 1 },
  '初中': { '初一': 1, '初二': 1, '初三': 1 },
  '高中': { '高一': 1, '高二': 1, '高三': 1 }
}

exports.main = async (event, context) => {
  const { parentId, tutorId, requirementId, subject, district, grade, budgetMin, budgetMax } = event

  try {
    console.log('匹配参数:', { parentId, tutorId, requirementId, subject, district, grade })

    // 如果传入 parentId，查询该家长的最新需求来获取匹配参数
    let reqSubject = subject
    let reqDistrict = district
    let reqGrade = grade

    if (parentId) {
      const reqRes = await db.collection('Requirements')
        .where({ parentId, status: 'open' })
        .orderBy('createTime', 'desc')
        .limit(1)
        .get()

      if (reqRes.data.length > 0) {
        const req = reqRes.data[0]
        reqSubject = req.subjects && req.subjects[0]
        reqDistrict = req.district
        reqGrade = req.childGrade
        console.log('从需求获取参数:', { reqSubject, reqDistrict, reqGrade })
      }
    }

    // 如果是 tutorId 查询需求列表，直接返回所有开放需求
    if (tutorId) {
      const reqRes = await db.collection('Requirements')
        .where({ status: 'open' })
        .orderBy('createTime', 'desc')
        .limit(20)
        .get()

      return {
        success: true,
        message: '找到 ' + reqRes.data.length + ' 条需求',
        data: { matchedRequirements: reqRes.data }
      }
    }

    // 1. 查询所有已认证的家教
    const tutorRes = await db.collection('Tutor_Profiles')
      .where({
        verifyStatus: _.in([1, 2])
      })
      .get()

    console.log('找到家教数量:', tutorRes.data.length)

    // 2. 为每个家教计算匹配度
    const tutorsWithScore = tutorRes.data.map(tutor => {
      let totalScore = 0
      let detail = {}

      // 2.1 科目匹配 (50分)
      const subjectMatch = tutor.subjects && tutor.subjects.includes(reqSubject)
      detail.subjectScore = subjectMatch ? 50 : 0
      totalScore += detail.subjectScore

      // 2.2 区域匹配 (30分)
      const districtMatch = tutor.district === reqDistrict
      detail.districtScore = districtMatch ? 30 : 0
      totalScore += detail.districtScore

      // 2.3 年级匹配 (20分)
      let gradeScore = 0
      if (tutor.grade) {
        const tutorGradeGroup = getGradeGroup(tutor.grade)
        const reqGradeGroup = getGradeGroup(reqGrade)
        if (tutorGradeGroup === reqGradeGroup) {
          gradeScore = 20
        } else if (tutorGradeGroup && reqGradeGroup) {
          gradeScore = 10
        }
      }
      detail.gradeScore = gradeScore
      totalScore += gradeScore

      // 2.4 距离加分
      detail.distanceBonus = districtMatch ? DISTANCE_BONUS : 0
      totalScore += detail.distanceBonus

      // 2.5 预算匹配检查
      const budgetMatch = checkBudgetMatch(tutor.hourlyRate, budgetMin, budgetMax)
      detail.budgetMatch = budgetMatch

      return {
        ...tutor,
        matchScore: totalScore,
        matchDetail: detail
      }
    })

    // 3. 按匹配度降序排序
    const sortedTutors = tutorsWithScore
      .sort((a, b) => b.matchScore - a.matchScore)

    // 4. 分为匹配成功组和备选组
    const matchedTutors = sortedTutors.filter(t => t.matchScore >= 50)
    const otherTutors = sortedTutors.filter(t => t.matchScore < 50)

    console.log('匹配结果:', {
      匹配成功: matchedTutors.length,
      备选: otherTutors.length
    })

    // 5. 如果有requirementId，更新需求的匹配结果
    if (requirementId) {
      try {
        await db.collection('Requirements')
          .doc(requirementId)
          .update({
            data: {
              matchedTutors: matchedTutors.map(t => ({
                tutorId: t._id,
                matchScore: t.matchScore,
                contacted: false,
                matchTime: db.serverDate()
              })),
              updateTime: db.serverDate()
            }
          })
      } catch (err) {
        console.error('更新需求匹配结果失败:', err)
      }
    }

    return {
      success: true,
      message: '成功匹配到 ' + matchedTutors.length + ' 位家教',
      data: {
        matchedTutors: matchedTutors,
        alternativeTutors: otherTutors.slice(0, 10),
        totalCount: tutorRes.data.length,
        matchCount: matchedTutors.length
      }
    }

  } catch (error) {
    console.error('匹配算法执行失败:', error)
    return {
      success: false,
      message: '匹配失败: ' + error.message,
      error: error.stack
    }
  }
}

function getGradeGroup(grade) {
  if (!grade) return null

  const primary = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
  const middle = ['初一', '初二', '初三', '初中']
  const high = ['高一', '高二', '高三', '高中']

  if (primary.includes(grade) || grade.includes('小学')) return '小学'
  if (middle.includes(grade)) return '初中'
  if (high.includes(grade)) return '高中'
  return null
}

function checkBudgetMatch(tutorRate, budgetMin, budgetMax) {
  if (!tutorRate) return true

  let tutorMin, tutorMax
  if (tutorRate.includes('-')) {
    const parts = tutorRate.split('-')
    tutorMin = parseInt(parts[0])
    tutorMax = parseInt(parts[1])
  } else if (tutorRate.includes('以上')) {
    tutorMin = parseInt(tutorRate)
    tutorMax = 999
  } else {
    tutorMin = tutorMax = parseInt(tutorRate)
  }

  const min = Math.max(tutorMin || 0, budgetMin || 0)
  const max = Math.min(tutorMax || 999, budgetMax || 999)
  return min <= max
}
