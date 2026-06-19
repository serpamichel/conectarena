# 🚀 Guia Completo de Deploy no AWS ECS

## 📋 Pré-requisitos

### 1. Ferramentas Necessárias
```bash
# AWS CLI
aws --version  # v2.x+

# Docker
docker --version  # 20.x+

# Terraform (opcional, mas recomendado)
terraform --version  # 1.0+
```

### 2. Configurar AWS Credentials
```bash
aws configure
# Digite sua Access Key ID
# Digite sua Secret Access Key
# Digite sua região padrão (ex: us-east-1)
# Formato de output: json
```

### 3. Obter Account ID
```bash
aws sts get-caller-identity --query Account --output text
# Salve este ID
```

---

## 🐳 Step 1: Testar Localmente com Docker Compose

### 1.1 Criar arquivo .env
```bash
cp .env.example .env.local
# Edite .env.local com valores locais
```

### 1.2 Build e start dos containers
```bash
docker-compose build
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 1.3 Testar a aplicação
```bash
# Frontend
open http://localhost

# Backend API
curl http://localhost:8080/api/actuator/health

# Database (opcional)
docker-compose exec postgres psql -U postgres -d conectarena
```

### 1.4 Parar containers
```bash
docker-compose down
```

---

## 🔧 Step 2: Preparar AWS Infraestrutura

### 2.1 Criar ECR Repositories
```bash
AWS_REGION="us-east-1"
APP_NAME="conectarena"

# Backend
aws ecr create-repository \
  --repository-name ${APP_NAME}-backend \
  --region ${AWS_REGION}

# Frontend
aws ecr create-repository \
  --repository-name ${APP_NAME}-frontend \
  --region ${AWS_REGION}
```

### 2.2 Copiar e configurar Terraform
```bash
cd terraform

# Copiar arquivo de exemplo
cp terraform.tfvars.example terraform.tfvars

# Editar terraform.tfvars com seus valores
nano terraform.tfvars

# Ou usar arquivo local (mais seguro)
cat > terraform.tfvars.local <<EOF
aws_region            = "us-east-1"
db_password           = "seu-password-aqui"
container_image_tag   = "latest"
EOF

# Atualizar arquivo .env
cd ..
cp .env.example .env
# Editar .env com sua configuração
```

---

## 🐋 Step 3: Build e Push para ECR

### 3.1 Script automático
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

bash scripts/build-and-push.sh ${AWS_REGION} ${ACCOUNT_ID}
```

### 3.2 Manual (se preferir)
```bash
AWS_REGION="us-east-1"
ACCOUNT_ID="123456789012"
IMAGE_TAG="latest"

# Login no ECR
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin \
  ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build backend
docker build -f backend/Dockerfile \
  -t ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/conectarena-backend:${IMAGE_TAG} .

# Push backend
docker push ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/conectarena-backend:${IMAGE_TAG}

# Repetir para frontend
docker build -f frontend/Dockerfile \
  -t ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/conectarena-frontend:${IMAGE_TAG} .

docker push ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/conectarena-frontend:${IMAGE_TAG}
```

### 3.3 Verificar imagens
```bash
aws ecr list-images --repository-name conectarena-backend --region ${AWS_REGION}
aws ecr list-images --repository-name conectarena-frontend --region ${AWS_REGION}
```

---

## 🏗️ Step 4: Deploy com Terraform

### 4.1 Inicializar Terraform
```bash
cd terraform

terraform init
```

### 4.2 Planejar deployment
```bash
terraform plan -out=tfplan
```

### 4.3 Aplicar configuração
```bash
terraform apply tfplan
```

### 4.4 Obter outputs
```bash
terraform output

# Ou valores específicos
terraform output alb_dns_name
terraform output backend_ecr_repository_url
terraform output frontend_ecr_repository_url
```

---

## 🔍 Step 5: Verificar Deployment

### 5.1 Verificar ECS Services
```bash
aws ecs describe-services \
  --cluster conectarena-cluster \
  --services conectarena-backend conectarena-frontend \
  --region us-east-1
```

### 5.2 Verificar Tasks
```bash
aws ecs list-tasks \
  --cluster conectarena-cluster \
  --region us-east-1
```

### 5.3 Ver Logs
```bash
# Via AWS CLI
aws logs tail /ecs/conectarena --follow --region us-east-1

# Via CloudWatch Console
# https://console.aws.amazon.com/cloudwatch/
```

### 5.4 Testar aplicação
```bash
ALB_DNS=$(terraform output -raw alb_dns_name)

# Frontend
open http://${ALB_DNS}

# Backend
curl http://${ALB_DNS}/api/actuator/health
```

---

## 📊 Step 6: Monitorar e Manutenção

### 6.1 CloudWatch Metrics
- Acesse: https://console.aws.amazon.com/cloudwatch/
- Seção: Dashboards
- Metrics relacionadas a ECS, ALB, RDS

### 6.2 Auto Scaling
- Backend: CPU > 70% ou Memória > 80% → scale up
- Frontend: CPU > 70% → scale up

### 6.3 Logs
```bash
# Ver logs em tempo real
aws logs tail /ecs/conectarena --follow

# Pesquisar logs
aws logs filter-log-events \
  --log-group-name /ecs/conectarena \
  --filter-pattern "ERROR"
```

### 6.4 Backups Database
- RDS está configurado com:
  - Backup retention: 30 dias
  - Multi-AZ: habilitado
  - Automated backups: habilitado

---

## 🔄 Step 7: Atualizações e Redeployment

### 7.1 Fazer commit das mudanças
```bash
git add .
git commit -m "Add AWS ECS deployment configuration"
git push
```

### 7.2 Nova versão
```bash
# 1. Fazer mudanças no código
# 2. Build nova imagem
./scripts/build-and-push.sh us-east-1 ${ACCOUNT_ID}

# 3. ECS atualiza automaticamente (se usando latest)
# ou manualmente
aws ecs update-service \
  --cluster conectarena-cluster \
  --service conectarena-backend \
  --force-new-deployment \
  --region us-east-1
```

---

## ⚠️ Troubleshooting

### Problema: Task não inicia
```bash
# Ver motivo
aws ecs describe-tasks \
  --cluster conectarena-cluster \
  --tasks <task-arn> \
  --region us-east-1 | grep -A 5 "stopCode"

# Ver logs
aws logs tail /ecs/conectarena --follow
```

### Problema: ALB Health Check falha
```bash
# Verificar target group
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region us-east-1
```

### Problema: Database connection error
```bash
# Testar conexão RDS
aws rds describe-db-instances \
  --db-instance-identifier conectarena-db \
  --region us-east-1

# Ver security group
aws ec2 describe-security-groups \
  --group-ids <security-group-id> \
  --region us-east-1
```

---

## 💰 Custos Estimados (Monthly)

- **ECS Fargate**: $20-40 (2-4 tasks)
- **RDS PostgreSQL**: $10-20 (db.t3.micro/small)
- **ALB**: $15-20
- **Data Transfer**: $0-10
- **CloudWatch Logs**: $5-10

**Total**: ~$50-100/mês

---

## 🧹 Cleanup (Destruir tudo)

```bash
# ⚠️ AVISO: Isso vai deletar TUDO!

cd terraform

# Verificar o que será deletado
terraform plan -destroy

# Destruir
terraform destroy

# Remover estado remoto (se usando)
aws s3 rm s3://seu-bucket/conectarena/terraform.tfstate
```

---

## 📚 Recursos Úteis

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Spring Boot on AWS](https://aws.amazon.com/blogs/news/deploying-spring-boot-applications-on-aws/)

---

## ❓ Suporte

Em caso de dúvidas:
1. Verificar CloudWatch Logs
2. Revisar este guia
3. Consultar documentação oficial
4. Abrir issue no repositório
