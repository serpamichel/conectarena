#!/bin/bash

# 🚀 START HERE - ConectaArena AWS ECS Deployment
# This script helps you get started with the deployment

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 ConectaArena - AWS ECS Deployment Setup Complete! 🚀   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 FILES CREATED:${NC}"
echo "   ✅ Backend Dockerfile (updated)"
echo "   ✅ Frontend Dockerfile (updated)"  
echo "   ✅ docker-compose.yml (updated)"
echo "   ✅ application-prod.properties"
echo "   ✅ nginx.conf"
echo "   ✅ Terraform infrastructure (9 files)"
echo "   ✅ Build and deploy scripts"
echo "   ✅ Documentation (4 guides)"
echo ""

echo -e "${BLUE}📚 DOCUMENTATION:${NC}"
echo "   1. SETUP_SUMMARY.md         → Executive summary"
echo "   2. DEPLOYMENT_CHECKLIST.md  → Step-by-step guide (START HERE!)"
echo "   3. AWS_DEPLOYMENT_GUIDE.md  → Detailed guide (200+ lines)"
echo "   4. ARCHITECTURE.md          → Technical overview"
echo ""

echo -e "${YELLOW}⏱️  QUICK START (5 MINUTES):${NC}"
echo ""
echo "1️⃣  Read the summary:"
echo "    cat SETUP_SUMMARY.md"
echo ""
echo "2️⃣  Start the checklist:"
echo "    cat DEPLOYMENT_CHECKLIST.md"
echo ""

echo -e "${YELLOW}🐳 TEST LOCALLY (15 MINUTES):${NC}"
echo ""
echo "   cp .env.example .env.local"
echo "   docker-compose build"
echo "   docker-compose up -d"
echo "   curl http://localhost:8080/api/actuator/health"
echo "   docker-compose down"
echo ""

echo -e "${YELLOW}☁️  DEPLOY TO AWS (60 MINUTES):${NC}"
echo ""
echo "   1. Configure AWS:  aws configure"
echo "   2. Build images:   bash scripts/build-and-push.sh us-east-1 <ACCOUNT_ID>"
echo "   3. Deploy:         cd terraform && terraform apply"
echo ""

echo -e "${GREEN}✨ You're all set! Start with: cat DEPLOYMENT_CHECKLIST.md${NC}"
echo ""
