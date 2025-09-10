# Weather App Makefile

.PHONY: help up down logs test lint migrate seed clean dev

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
dev: ## Start development environment
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development services started. Backend: http://localhost:3001, Frontend: http://localhost:3000"

# Production
up: ## Start production environment
	docker-compose up -d
	@echo "Production services started. Backend: http://localhost:3001, Frontend: http://localhost:3000"

down: ## Stop all services
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs: ## Show logs for all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

# Database
migrate: ## Run database migrations
	cd backend && npm run migrate

seed: ## Seed database with initial data
	cd backend && npm run seed

# Testing
test: ## Run all tests
	cd backend && npm test
	cd frontend && npm test

test-backend: ## Run backend tests
	cd backend && npm test

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-coverage: ## Run tests with coverage
	cd backend && npm run test:coverage
	cd frontend && npm run test:coverage

# Linting
lint: ## Run linting for all projects
	cd backend && npm run lint
	cd frontend && npm run lint

lint-fix: ## Fix linting issues
	cd backend && npm run lint:fix
	cd frontend && npm run lint:fix

# Building
build: ## Build all projects
	cd backend && npm run build
	cd frontend && npm run build

# Cleanup
clean: ## Clean up containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

clean-all: ## Clean up everything including images
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker system prune -af

# Development helpers
install: ## Install dependencies for all projects
	cd backend && npm install
	cd frontend && npm install

dev-backend: ## Start backend in development mode
	cd backend && npm run dev

dev-frontend: ## Start frontend in development mode
	cd frontend && npm run dev

# Database management
db-studio: ## Open Prisma Studio
	cd backend && npm run db:studio

db-reset: ## Reset database
	cd backend && npx prisma migrate reset --force

# Monitoring
monitor: ## Open monitoring dashboards
	@echo "Opening monitoring dashboards..."
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana: http://localhost:3001 (admin/admin)"
	@echo "RabbitMQ Management: http://localhost:15672 (weather_user/weather_password)"

# Health checks
health: ## Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:3001/health && echo "Backend: OK" || echo "Backend: FAILED"
	@curl -f http://localhost:3000 && echo "Frontend: OK" || echo "Frontend: FAILED"
