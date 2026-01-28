# 阶段1：构建前端
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --production=false
COPY frontend/ ./
RUN npm run build

# 阶段2：构建后端
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production=false
COPY backend/ ./
RUN npm run build

# 阶段3：生产镜像
FROM node:18-alpine AS production
WORKDIR /app

# 安装 Nginx 用于服务前端和反向代理
RUN apk add --no-cache nginx

# 复制后端
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 启动脚本
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 80 3000
CMD ["/app/start.sh"]