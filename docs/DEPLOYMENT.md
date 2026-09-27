# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 14+
- GitHub account for CI/CD

## Local Development Setup

For the local backend, create `backend/.env` from [`backend/.env.example`](../backend/.env.example). Keep `DATABASE_URL` set to `file:./dev.db`; Prisma resolves it relative to `backend/prisma/schema.prisma`, selecting the local `backend/prisma/dev.db` database. This database is intentionally not tracked by Git, so existing user accounts and application data remain local. The frontend development server proxies same-origin `/api` requests to `http://localhost:5001`; restart it after changing the frontend proxy configuration. In production, configure the web server to proxy `/api` to the backend.

After pulling schema changes, run `npx prisma db push` from `backend/` to add the schema to your local database, then run `npm run seed:rules` to load the statutory rule configuration. This does not provision demo accounts. The backend test command seeds rules and runs the rule-engine suite using temporary test records.

For local portal sign-in shortcuts, run `npm run seed:demo-portals` from `backend/`. This adds or refreshes only the dedicated `demo.*@example.test` accounts and their role profiles; it does not clear or rewrite other users. The autofill card and demo credentials are available only in the frontend development server and are not included in production builds. Do not use these demo passwords for real accounts.

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
npx prisma db push
npm run seed:rules
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
