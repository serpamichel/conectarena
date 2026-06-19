#!/bin/bash

# Build and Push Docker images to AWS ECR
# Usage: ./scripts/build-and-push.sh <aws-region> <account-id>

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <aws-region> <account-id>"
    echo "Example: $0 us-east-1 123456789012"
    exit 1
fi

AWS_REGION=$1
ACCOUNT_ID=$2
APP_NAME="conectarena"
IMAGE_TAG="latest"

# Calculate ECR URLs
BACKEND_ECR="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-backend"
FRONTEND_ECR="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-frontend"

echo "🔐 Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo "🏗️ Building backend image..."
docker build -f backend/Dockerfile -t ${BACKEND_ECR}:${IMAGE_TAG} -t ${BACKEND_ECR}:${IMAGE_TAG}-$(date +%s) .

echo "📤 Pushing backend image..."
docker push ${BACKEND_ECR}:${IMAGE_TAG}
docker push ${BACKEND_ECR}:${IMAGE_TAG}-$(date +%s)

echo "🏗️ Building frontend image..."
docker build -f frontend/Dockerfile -t ${FRONTEND_ECR}:${IMAGE_TAG} -t ${FRONTEND_ECR}:${IMAGE_TAG}-$(date +%s) .

echo "📤 Pushing frontend image..."
docker push ${FRONTEND_ECR}:${IMAGE_TAG}
docker push ${FRONTEND_ECR}:${IMAGE_TAG}-$(date +%s)

echo "✅ Done! Images pushed to ECR"
echo ""
echo "Backend: ${BACKEND_ECR}:${IMAGE_TAG}"
echo "Frontend: ${FRONTEND_ECR}:${IMAGE_TAG}"
