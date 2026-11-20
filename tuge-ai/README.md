# 图格AI (Tuge-AI)

AI 图片生成平台，支持 Normal/Advanced/Super 三个级别的图片生成服务。

## 技术栈

- **前端**: React + Vite + TypeScript + Tailwind CSS
- **后端**: Cloudflare Workers (Hono)
- **数据库**: Cloudflare D1 (SQLite)
- **认证**: Better Auth + Cloudflare Turnstile

## 项目结构

```
tuge-ai/
├── apps/
│   ├── web/          # 前端 React 应用
│   └── api/          # Cloudflare Workers 后端
├── packages/
│   └── shared/       # 共享类型定义
├── package.json
└── README.md
```

## 开发

### 前置要求

- Node.js 18+
- pnpm 8+
- Wrangler CLI (`npm i -g wrangler`)

### 安装依赖

```bash
pnpm install
```

### 开发前端

```bash
pnpm dev
```

### 开发后端

```bash
cd apps/api
pnpm dev
```

### 部署

1. 初始化 D1 数据库:
```bash
wrangler d1 create tuge-ai-db
# 将返回的 database_id 填入 apps/api/wrangler.toml
```

2. 执行数据库迁移:
```bash
wrangler d1 execute tuge-ai-db --file=./src/db/schema.sql
```

3. 部署:
```bash
pnpm deploy
```

## 功能

- [x] 用户注册/登录
- [x] 邀请码注册
- [x] Cloudflare Turnstile 验证码
- [x] 积分系统
- [x] 图片生成 (Normal/Advanced/Super)
- [x] 参考图库
- [x] 任务管理
- [ ] AI 实际对接
- [ ] 支付系统

## 许可证

MIT
