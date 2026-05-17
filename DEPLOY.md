# M&A AI Platform - Docker Deployment Guide

## 快速部署

### 1. 上传项目到服务器

```bash
# 在本地打包项目
zip -r ma-ai-deploy.zip . -x "node_modules/*" -x ".git/*" -x "dist/*" -x "server/node_modules/*"

# 上传到服务器
scp ma-ai-deploy.zip root@你的服务器IP:/root/ma-ai/

# 在服务器解压
unzip ma-ai-deploy.zip -d /www/wwwroot/ma-ai/
```

### 2. 配置环境变量

在服务器上创建 `.env` 文件：

```bash
cd /www/wwwroot/ma-ai
cat > .env << 'EOF'
# 金融数据 API
EM_API_KEY=your_em_api_key_here
OPENAI_API_KEY=your_openai_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here
TUSHARE_TOKEN=your_tushare_token_here

# 企查查 API
QCC_API_KEY=your_qcc_api_key
QCC_API_SECRET=your_qcc_api_secret

# 新闻采集间隔（分钟）
NEWS_COLLECTION_INTERVAL=5
NEWS_ANALYSIS_INTERVAL=60
EOF
```

### 3. 构建并启动

```bash
cd /www/wwwroot/ma-ai

# 构建 Docker 镜像
docker compose build

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

### 4. 验证部署

```bash
# 检查容器状态
docker compose ps

# 检查健康端点
curl http://localhost/api/health

# 查看日志
docker compose logs backend
```

## 访问应用

部署成功后，访问 `http://你的服务器IP` 即可使用。

## 常用命令

```bash
# 停止服务
docker compose down

# 重启服务
docker compose restart

# 更新部署（重新构建）
docker compose down && docker compose build && docker compose up -d

# 查看实时日志
docker compose logs -f backend
```

## 目录结构

```
/www/wwwroot/ma-ai/        # 项目部署目录
├── docker-compose.yml     # Docker 编排配置
├── Dockerfile.frontend    # 前端 Docker 文件
├── Dockerfile.backend     # 后端 Docker 文件
├── nginx.conf            # Nginx 配置
└── .env                  # 环境变量（需创建）
```

## 注意事项

1. **防火墙配置**：确保阿里云安全组开放 80 端口
2. **环境变量**：必须配置 `EM_API_KEY` 等 API Key 才能正常使用金融数据功能
3. **mx-skills**：Python 脚本已内置在服务器代码中，无需额外安装