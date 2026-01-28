#!/bin/bash
set -e

NAMESPACE=${NAMESPACE:-"cdn-analytics"}
IMAGE_TAG=${IMAGE_TAG:-"your-registry.com/cdn-analytics:latest"}

echo "🚀 Deploying to Kubernetes cluster..."
echo "Namespace: $NAMESPACE"
echo "Image: $IMAGE_TAG"

# 更新镜像标签
sed -i "s|image: cdn-analytics-platform:latest|image: $IMAGE_TAG|g" k8s/01-deployment.yaml

# 创建命名空间和基础资源
kubectl apply -f k8s/00-namespace.yaml

# 部署应用
kubectl apply -f k8s/01-deployment.yaml
kubectl apply -f k8s/02-service.yaml
kubectl apply -f k8s/03-hpa.yaml

# 等待部署完成
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/cdn-analytics -n $NAMESPACE --timeout=300s

# 获取访问地址
echo ""
echo "✅ Deployment successful!"
echo "📊 Access your dashboard at:"
kubectl get ingress cdn-analytics -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}'
echo ""