# 本地开发指南

## 1. 运行前提

建议本地具备以下环境：

- Node.js `20+`
- npm `10+`
- Python `3`（用于 `mx-skills`）

当前仓库没有统一 monorepo 工具，前端和后端分别安装依赖。

## 2. 安装依赖

在仓库根目录执行：

```bash
npm install
npm --prefix server install
```

## 3. 环境变量

前端环境变量：

```bash
cp .env.example .env
```

根目录 `.env` 当前主要使用：

```bash
VITE_API_BASE_URL=/api
```

后端环境变量：

```bash
cp server/.env.example server/.env
```

`server/.env` 当前支持：

```bash
EM_API_KEY=
QCC_API_KEY=
QCC_API_BASE_URL=https://agent.qcc.com/mcp
PORT=3001
```

## 4. 启动方式

终端 1，启动后端：

```bash
npm run server:dev
```

终端 2，启动前端：

```bash
npm run dev
```

默认地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`
- 健康检查：`http://localhost:3001/api/health`

## 5. 前后端联调说明

- Vite 在 `vite.config.js` 中把 `/api` 代理到 `http://localhost:3001`。
- 前端统一通过 `src/services/api.js` 发请求，默认 base URL 是 `/api`。
- 如果前后端不在同一域名下部署，可以改 `VITE_API_BASE_URL`。

## 6. 常用命令

前端：

```bash
npm run dev
npm run build
npm run lint
```

后端：

```bash
npm run server:dev
npm run server:build
npm run server:start
```

说明：

- 当前仓库没有配置统一的测试脚本。
- `server:start` 启动前需要先执行 `server:build`。

## 7. 外部依赖说明

### 7.1 mx-skills

后端的以下能力依赖 `mx-skills` Python 脚本：

- 买家画像
- 财务查询
- 财经资讯搜索
- 股票诊断
- 买家智能筛选

`server/src/utils/mxSkillRunner.ts` 默认查找路径是仓库根目录下的 `mx-skills/`。如果目录不存在，或者 `EM_API_KEY` 未配置，这些接口会失败，部分接口会返回降级/mock 数据。

### 7.2 QCC

尽调分析和推荐书生成依赖 `QCC_API_KEY`。可以先访问：

```bash
curl http://localhost:3001/api/qcc/status
```

若返回 `configured: false`，说明 QCC 相关功能当前不可用。

## 8. 常见问题

### 前端请求不到后端

优先检查：

- `npm run server:dev` 是否已启动
- `http://localhost:3001/api/health` 是否可访问
- 根目录 `.env` 是否仍为 `VITE_API_BASE_URL=/api`

### QCC 接口报错

优先检查：

- `server/.env` 是否配置 `QCC_API_KEY`
- 外网是否可访问 `QCC_API_BASE_URL`
- 是否命中了接口超时或返回 `503`

### mx-skills 能力异常

优先检查：

- 根目录是否存在 `mx-skills/`
- Python 是否可执行
- `EM_API_KEY` 是否已配置

### Excel 导入数据丢失

Excel 导入数据保存在浏览器本地 `localStorage`，由 Zustand `persist` 管理，不会写回后端数据库。清空浏览器站点数据后会一起消失。
