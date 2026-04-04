# Integracao React (Canva) + Spring Boot

Este repositorio agora esta organizado assim:

- backend/plataforma: API Java Spring Boot
- frontend/canva-app: Frontend React + TypeScript (exportado do Canva/Figma)

## 1) Subir backend (porta 8080)

Pre-requisito: instalar JDK (nao apenas JRE), pois o projeto precisa de `javac` para compilar.

Exemplo Ubuntu:

```bash
sudo apt install openjdk-21-jdk-headless
```

```bash
cd backend/plataforma
./mvnw spring-boot:run
```

Teste rapido da API:

```bash
curl http://localhost:8080/api/status
```

## 2) Subir frontend (porta 5173)

```bash
cd frontend/canva-app
npm install
npm run dev
```

Abrir no navegador:

- http://localhost:5173

## Como a integracao funciona

- O Vite esta com proxy de `/api` para `http://localhost:8080`.
- No React, a chamada `fetch('/api/status')` ja foi adicionada para validar conexao.
- O Spring tambem esta com CORS liberado para `http://localhost:5173` em rotas `/api/**`.

## Proximo passo

Substituir dados mock do frontend por chamadas reais para endpoints Spring dentro de `src/app/data` e paginas em `src/app/pages`.
