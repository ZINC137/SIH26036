# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 14+
- GitHub account for CI/CD

## Local Development Setup

### 1. Environment Variables
Create `.env` file in root:
```
DATABASE_URL=postgresql://user:password@localhost:5432/sih26036
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

### 2. Docker Compose
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Backend API server
- Frontend dev server

### 3. Database Migrations
```bash
cd backend
npm run migrate
```

## Production Deployment

### Docker Build
```bash
docker build -t sih26036-api:latest .
docker push your-registry/sih26036-api:latest
```

### Kubernetes Deployment
```bash
kubectl apply -f deployment/k8s/
```

### Environment Variables (Production)
- `DATABASE_URL` - Prod database connection
- `JWT_SECRET` - Strong secret key
- `API_URL` - Production API endpoint
- `LOG_LEVEL` - Set to 'info'

## CI/CD Pipeline
GitHub Actions workflow:
1. Run tests on push
2. Build Docker image
3. Push to registry
4. Deploy to staging
5. Run integration tests
6. Deploy to production

---
*Detailed deployment steps to be finalized*
