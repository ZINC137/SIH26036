# SIH26036 — Legal Metrology Verification & Certification Portal

[![CI Pipeline](https://github.com/ZINC137/SIH26036/actions/workflows/ci.yml/badge.svg)](https://github.com/ZINC137/SIH26036/actions/workflows/ci.yml)
[![Deployment Status](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://sih-26036-final.vercel.app)
[![Backend Status](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://sih26036-final.onrender.com)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?style=flat&logo=postgresql)](https://neon.tech)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

An enterprise-grade, statutory web platform for end-to-end management, verification, laboratory testing, and digital certification of weighing and measuring instruments under the **Legal Metrology Act, 2009** and **Legal Metrology (General) Rules, 2011**.

---

## 🌐 Live Demonstrations

* **Production Web Portal**: [https://sih-26036-final.vercel.app](https://sih-26036-final.vercel.app)
* **API Backend**: [https://sih26036-final.onrender.com](https://sih26036-final.onrender.com)
* **API Documentation**: [API Reference](./docs/API.md)

### Pre-Configured Demo Credentials

The system comes pre-seeded with 5 dedicated role accounts for immediate testing:

| Role | Portal Focus | Email | Password |
| :--- | :--- | :--- | :--- |
| **Citizen / Applicant** | Application submission, instrument registration, tracking | `priya@example.com` | `UserPassword123!` |
| **Gazetted LMO** | Statutory triage, jurisdiction routing, officer assignment, signing | `lmo1@gov.in` | `LmoPassword2026!` |
| **Field Inspector** | On-site verification, physical seal stamping, error calculation | `anjali@example.com` | `FieldOfficerPassword123!` |
| **GATC Supervisor** | Central laboratory testing, test report upload, accuracy tests | `gatc1@gov.in` | `GatcPassword2026!` |
| **Super Administrator**| State-wide analytics, officer appointments, audits, DB reset | `admin@example.com` | `AdminPassword123!` |

---

## ✨ Key System Features

1. **Dedicated Role Portals**:
   * **Citizen Portal**: Multi-step application submission, dynamic technical specification forms, document uploads, and real-time status tracking.
   * **LMO Portal**: Triage dashboard, jurisdiction assignment to Field Officers or GATCs, approval/rejection workflows, and digital certificate signing.
   * **Field Officer (FO) Portal**: Mobile-responsive on-site inspection console, statutory error calculation, seal numbering, and test observation reporting.
   * **GATC Lab Portal**: Queue management for high-capacity or flow instruments (water meters, fuel dispensers, flow meters), test reports, and verification certificates.
   * **Admin Portal**: Executive analytics, appointment registries for LMOs & GATCs, comprehensive audit logs, and a 1-click test database reset tool.

2. **Statutory Metrology Rules Engine**:
   * Pre-configured with **27 legal metrology categories** covering weighing instruments, measuring instruments, and flow dispensers.
   * Dynamically resolves statutory authority eligibility (LMO vs. GATC), maximum permissible error (MPE) thresholds, and validity renewal cycles (12, 24, or 60 months).

3. **Cloud PostgreSQL & Permanent Document Persistence**:
   * Powered by **Neon Serverless PostgreSQL** for zero data loss across devices and server restarts.
   * Integrated `DocumentContent` table that securely stores and streams uploaded invoices, calibration reports, and photos directly from the cloud database, preventing file loss on ephemeral container platforms like Render.

4. **Digital Certificates & QR Code Verification**:
   * Cryptographically verifiable digital certificates with SHA-256 seal numbers.
   * Embedded QR codes that dynamically link to public verification endpoints for instant field auditing.

5. **Modernized Executive UI**:
   * Built on Material UI (MUI Grid v2) with curated status badges, responsive form cards, and statutory workflow guidance.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["Citizen / Officer (Web & Mobile Browser)"]
    Vercel["Frontend Application (Vercel CDN)"]
    Render["Backend API Service (Render Node.js)"]
    Neon["Neon PostgreSQL Cloud Database"]
    Engine["Legal Metrology Rules Engine"]
    Storage["Cloud File Storage (Neon DocumentContent)"]

    Client -->|HTTPS| Vercel
    Vercel -->|API Reverse Proxy /api/*| Render
    Render --> Engine
    Render -->|Prisma ORM| Neon
    Render -->|Persistent Documents| Storage
```

---

## 🛠️ Technology Stack

* **Frontend**: React 18, React Router v6, Material UI (MUI v5/v6 Grid v2), Lucide Icons.
* **Backend**: Node.js 20+, Express.js 5, Prisma ORM 5.22.
* **Database**: PostgreSQL (Neon Cloud Serverless).
* **Security & Auth**: Argon2id password hashing, HTTP-only JWT cookies, OWASP security headers, input sanitization, rate limiting.
* **CI/CD**: GitHub Actions pipeline with automated PostgreSQL service containers.

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v20 or higher
* **npm**: v9 or higher
* **PostgreSQL**: Local PostgreSQL instance OR a free [Neon](https://neon.tech) cloud database URL.

### 1. Backend Configuration
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm ci

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL database URL and a strong JWT secret:
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
DATABASE_URL="postgresql://user:password@localhost:5432/sih26036"
JWT_SECRET="your-secure-jwt-secret-key-min-32-chars"
```

Initialize database schema and seed statutory legal metrology rules:
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed 27 metrology categories and demo portal accounts
npm run seed:rules

# Start backend server
npm run dev
```
The backend will run at `http://localhost:5001`.

### 2. Frontend Configuration
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm ci

# Start frontend development server
npm start
```
The frontend will start at `http://localhost:3000` with automated proxying to port 5001.

---

## 🧪 Testing & Quality Assurance

The system includes comprehensive automated test suites covering statutory rule evaluations, QR code environment parsing, security audits, and production builds:

```bash
cd backend

# 1. Run statutory rules engine & QR environment regression tests
npm test

# 2. Run OWASP security & access control audit suite
npm run test:security

# 3. Run end-to-end QA flow test
npm run test:e2e
```

To test the frontend production bundle:
```bash
cd frontend
npm test -- --watchAll=false
npm run build
```

---

## 🔒 Security & Defensive Engineering

* **Authentication & Session Security**: Argon2id password derivation with unique per-user salts; credentials delivered via secure, HTTP-only JWT cookies.
* **IDOR Protection**: Strict object-level ownership checks preventing cross-user and cross-task document or application access.
* **Ephemeral Disk Defense**: Uploaded documents are automatically persisted into PostgreSQL and dynamically re-cached if container filesystems reset.
* **Input Sanitization**: Whitelisted MIME types, file signature validation, anti-directory traversal checks, and express-rate-limit defenses against Denial of Service (DoS).

---

## 📚 Project Documentation

* [System Architecture](./docs/ARCHITECTURE.md)
* [REST API Specification](./docs/API.md)
* [Database Schema Details](./docs/DATABASE.md)
* [Production Deployment Guide](./docs/DEPLOYMENT.md)
* [Contributing Guidelines](./CONTRIBUTING.md)
* [Backup & Recovery Procedures](./backups/README.md)

---

## 📄 License

This project is licensed under the **ISC License**. Developed for the **Smart India Hackathon (SIH 2026)**.
