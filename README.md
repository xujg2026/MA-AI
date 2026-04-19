# M&A AI

面向并购业务场景的协作开发仓库。当前主线是一个 `React + Vite` 前端和一个 `Express + TypeScript` 后端，围绕买家画像、买家筛选、尽调辅助、推荐书生成、项目数据导入等能力组织。

`README` 只保留仓库入口信息；业务背景、页面地图、后端模块和 `MX Skills` 能力说明统一放在 [`docs/`](docs/README.md)。

## 当前主线

- `src/`: 前端主应用
- `server/`: 后端 API
- `docs/`: 协作文档和项目说明
- `mx-skills/`: 东方财富 Python 技能包
- `tic-intelligence/`: 独立历史/实验子项目，不在当前主应用启动链路中

## 快速开始

```bash
npm install
npm --prefix server install
cp .env.example .env
cp server/.env.example server/.env
```

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
- 后端健康检查：`http://localhost:3001/api/health`

运行前提：

- Node.js `20+`
- npm `10+`
- Python `3`（用于 `mx-skills`）

## 配置入口

根目录 `.env`：

- `VITE_API_BASE_URL=/api`

后端 `server/.env`：

- `EM_API_KEY`
- `QCC_API_KEY`
- `QCC_API_BASE_URL`
- `PORT`

## 文档入口

- [文档索引](docs/README.md)
- [项目概览](docs/project-overview.md)
  - 这里包含业务定位、TIC 相关背景、页面地图、后端模块和 `MX Skills` 能力地图
- [本地开发指南](docs/local-development.md)
- [后端 API 清单](docs/backend-api.md)
- [协作约定](docs/collaboration-guide.md)

## 当前注意事项

- 前端调用统一收口到 `src/services/api.js`，页面和组件里不要直接请求第三方服务。
- `QCC_API_KEY` 未配置时，QCC 相关能力会返回 `503` 或降级。
- `mx-skills` 相关能力依赖根目录 `mx-skills/`、Python 环境和 `EM_API_KEY`。
- 当前仓库仍是“原型 + 部分真实接口接入”的混合状态，哪些页面已接后端、哪些仍是演示态，见 [项目概览](docs/project-overview.md)。
- 仓库内存在 `tic-intelligence/` 子项目，但它是独立运行单元，和当前主应用的 `src/ + server/` 不是同一条启动链路。
