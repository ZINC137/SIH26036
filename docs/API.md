# API Documentation

## Base URL
```
https://api.sih26036.com/api/v1
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### Users
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users` - List users (admin only)

### Instruments
- `GET /instruments` - List user's instruments
- `POST /instruments` - Register new instrument
- `GET /instruments/:id` - Get instrument details
- `PUT /instruments/:id` - Update instrument
- `DELETE /instruments/:id` - Delete instrument

### Verifications
- `POST /verifications` - Submit verification application
- `GET /verifications` - List verifications
- `GET /verifications/:id` - Get verification details
- `PUT /verifications/:id/status` - Update verification status
- `POST /verifications/:id/assign` - Assign to LMO

### Certificates
- `GET /certificates` - List certificates
- `GET /certificates/:id` - Get certificate details
- `POST /certificates/:id/download` - Download certificate PDF
- `GET /certificates/:id/qr` - Get QR code

### Dashboard
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/pending` - Pending verifications
- `GET /dashboard/alerts` - Active alerts

---
*Detailed API specs to be added*
