# Database Schema

## Overview
PostgreSQL database for Legal Metrology Verification System.

## Tables

### 1. users
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- full_name (VARCHAR)
- phone (VARCHAR)
- role (ENUM: user, lmo, gatc, admin)
- organization (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 2. instruments
```sql
- id (UUID, PK)
- owner_id (FK → users)
- instrument_type (VARCHAR)
- manufacturer (VARCHAR)
- model (VARCHAR)
- serial_number (VARCHAR, UNIQUE)
- capacity (VARCHAR)
- accuracy_class (VARCHAR)
- location (VARCHAR)
- status (ENUM: active, inactive, pending_verification)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 3. verifications
```sql
- id (UUID, PK)
- instrument_id (FK → instruments)
- applicant_id (FK → users)
- assigned_lmo_id (FK → users)
- verification_type (ENUM: initial, renewal)
- status (ENUM: pending, in_progress, completed, rejected)
- submission_date (TIMESTAMP)
- scheduled_date (TIMESTAMP)
- completed_date (TIMESTAMP)
- observations (TEXT)
- result (ENUM: pass, fail)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 4. certificates
```sql
- id (UUID, PK)
- verification_id (FK → verifications)
- certificate_number (VARCHAR, UNIQUE)
- issue_date (DATE)
- expiry_date (DATE)
- qr_code (VARCHAR)
- pdf_url (VARCHAR)
- status (ENUM: active, expired, revoked)
- created_at (TIMESTAMP)
```

### 5. audit_logs
```sql
- id (UUID, PK)
- user_id (FK → users)
- action (VARCHAR)
- entity_type (VARCHAR)
- entity_id (VARCHAR)
- changes (JSONB)
- created_at (TIMESTAMP)
```

---
*Schema to be finalized during development*
