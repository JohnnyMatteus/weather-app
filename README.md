# Aplicativo do Tempo - Fullstack

Aplicação moderna de previsão do tempo com Arquitetura Limpa, backend em Node.js/Express e frontend em React.

## Visão Geral da Arquitetura

O projeto segue Arquitetura Limpa com separação clara de camadas e arquitetura híbrida de banco de dados:

### Backend (Node.js + TypeScript)
- Camada de Domínio: entidades e regras de negócio puras
- Camada de Aplicação: casos de uso e orquestrações
- Camada de Infraestrutura: bancos de dados, cache, mensageria, provedores externos
- Camada de Interface: controladores HTTP e rotas Express

### Frontend (React + TypeScript)
- Arquitetura baseada em features (módulos por domínio)
- Componentes compartilhados (UI e utilitários)
- Gerência de estado: Context API (cliente) + TanStack Query (servidor)

### Arquitetura de Banco de Dados
- PostgreSQL: usuários/autenticação
- MongoDB: dados de clima e histórico de buscas
- Redis: cache, rate limit e chaves de idempotência
- RabbitMQ: eventos assíncronos

## Funcionalidades

- Autenticação com JWT (access + refresh)
- Busca de clima por cidade e por geolocalização
- Histórico de buscas (máximo 5 por usuário)
- Previsão (próximos dias) via Open-Meteo
- Layout responsivo com modo claro/escuro
- PWA com Service Worker e Background Sync
- Observabilidade: métricas Prometheus e dashboards Grafana
- Tracing opcional com OpenTelemetry

## Tecnologias

### Backend
- Node.js 18+, Express, TypeScript
- PostgreSQL + MongoDB, Redis, RabbitMQ
- Validação com Zod, HTTP com Axios
- Testes com Vitest + Testcontainers
- Prometheus + Grafana; OpenTelemetry opcional

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Context API + TanStack Query
- React Hook Form + Zod
- React Router v6
- Testes com Vitest + Testing Library; E2E com Playwright
- PWA (manifest e sw.js)

### DevOps
- Docker + Docker Compose
- Nginx (reverse proxy)
- GitHub Actions (CI)

## Organização do Projeto

```
weather-app/
├── backend/                  # API (Express + TS)
│   ├── src/
│   │   ├── domain/          # Entidades e contratos
│   │   ├── application/     # Casos de uso
│   │   ├── infrastructure/  # DBs, cache, mensageria, provedores
│   │   └── interfaces/      # HTTP (controllers, rotas, middlewares)
│   ├── Dockerfile
│   └── vitest.config.ts
├── frontend/                 # Aplicação React
│   ├── public/              # manifest.webmanifest, sw.js
│   └── src/
│       ├── app/             # configuração de app/rotas
│       ├── features/        # auth, weather, history
│       └── shared/          # UI e utilidades
├── grafana/                  # dashboards provisionados
├── postman/                  # coleção de requests
├── docker-compose.yml        # stack completa
└── README.md
```

## Início Rápido

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Chave da OpenWeatherMap

### 1) Clonar o repositório
```bash
git clone https://github.com/JohnnyMatteus/weather-app.git
cd weather-app
```

### 2) Configurar variáveis de ambiente
```bash
# Copiar exemplos
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar backend/.env e informar suas chaves
# OPENWEATHER_API_KEY=sua-chave-aqui
```

### 3) Subir infraestrutura e apps
```bash
# Infra (PostgreSQL, Redis, RabbitMQ, MongoDB, Prometheus, Grafana)
make dev

# Instalar dependências
make install

# Rodar migrações
make migrate

# Backend (porta 3001)
make dev-backend

# Em outro terminal, frontend (porta 3000)
make dev-frontend
```

### 4) Acesso
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Documentação da API (Swagger): http://localhost:3001/docs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002
- RabbitMQ Management: http://localhost:15672

### 5) API (Postman)
- Importar `postman/WeatherApp.postman_collection.json`.
- Variáveis: BASE_URL=http://localhost:3001; ACCESS_TOKEN do login.

### 6) Testes
```bash
# Backend
cd backend && npm test

# Frontend
cd ../frontend && npm test
```

### 7) E2E (Playwright)
```bash
cd frontend
npm install
npx playwright install
npm run dev   # em outro terminal
npm run e2e
```

### 8) PWA
- Manifest: `frontend/public/manifest.webmanifest`
- Service Worker: `frontend/public/sw.js` (Background Sync de buscas)

## Monitoramento
- Métricas: `/api/metrics` (formato Prometheus) e alias `/metrics`.
- Grafana provisionado com painéis: HTTP, tempo de resposta, requisições a provedores, histórico, forecast, cache, fila RabbitMQ.

## Segurança
- JWT, Helmet, CORS configurados, validação com Zod
- Rate limiting por rota (Redis)
- Idempotência via `X-Idempotency-Key`

## OpenAPI
- Swagger UI em `/docs` com endpoints de autenticação, clima, histórico e previsão.

## Observações
- OpenTelemetry opcional: `OTEL_ENABLED=true` e `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Geolocalização e previsão disponíveis no frontend (botão “Usar minha localização” e lista de previsão).
