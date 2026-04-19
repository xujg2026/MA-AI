# M&A AI

面向并购业务场景的协作开发仓库。当前主线是一个 `React + Vite` 前端和一个 `Express + TypeScript` 后端，围绕买家画像、买家筛选、尽调辅助、推荐书生成、项目数据导入等能力组织。

## 主线目录

- `src/`: 前端应用
- `server/`: 后端 API
- `docs/`: 协作文档
- `tic-intelligence/`: 独立历史/实验子项目，不在当前主应用启动链路中

## 快速开始

```bash
npm install
npm --prefix server install
cp .env.example .env
cp server/.env.example server/.env
```

启动后端：

```bash
npm run server:dev
```

启动前端：

```bash
npm run dev
```

默认地址：

- 前端：`http://localhost:5173`
- 后端健康检查：`http://localhost:3001/api/health`

## 环境变量

前端 `.env`：

- `VITE_API_BASE_URL=/api`

后端 `server/.env`：

- `EM_API_KEY`
- `QCC_API_KEY`
- `QCC_API_BASE_URL`
- `PORT`

## 文档导航

- [文档索引](docs/README.md)
- [项目概览](docs/project-overview.md)
- [本地开发指南](docs/local-development.md)
- [后端 API 清单](docs/backend-api.md)
- [协作约定](docs/collaboration-guide.md)

## 当前注意事项

- `server/src/utils/mxSkillRunner.ts` 默认从仓库根目录下的 `mx-skills/` 调用 Python 脚本；缺失时相关接口无法正常工作。
- `QCC_API_KEY` 未配置时，QCC 相关能力会返回 `503` 或降级。
- 前端仍有部分页面使用 mock 数据，哪些页面已接后端、哪些仍是演示态，见 [项目概览](docs/project-overview.md)。
- 仓库内存在 `tic-intelligence/` 子项目，但它是独立运行单元，和当前主应用的 `src/ + server/` 不是同一条启动链路。
