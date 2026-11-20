const formatTime = date => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${padZero(m)}-${padZero(d)}`;
};

const padZero = n => (n < 10 ? '0' + n : '' + n);

// 计算匹配度
const calcMatchScore = (user, target) => {
  let score = 0;
  let total = 0;

  // 科目匹配（权重50%）
  total += 50;
  const userSubjects = user.subjects || [];
  const targetSubjects = target.subjects || target.subject ? [target.subject] : [];
  const matched = userSubjects.filter(s => targetSubjects.includes(s));
  if (matched.length > 0) {
    score += 50 * (matched.length / Math.max(userSubjects.length, targetSubjects.length));
  }

  // 区域匹配（权重30%）
  total += 30;
  if (user.district && target.district && user.district === target.district) {
    score += 30;
  }

  // 年级匹配（权重20%）
  total += 20;
  if (user.grade && target.grade && user.grade === target.grade) {
    score += 20;
  }

  return Math.round((score / total) * 100);
};

module.exports = { formatTime, calcMatchScore };
