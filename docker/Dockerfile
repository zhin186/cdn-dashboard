# 构建前端
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 构建后端
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# 生产镜像
FROM node:18-alpine
WORKDIR /app

# 安装Nginx
RUN apk add --no-cache nginx

# 复制后端
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# 复制前端
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Nginx配置
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    location /api { proxy_pass http://127.0.0.1:3000; proxy_http_version 1.1; } \
}' > /etc/nginx/conf.d/default.conf

# 启动脚本
RUN echo '#!/bin/sh\nnode dist/app.js &\nnginx -g "daemon off;"\n' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 80
CMD ["/app/start.sh"]