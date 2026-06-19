#!/bin/bash

# Deploy with Terraform
# Usage: ./scripts/deploy.sh <aws-region> <environment>

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <aws-region> <environment>"
    echo "Example: $0 us-east-1 production"
    exit 1
fi

AWS_REGION=$1
ENVIRONMENT=$2

echo "🔧 Configuring Terraform..."
cd terraform

echo "📥 Downloading Terraform providers..."
terraform init -upgrade

echo "🔍 Planning deployment..."
terraform plan -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}" -out=tfplan

echo "❓ Review the plan above. Continue? (yes/no)"
read -r response
if [ "$response" != "yes" ]; then
    echo "Deployment cancelled."
    exit 1
fi

echo "🚀 Applying Terraform configuration..."
terraform apply tfplan

echo "✅ Deployment complete!"
echo ""
echo "📊 Outputs:"
terraform output

rm -f tfplan
