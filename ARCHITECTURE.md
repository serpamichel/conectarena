# 🏗️ AWS ECS Deployment - Visão Geral Técnica

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
                       ▼
            ┌──────────────────────┐
            │  Application Load    │
            │    Balancer (ALB)    │
            │  (ELB Public IP)     │
            └──────────┬───────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
    ┌─────────┐                 ┌─────────┐
    │Frontend │                 │ Backend │
    │(nginx)  │                 │ (Spring)│
    │ECS      │                 │ ECS     │
    │Fargate  │                 │ Fargate │
    └────┬────┘                 └────┬────┘
         │                           │
         │    VPC Private Subnet     │
         │                           │
         │         ┌────────────────┘
         │         │
         └────────┼───────────────────┐
                  │                   │
                  ▼                   ▼
            ┌──────────────┐   ┌─────────────┐
            │ RDS         │   │ CloudWatch  │
            │ PostgreSQL  │   │ Logs        │
            │ Multi-AZ    │   │ (Monitoring)│
            └─────────────┘   └─────────────┘
```

## Stack Técnico

| Componente | Tecnologia | Detalhes |
|-----------|-----------|----------|
| **Orquestra** | AWS ECS Fargate | Serverless container orchestration |
| **Frontend** | React + Vite | Static SPA servido via Nginx |
| **Backend** | Spring Boot 4.0.5 | Java 17, Spring Data JPA, Security |
| **Database** | PostgreSQL 16 | AWS RDS, Multi-AZ, backup automático |
| **Load Balancer** | AWS ALB | Application Load Balancer com routing |
| **Registry** | AWS ECR | Elastic Container Registry |
| **Logs** | CloudWatch Logs | Logs centralizados, 30 dias retenção |
| **Auto Scaling** | Target Tracking | CPU/Memory based scaling |
| **IaC** | Terraform | Infraestrutura como código |

## Fluxo de Deployment

```
1. Code Push
   ↓
2. Docker Build (Backend + Frontend)
   ↓
3. Push para ECR
   ↓
4. Terraform Apply (Infraestrutura)
   ↓
5. ECS Update Service
   ↓
6. ALB Health Check
   ↓
7. Aplicação Live ✅
```

## Configurações de Produção

### Backend (Spring Boot)
- **Profile**: `prod`
- **Database**: PostgreSQL (RDS)
- **Actuator**: Health checks habilitados
- **JVM**: G1GC, container-aware
- **Segurança**: Non-root user (uid 1000)
- **Healthcheck**: `/api/actuator/health`

### Frontend (Nginx)
- **Build**: Multi-stage, otimizado
- **Compression**: Gzip habilitado
- **Caching**: Static files com 30 dias de cache
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc
- **Routing**: SPA com fallback para index.html
- **Healthcheck**: `/health` endpoint

### Database (RDS)
- **Engine**: PostgreSQL 16.1
- **Multi-AZ**: Ativado (alta disponibilidade)
- **Backup**: 30 dias de retenção
- **Encryption**: Habilitado
- **Connection Pool**: Hikari com max 10 conexões
- **Monitoring**: CloudWatch integrado

### ECS
- **Compute**: Fargate (serverless)
- **Capacity Providers**: FARGATE + FARGATE_SPOT (50/50)
- **CPU/Memory**: Backend (512/1024), Frontend (256/512)
- **Desired Count**: 2 (mínimo)
- **Max**: 4 (auto scaling)
- **Health Checks**: 30s interval, 40s start period

## Network Architecture

```
VPC CIDR: 10.0.0.0/16

Public Subnets (2):
  - 10.0.1.0/24 (AZ1)
  - 10.0.2.0/24 (AZ2)
  - Internet Gateway
  - NAT Gateway

Private Subnets (2):
  - 10.0.10.0/24 (AZ1) → ECS Tasks
  - 10.0.11.0/24 (AZ2) → ECS Tasks
  - RDS Subnets
```

## Security Groups

| SG | Regras |
|----|--------|
| **ALB** | In: 80, 443 de 0.0.0.0/0 |
| **ECS Tasks** | In: 8080 (backend), 80 (frontend) do ALB |
| **RDS** | In: 5432 do SG ECS Tasks |

## Monitoramento

### CloudWatch Metrics
- **ECS**: CPU, Memory, DesiredCount, RunningCount
- **ALB**: RequestCount, TargetResponseTime, HTTPCode
- **RDS**: CPU, DatabaseConnections, StorageSpace
- **Custom**: Aplicação metrics via Micrometer

### Logs
- Centralizados em `/ecs/conectarena`
- Streams: `backend`, `frontend`
- Retenção: 30 dias

### Alarmes (Sugeridos)
```terraform
# Adicionar em monitoring.tf
- Backend CPU > 80%
- Backend Memory > 85%
- RDS CPU > 75%
- ALB Unhealthy Targets
- Task fail rate > 0%
```

## Auto Scaling Policies

### Backend Service
```
Min: 2 tasks
Max: 4 tasks

Scaling Triggers:
- CPU > 70% → Scale UP
- Memory > 80% → Scale UP
- Cooldown: 300s
```

### Frontend Service
```
Min: 2 tasks
Max: 4 tasks

Scaling Triggers:
- CPU > 70% → Scale UP
- Cooldown: 300s
```

## Custos Mensais Estimados

```
Fargate (vCPU):        $17
Fargate (Memory):      $1.80
RDS PostgreSQL:        $12
ALB:                   $16
CloudWatch Logs:       $7
Data Transfer:         $2

Total/mês:             ~$56
```

## Plano de Backup e Disaster Recovery

### Backup Automático
- ✅ RDS: 30 dias retenção
- ✅ Snapshots: Automático
- ✅ Multi-AZ: Ativado

### Recovery Time Objective (RTO)
- **Database**: < 5 minutos (RDS failover)
- **Application**: < 2 minutos (ALB rebalance)

### Recovery Point Objective (RPO)
- **Database**: < 1 minuto (automated backups)
- **Application**: N/A (stateless)

## Atualizações e Patches

### Container Images
- Usar `latest` tag em desenvolvimento
- Usar tags de versão em produção
- Renovação automática: definir política de renovação

### Dependências
- Spring Boot: Verificar vulnerabilidades mensalmente
- Base images: Docker images mantidas
- PostgreSQL: Minor updates automáticos

## Roadmap Futuro

- [ ] HTTPS/SSL com Certificate Manager
- [ ] WAF (Web Application Firewall)
- [ ] Secrets Manager integrado
- [ ] GitHub Actions CI/CD pipeline
- [ ] Blue/Green deployments
- [ ] Canary deployments
- [ ] Database read replicas
- [ ] CloudFront CDN
- [ ] ElastiCache (Redis)
- [ ] Lambda functions para cleanup
