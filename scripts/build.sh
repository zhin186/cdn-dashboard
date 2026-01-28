#!/bin/bash
set -e

REGISTRY=${REGISTRY:-"your-registry.com/cdn-analytics"}
VERSION=${VERSION:-$(git describe --tags --always --dirty)}
IMAGE_TAG="$REGISTRY:$VERSION"
LATEST_TAG="$REGISTRY:latest"

echo "🚀 Building CDN Analytics Platform..."
echo "Image: $IMAGE_TAG"

# 构建多阶段镜像
docker build -f docker/Dockerfile -t $IMAGE_TAG -t $LATEST_TAG .

echo "✅ Build complete: $IMAGE_TAG"

# 推送到仓库（可选）
if [ "$PUSH" = "true" ]; then
  echo "📤 Pushing to registry..."
  docker push $IMAGE_TAG
  docker push $LATEST_TAG
fi

echo "🎉 Done! Image: $IMAGE_TAG"