---
title: Git工作流规范
version: 1.0.0
date: 2026-05-01
---

# 🌿 Git工作流规范

## 分支策略

### 长期分支
- **main** - 生产环境代码，只有测试通过的代码才能合并
- **develop** - 开发分支，所有功能开发完成后先合并到这里

### 短期分支
- **feature/xxx** - 功能开发分支，从develop切出
- **bugfix/xxx** - Bug修复分支，从develop切出
- **hotfix/xxx** - 紧急修复分支，从main切出

---

## 分支命名规范

```
feature/<功能名称>-<开发者>
bugfix/<问题描述>
hotfix/<紧急问题>
```

**示例：**
- feature/login-page-zhangsan
- feature/match-algorithm-lisi
- bugfix/avatar-upload-fail
- hotfix/database-connection-error

---

## 提交流程

### 1. 开发新功能

```bash
# 1. 更新本地develop分支
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/xxx-feature

# 3. 开发并提交
git add <文件>
git commit -m "feat(xxx): 描述"

# 4. 推送到远程
git push origin feature/xxx-feature
```

### 2. 创建Pull Request

1. 在Gitee/GitHub上创建PR，目标分支：develop
2. 填写PR模板中的所有信息
3. 指派至少1人进行代码审查
4. 审查通过后合并

### 3. 代码审查

- 审查人使用《代码审查清单.md》逐项检查
- 发现问题使用评论标注，标记审查状态：
  - ✅ 批准合并
  - ❌ 请求修改
- 作者回应所有评论并修复问题
- 重新审查通过后合并

---

## 提交信息规范

**格式：**
```
<类型>(<范围>): <主题>

<正文>

<关联>
```

### 类型说明

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复bug |
| docs | 文档更新 |
| style | 代码格式调整（不影响代码运行） |
| refactor | 重构（既不是新增功能，也不是bug修复） |
| perf | 性能优化 |
| test | 增加测试或修正测试 |
| chore | 构建过程、工具、依赖库等辅助工具的变动 |
| revert | 撤销之前的提交 |

### 好的示例

```
feat(match): 添加匹配度距离加分机制

- 计算家教和家长的直线距离
- 距离小于2公里加5分
- 增加距离显示在匹配卡片上

Closes #12
```

```
fix(upload): 修复头像上传失败问题

- 增加文件大小校验（最大2MB）
- 增加格式校验（只支持jpg/png）
- 上传失败显示具体错误信息

Fixes #45
```

### 坏的示例

❌ `更新代码` - 太模糊，不知道做了什么
❌ `fix bug` - 哪个bug？怎么修的？
❌ `wip` - 不要提交半成品，除非有特殊原因

---

## 版本发布

当develop分支功能稳定，准备发布新版本时：

1. 创建`release/vx.y.z`分支
2. 进行全面测试和Bug修复
3. 测试通过后合并到main和develop
4. 在main分支打tag：`v1.0.0`
5. 编写发布说明

---

*版本：v1.0.0*
*更新日期：2026-05-01*
