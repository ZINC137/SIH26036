# System Architecture

## Overview
This document describes the technical architecture of the Legal Metrology Verification System.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Users (Web & Mobile)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐      ┌───▼────┐      ┌───▼────┐
    │ Web UI │      │ Mobile │      │Admin   │
    │(React) │      │(React  │      │Panel   │
    │        │      │Native) │      │        │
    └───┬────┘      └───┬────┘      └───┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │      API Gateway / Load         │
        │       Balancer (Nginx)          │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │      REST API Server            │
        │  (Node.js + Express / Python)   │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Business Logic Layer          │
        │  - Auth & Authorization         │
        │  - Verification Workflow        │
        │  - Certificate Generation       │
        │  - Alerts & Notifications       │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Database Layer (PostgreSQL)   │
        │  - Users & Stakeholders         │
        │  - Instruments & Verification   │
        │  - Certificates & Records       │
        └────────────────────────────────┘
```

## Key Components

### 1. Frontend (React)
- User authentication & login
- Dashboard for different stakeholder roles
- Forms for instrument verification submission
- Certificate viewer with QR code
- Real-time notifications

### 2. Backend API (Node.js/Python)
- User registration & profile management
- Verification workflow orchestration
- Certificate generation with QR codes
- Dashboard data aggregation
- Alert & notification engine
- Search and retrieval APIs

### 3. Mobile App (React Native)
- Field verification data entry
- Offline capability
- Document/photo upload
- Real-time sync with backend

### 4. Database (PostgreSQL)
- User accounts and roles
- Instrument registry
- Verification records
- Certificate storage
- Audit logs

## Data Flow

### Verification Process Flow
```
1. User registers → 2. Submit verification application → 
3. LMO assigns verification → 4. Field officer verifies → 
5. Generate certificate with QR → 6. Send notifications → 
7. User views certificate
```

## Security Architecture
- JWT-based authentication
- Role-based access control (RBAC)
- Encrypted connections (HTTPS/TLS)
- Input validation & sanitization
- SQL injection prevention
- XSS protection

## Deployment Architecture
```
GitHub → Docker Build → Container Registry → 
Kubernetes/Docker Swarm → Production Servers
```

---
*To be updated as development progresses*
