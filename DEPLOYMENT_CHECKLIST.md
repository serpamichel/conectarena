# ✅ Checklist de Implementação - Docker/AWS ECS

## 📁 Arquivos Criados

### 1. **Configurações de Aplicação** 
- ✅ `backend/plataforma/src/main/resources/application-prod.properties` - Config PostgreSQL
- ✅ `frontend/figma/nginx.conf` - Config Nginx de produção
- ✅ `.env.example` - Variáveis de ambiente

### 2. **Docker** 
- ✅ `backend/Dockerfile` - Atualizado com healthcheck e security
- ✅ `frontend/Dockerfile` - Atualizado com nginx.conf customizado
- ✅ `docker-compose.yml` - Atualizado com PostgreSQL
- ✅ `backend/plataforma/pom.xml` - Adicionado PostgreSQL driver

### 3. **Infraestrutura AWS (Terraform)**
```
terraform/
├── main.tf                    # Provider e data sources
├── variables.tf               # Variáveis de entrada
├── vpc.tf                     # VPC, Subnets, Security Groups
├── rds.tf                     # RDS PostgreSQL
├── ecr.tf                     # ECR Repositories
├── ecs.tf                     # ECS Cluster
├── ecs_task_definitions.tf    # Task definitions
├── alb.tf                     # Application Load Balancer
├── ecs_services.tf            # ECS Services e Auto Scaling
├── outputs.tf                 # Outputs
├── terraform.tfvars.example   # Variables example
└── .gitignore                 # Git ignore
```

### 4. **Scripts**
- ✅ `scripts/build-and-push.sh` - Build e push para ECR
- ✅ `scripts/deploy.sh` - Deploy com Terraform

### 5. **Documentação**
- ✅ `AWS_DEPLOYMENT_GUIDE.md` - Guia completo passo a passo
- ✅ `ARCHITECTURE.md` - Visão geral técnica
- ✅ `.aws-deployment-plan.md` - Plano inicial

### 6. **CI/CD (Opcional)**
- ✅ `.github/workflows/deploy.yml` - GitHub Actions pipeline

---

## 🚀 Checklist de Execução

### **FASE 1: Preparação Local** ⏱️ 15-30 minutos

- [ ] **1.1** Clonar/atualizar repositório
  ```bash
  git clone <seu-repo>
  cd conectarena
  git pull origin main
  ```

- [ ] **1.2** Copiar arquivo de ambiente
  ```bash
  cp .env.example .env.local
  # Editar conforme necessário
  ```

- [ ] **1.3** Testar Docker Compose localmente
  ```bash
  docker-compose build
  docker-compose up -d
  
  # Aguardar ~30s e testar
  curl http://localhost:8080/api/actuator/health
  open http://localhost
  
  docker-compose down
  ```

- [ ] **1.4** Verificar se tudo está funcionando
  - Frontend carregando em http://localhost
  - Backend respondendo em http://localhost:8080/api/actuator/health

---

### **FASE 2: Configurar AWS** ⏱️ 20-30 minutos

- [ ] **2.1** Instalar/atualizar ferramentas
  ```bash
  # AWS CLI
  aws --version
  
  # Terraform
  terraform --version
  
  # Docker
  docker --version
  ```

- [ ] **2.2** Configurar AWS credentials
  ```bash
  aws configure
  # Quando perguntado:
  # - Access Key ID: <sua-chave>
  # - Secret Access Key: <sua-senha>
  # - Default region: us-east-1
  # - Default output: json
  ```

- [ ] **2.3** Verificar credenciais
  ```bash
  aws sts get-caller-identity
  # Salvar Account ID (valor de "Account")
  ```

- [ ] **2.4** Criar ECR repositories (opcional - Terraform faz isso)
  ```bash
  AWS_REGION="us-east-1"
  
  aws ecr create-repository \
    --repository-name conectarena-backend \
    --region $AWS_REGION
  
  aws ecr create-repository \
    --repository-name conectarena-frontend \
    --region $AWS_REGION
  ```

---

### **FASE 3: Configurar Terraform** ⏱️ 10-15 minutos

- [ ] **3.1** Navegar para pasta terraform
  ```bash
  cd terraform
  ```

- [ ] **3.2** Copiar arquivo de variáveis
  ```bash
  cp terraform.tfvars.example terraform.tfvars
  ```

- [ ] **3.3** Editar `terraform.tfvars`
  ```bash
  nano terraform.tfvars
  # Atualizar:
  # - aws_region (ex: us-east-1)
  # - db_password (IMPORTANTE: senha forte!)
  # - db_instance_class (usar db.t3.small para produção)
  # - Outros valores conforme necessário
  ```

- [ ] **3.4** ⚠️ Criar arquivo local seguro (para senha)
  ```bash
  cat > terraform.tfvars.local <<EOF
  db_password = "SuaSenhaForte123!@#"
  EOF
  
  # Adicionar ao .gitignore
  echo "terraform.tfvars.local" >> .gitignore
  ```

- [ ] **3.5** Inicializar Terraform
  ```bash
  terraform init
  ```

---

### **FASE 4: Build e Push das Imagens** ⏱️ 20-30 minutos

- [ ] **4.1** Voltar para raiz do projeto
  ```bash
  cd ..
  ```

- [ ] **4.2** Obter Account ID
  ```bash
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  echo $ACCOUNT_ID
  # Salvar para usar depois
  ```

- [ ] **4.3** Executar script de build e push
  ```bash
  bash scripts/build-and-push.sh us-east-1 $ACCOUNT_ID
  
  # Isso vai:
  # 1. Fazer login no ECR
  # 2. Build backend
  # 3. Push backend
  # 4. Build frontend
  # 5. Push frontend
  ```

- [ ] **4.4** Verificar imagens no ECR
  ```bash
  aws ecr list-images --repository-name conectarena-backend
  aws ecr list-images --repository-name conectarena-frontend
  ```

---

### **FASE 5: Deploy com Terraform** ⏱️ 10-15 minutos

- [ ] **5.1** Ir para pasta terraform
  ```bash
  cd terraform
  ```

- [ ] **5.2** Planejar o deployment
  ```bash
  terraform plan -out=tfplan
  
  # Revisar cuidadosamente!
  # Procurar por:
  # - 1 VPC
  # - 2 subnets públicas
  # - 2 subnets privadas
  # - 1 RDS instance
  # - 1 ALB
  # - 2 ECS services (backend + frontend)
  # - etc
  ```

- [ ] **5.3** Aplicar configuração
  ```bash
  terraform apply tfplan
  
  # Isso vai levar 5-10 minutos
  # Deixar rodando...
  ```

- [ ] **5.4** Obter outputs
  ```bash
  terraform output
  
  # Salvar valores importantes:
  # - alb_dns_name
  # - backend_ecr_repository_url
  # - frontend_ecr_repository_url
  ```

---

### **FASE 6: Verificar Deployment** ⏱️ 15-20 minutos

- [ ] **6.1** Aguardar estabilização
  ```bash
  # Aguardar ~5 minutos para tudo iniciar
  sleep 300
  ```

- [ ] **6.2** Verificar ECS services
  ```bash
  aws ecs describe-services \
    --cluster conectarena-cluster \
    --services conectarena-backend conectarena-frontend \
    --region us-east-1
  
  # Procurar por:
  # - runningCount: 2 (para cada serviço)
  # - status: ACTIVE
  ```

- [ ] **6.3** Verificar Tasks
  ```bash
  aws ecs list-tasks --cluster conectarena-cluster --region us-east-1
  
  # Descrever tarefas em detalhes
  aws ecs describe-tasks \
    --cluster conectarena-cluster \
    --tasks <task-arn> \
    --region us-east-1
  ```

- [ ] **6.4** Testar aplicação
  ```bash
  # Obter DNS do ALB
  ALB_DNS=$(terraform output -raw alb_dns_name)
  
  # Testar frontend
  open http://$ALB_DNS
  # ou
  curl -I http://$ALB_DNS
  
  # Testar backend
  curl http://$ALB_DNS/api/actuator/health
  ```

- [ ] **6.5** Ver logs
  ```bash
  aws logs tail /ecs/conectarena --follow
  
  # Procurar por erros ou avisos
  ```

---

### **FASE 7: Testes Funcionais** ⏱️ 10-15 minutos

- [ ] **7.1** Testar frontend
  - [ ] Página carrega sem erros
  - [ ] CSS/JS carregando
  - [ ] Imagens renderizando
  - [ ] Responsivo (mobile)

- [ ] **7.2** Testar backend
  ```bash
  ALB_DNS=$(terraform output -raw alb_dns_name)
  
  # Health check
  curl -v http://$ALB_DNS/api/actuator/health
  
  # Testar endpoints específicos
  curl http://$ALB_DNS/api/seu-endpoint
  ```

- [ ] **7.3** Testar database
  ```bash
  # Ver se backend consegue conectar (via logs)
  aws logs tail /ecs/conectarena --follow --grep "database"
  
  # Verificar queries sendo executadas
  ```

---

### **FASE 8: Setup CI/CD (Opcional)** ⏱️ 10-20 minutos

- [ ] **8.1** Criar IAM Role para GitHub Actions
  ```bash
  # Instruções em: https://github.com/aws-actions/configure-aws-credentials
  # Criar role com permissões para:
  # - ECR push
  # - ECS update-service
  ```

- [ ] **8.2** Adicionar secrets no GitHub
  - Settings → Secrets and variables → Actions
  - [ ] Adicionar `AWS_ACCOUNT_ID`
  - [ ] Adicionar `AWS_ROLE_ARN`

- [ ] **8.3** Testar workflow
  ```bash
  # Fazer commit de teste
  git add .github/workflows/deploy.yml
  git commit -m "Add GitHub Actions CI/CD"
  git push origin main
  
  # Ir em GitHub → Actions e monitorar
  ```

---

### **FASE 9: Monitoramento e Documentação** ⏱️ 5-10 minutos

- [ ] **9.1** Configurar alertas no CloudWatch
  - [ ] Backend CPU > 80%
  - [ ] Memory > 85%
  - [ ] RDS CPU > 75%
  - [ ] ALB Unhealthy Targets

- [ ] **9.2** Fazer commit final
  ```bash
  git add .
  git commit -m "Add AWS ECS infrastructure and deployment setup"
  git push origin main
  ```

- [ ] **9.3** Guardar informações importantes
  ```bash
  # Salvar em arquivo seguro:
  ALB_DNS=$(terraform output -raw alb_dns_name)
  DB_ADDRESS=$(terraform output -raw db_address)
  
  cat > deployment-info.txt <<EOF
  Application URL: http://$ALB_DNS
  Database Host: $DB_ADDRESS
  Account ID: $(aws sts get-caller-identity --query Account --output text)
  EOF
  
  # Manter em lugar seguro (NÃO commitar!)
  ```

---

## 📊 Status do Projeto

| Item | Status | Notas |
|------|--------|-------|
| Backend Dockerfile | ✅ | Atualizado com healthcheck |
| Frontend Dockerfile | ✅ | Nginx customizado |
| docker-compose.yml | ✅ | Com PostgreSQL |
| PostgreSQL migration | ✅ | application-prod.properties criado |
| Terraform VPC | ✅ | Pronto |
| Terraform RDS | ✅ | Pronto |
| Terraform ECS | ✅ | Pronto |
| Terraform ALB | ✅ | Pronto |
| Build scripts | ✅ | Pronto |
| Deploy scripts | ✅ | Pronto |
| Documentation | ✅ | Completa |
| GitHub Actions | ✅ | Template pronto |

---

## ⚠️ Pontos Importantes

### Segurança
- [ ] Não fazer commit de `terraform.tfvars` com senha
- [ ] Usar `terraform.tfvars.local` para senhas
- [ ] Adicionar ao `.gitignore`
- [ ] Usar AWS Secrets Manager para produção

### Performance
- [ ] Backend: 2 instances mínimo, max 4
- [ ] Frontend: 2 instances mínimo, max 4
- [ ] RDS: Multi-AZ habilitado
- [ ] ALB: Health checks a cada 30s

### Backup e Disaster Recovery
- [ ] RDS: 30 dias de retenção automática
- [ ] Snapshots: Automático
- [ ] Multi-AZ: Ativado
- [ ] Testar recovery: Simulado mês

### Custos
- [ ] Revisar AWS Billing após deploy
- [ ] Custos estimados: $50-100/mês
- [ ] Usar AWS Cost Explorer para monitorar

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Task não inicia | Ver logs: `aws logs tail /ecs/conectarena` |
| ALB Health Check falha | Verificar security groups e app health endpoints |
| Database connection error | Verificar security group RDS permite access do SG ECS |
| Terraform error | Deletar `.terraform.lock.hcl` e rodar `terraform init` |
| ECR login fail | Verificar AWS credentials: `aws sts get-caller-identity` |

---

## 📚 Recursos

- [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) - Guia completo
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Visão técnica
- [docker-compose.yml](./docker-compose.yml) - Compose para testes
- [terraform/](./terraform/) - Arquivos de infraestrutura

---

## ✅ Próximos Passos Recomendados

1. **Curto prazo** (hoje)
   - [ ] Executar até Fase 6
   - [ ] Testar aplicação

2. **Médio prazo** (próxima semana)
   - [ ] Setup CI/CD completo
   - [ ] Configurar backups automáticos
   - [ ] Setup de alertas

3. **Longo prazo** (próximo mês)
   - [ ] HTTPS/SSL com Certificate Manager
   - [ ] CDN com CloudFront
   - [ ] Blue/Green deployments
   - [ ] Canary deployments

---

**Boa sorte! 🚀**
