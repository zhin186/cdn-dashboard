# 构建前端
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --production=false
COPY frontend/ ./
RUN npm run build

# 构建后端
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production=false
COPY backend/ ./
RUN npm run build

# 生产镜像
FROM node:18-alpine
WORKDIR /app

# 安装Nginx
RUN apk add --no-cache nginx && \
    mkdir -p /run/nginx

# 复制后端
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# 复制前端
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# 使用外部配置文件
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 80
CMD ["/bin/sh", "-c", "node /app/dist/app.js & sleep 2 && nginx -g 'daemon off;'"]