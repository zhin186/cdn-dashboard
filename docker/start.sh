#!/bin/sh

# 启动后端服务
node dist/app.js &
BACKEND_PID=$!

# 启动 Nginx
nginx -g 'daemon off;' &
NGINX_PID=$!

# 优雅关闭
trap "kill $BACKEND_PID $NGINX_PID; exit" SIGTERM SIGINT
wait