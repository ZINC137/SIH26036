# SIH26036 — Legal Metrology Verification System

A web application for managing verification and certification of weighing and measuring instruments. It supports applicant submissions, statutory rules-based routing, field inspections, laboratory verification, and digital certificates.

## Features

- Role-based portals for applicants, administrators, Legal Metrology Officers (LMOs), field officers, and Government Approved Test Centres (GATCs).
- Application tracking, officer assignment, inspection evidence uploads, and verification workflows.
- Statutory rules engine for authority eligibility, routing, test requirements, and validity.
- Digital certificates, QR codes, notifications, and audit history.
- Local SQLite database and append-only database/upload backups.

## Technology

- Frontend: React, React Router, and Material UI.
- Backend: Node.js, Express, and Prisma.
- Database: SQLite.

## Local development

Prerequisites: Node.js 20+ and npm.

1. Install and configure the backend:

   ```bash
   cd backend
   npm ci
   cp .env.example .env
   ```

   Set `JWT_SECRET` in `backend/.env` to a long, unique secret. For a **new local database only**, initialize the schema and generate the Prisma client:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

   Do not point `DATABASE_URL` at a database with data you need to preserve before backing it up. Start the backend:

   ```bash
   npm start
   ```

2. In a separate terminal, start the frontend:

   ```bash
   cd frontend
   npm ci
   npm start
   ```

   The frontend runs at `http://localhost:3000` and proxies API requests to the backend at `http://localhost:5001`.

## Tests

Run backend tests from `backend/` after setting up a local database:

```bash
npm test
npm run test:e2e
npm run test:security
```

Run frontend tests or build from `frontend/`:

```bash
npm test
npm run build
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API](./docs/API.md)
- [Database](./docs/DATABASE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)
- [Local backups](./backups/README.md)
