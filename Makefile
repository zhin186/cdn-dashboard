.PHONY: build push deploy all

REGISTRY ?= your-registry.com/cdn-analytics
VERSION ?= $(shell git describe --tags --always --dirty)
IMAGE = $(REGISTRY):$(VERSION)

# 一键构建
build:
	@echo "🔨 Building $(IMAGE)..."
	docker build -f docker/Dockerfile -t $(IMAGE) -t $(REGISTRY):latest .

# 推送镜像
push: build
	@echo "📤 Pushing $(IMAGE)..."
	docker push $(IMAGE)
	docker push $(REGISTRY):latest

# 本地运行（Docker Compose）
local:
	docker-compose -f docker/docker-compose.yml up --build

# 部署到 K8s
deploy:
	@IMAGE_TAG=$(IMAGE) ./scripts/deploy.sh

# 一键构建+部署
all: push deploy

# 清理
clean:
	docker rmi $(IMAGE) $(REGISTRY):latest || true
	kubectl delete -f k8s/ || true