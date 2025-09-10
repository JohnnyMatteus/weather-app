# Weather App - Fullstack Application

A modern, production-ready weather application built with Clean Architecture principles, featuring a Node.js backend and React frontend.

## Architecture Overview

This project follows Clean Architecture principles with clear separation of concerns and a hybrid database architecture:

### Backend (Node.js + TypeScript)
- Domain Layer: Pure business logic and entities
- Application Layer: Use cases and business rules
- Infrastructure Layer: External services, databases, and frameworks
- Interface Layer: HTTP controllers and API endpoints

### Frontend (React + TypeScript)
- Feature-based Architecture: Organized by business features
- Shared Components: Reusable UI components and utilities
- State Management: Context API for client state, TanStack Query for server state

### Database Architecture
- PostgreSQL: User data, authentication, and relational data
- MongoDB: Weather data, search history, and time-series data
- Redis: Caching and session management
- RabbitMQ: Event-driven messaging

## Features

### Core Features
- User authentication (JWT with refresh tokens)
- Weather search by city name or geolocation
- Search history (last 5 searches per user)
- Forecast data (next days) via Open-Meteo
- Responsive design with dark/light mode
- PWA support with offline capabilities and Background Sync

### Technical Features
- Clean Architecture implementation
- Event-driven architecture with RabbitMQ
- Redis caching for performance
- Rate limiting (Redis sliding window) and security headers
- Idempotency middleware for write endpoints
- Comprehensive logging, Prometheus metrics, optional OpenTelemetry tracing
- Docker containerization
- Automated testing (unit + integration + E2E example with Playwright)
- CI/CD ready with GitHub Actions (example)

## Tech Stack

### Backend
- Runtime: Node.js 18+
- Framework: Express.js
- Language: TypeScript
- Databases: PostgreSQL (users) + MongoDB (weather data)
- Cache: Redis
- Message Queue: RabbitMQ
- Authentication: JWT (access + refresh tokens)
- Validation: Zod
- HTTP Client: Axios
- Testing: Vitest + Testcontainers
- Monitoring: Prometheus + Grafana; optional OTEL tracing

### Frontend
- Framework: React 18
- Build Tool: Vite
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- State Management: Context API + TanStack Query
- Forms: React Hook Form + Zod
- Routing: React Router v6
- Testing: Vitest + React Testing Library; Playwright E2E
- PWA: Service Worker + Background Sync

### DevOps
- Containerization: Docker + Docker Compose
- Monitoring: Prometheus + Grafana
- Reverse Proxy: Nginx

## Project Structure

```
weather-app/
├── backend/
├── frontend/
├── postman/
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- OpenWeatherMap API key

### 1) Clone the Repository
```bash
git clone <repository-url>
cd weather-app
```

### 2) Environment Setup
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and add your keys
# OPENWEATHER_API_KEY=your-api-key-here
```

### 3) Start Infrastructure and Apps
```bash
# Start infra (PostgreSQL, Redis, RabbitMQ, MongoDB, Prometheus, Grafana)
make dev

# Install dependencies (backend and frontend)
make install

# Run database migrations
make migrate

# Start backend (port 3001)
make dev-backend

# In another terminal, start frontend (port 3000)
make dev-frontend
```

### 4) Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/docs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002
- RabbitMQ Management: http://localhost:15672

### 5) API Usage (Postman)
- Import the collection located at `postman/WeatherApp.postman_collection.json`.
- Set variables:
  - BASE_URL: http://localhost:3001
  - ACCESS_TOKEN: use token from Auth - Login response

### 6) Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd ../frontend && npm test
```

### 7) E2E (Playwright)
```bash
cd frontend
npm install
npx playwright install
npm run dev  # in another terminal
npm run e2e  # run E2E tests
```

### 8) PWA
- Manifest disponível em `frontend/public/manifest.webmanifest`.
- Service Worker em `frontend/public/sw.js` (Background Sync para buscas).

## Monitoring
- Metrics: `/api/metrics` (Prometheus format) e `/metrics` alias.
- Dashboards Grafana provisionados; ajuste conforme necessário.

## Security
- JWT, Helmet, CORS configurado, validações com Zod
- Rate limiting por rota (Redis)
- Idempotência por header `X-Idempotency-Key`

## OpenAPI
- Swagger UI em `/docs` com endpoints de auth e weather documentados.

## Notes
- OpenTelemetry tracing é opcional: habilite com `OTEL_ENABLED=true` e configure `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Geolocalização e previsão disponíveis no frontend (botão “Usar minha localização” e lista de previsão).
