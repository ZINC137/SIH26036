#!/bin/bash

# Phase 1: Foundation (Sep 3-9)
gh issue create --repo ZINC137/SIH26036 --title "Phase 1: Backend - Project Setup & Auth" --body "Backend Lead Tasks:
- [ ] Set up Node.js/Express project structure
- [ ] Create PostgreSQL database schema
- [ ] Implement JWT authentication
- [ ] Create user registration API
- [ ] Set up API error handling & middleware

Status: To Do" --label "backend,phase-1"

gh issue create --repo ZINC137/SIH26036 --title "Phase 1: Frontend - React Setup & Login" --body "Frontend Lead Tasks:
- [ ] Initialize React project
- [ ] Set up Material-UI theme
- [ ] Create login page
- [ ] Create navigation layout
- [ ] Set up routing structure

Status: To Do" --label "frontend,phase-1"

gh issue create --repo ZINC137/SIH26036 --title "Phase 1: Mobile - React Native Setup" --body "Mobile Developer Tasks:
- [ ] Initialize React Native project
- [ ] Create login screen
- [ ] Set up navigation
- [ ] Configure offline storage

Status: To Do" --label "mobile,phase-1"

gh issue create --repo ZINC137/SIH26036 --title "Phase 1: DevOps - Docker & Database Setup" --body "DevOps Tasks:
- [ ] Create Docker setup
- [ ] Create docker-compose.yml
- [ ] Set up PostgreSQL container
- [ ] Create .env configuration

Status: To Do" --label "devops,phase-1"

gh issue create --repo ZINC137/SIH26036 --title "Phase 1: QA - Testing Framework Setup" --body "QA Tasks:
- [ ] Set up testing framework (Jest)
- [ ] Create test templates
- [ ] Set up CI/CD GitHub Actions

Status: To Do" --label "qa,phase-1"

gh issue create --repo ZINC137/SIH26036 --title "Phase 1: PM - Documentation & Planning" --body "PM/Documentation Tasks:
- [ ] Finalize technical architecture doc
- [ ] Create API documentation structure
- [ ] Set up GitHub project board
- [ ] Create presentation outline

Status: To Do" --label "documentation,phase-1"

# Phase 2: Core Features (Sep 10-16)
gh issue create --repo ZINC137/SIH26036 --title "Phase 2: Backend - APIs & Business Logic" --body "Backend Lead Tasks:
- [ ] User profile management API
- [ ] Instrument registration API
- [ ] Verification submission API
- [ ] Dashboard statistics API
- [ ] Write unit tests

Status: To Do" --label "backend,phase-2"

gh issue create --repo ZINC137/SIH26036 --title "Phase 2: Frontend - Dashboard & Forms" --body "Frontend Lead Tasks:
- [ ] User dashboard layout
- [ ] Instrument registration form
- [ ] Verification submission form
- [ ] Dashboard widgets
- [ ] Responsive design implementation

Status: To Do" --label "frontend,phase-2"

gh issue create --repo ZINC137/SIH26036 --title "Phase 2: Mobile - Field Verification" --body "Mobile Developer Tasks:
- [ ] Field verification form
- [ ] Photo/document upload
- [ ] Real-time sync
- [ ] Offline mode implementation

Status: To Do" --label "mobile,phase-2"

gh issue create --repo ZINC137/SIH26036 --title "Phase 2: DevOps - Database Migrations" --body "DevOps Tasks:
- [ ] Database migration scripts
- [ ] Environment configuration
- [ ] Logging setup
- [ ] Monitoring setup

Status: To Do" --label "devops,phase-2"

gh issue create --repo ZINC137/SIH26036 --title "Phase 2: QA - Integration Testing" --body "QA Tasks:
- [ ] Write API integration tests
- [ ] Test user registration flow
- [ ] Test instrument registration
- [ ] Report bugs

Status: To Do" --label "qa,phase-2"

gh issue create --repo ZINC137/SIH26036 --title "Phase 2: PM - Documentation Update" --body "PM/Documentation Tasks:
- [ ] Update API documentation
- [ ] Create user guides
- [ ] Track progress on board

Status: To Do" --label "documentation,phase-2"

# Phase 3: Advanced Features (Sep 17-23)
gh issue create --repo ZINC137/SIH26036 --title "Phase 3: Backend - Certificates & Notifications" --body "Backend Lead Tasks:
- [ ] Verification workflow logic
- [ ] Certificate generation API
- [ ] QR code generation
- [ ] Email notifications
- [ ] Alert system API

Status: To Do" --label "backend,phase-3"

gh issue create --repo ZINC137/SIH26036 --title "Phase 3: Frontend - Advanced Dashboards" --body "Frontend Lead Tasks:
- [ ] Certificate viewer
- [ ] QR code display
- [ ] Notifications panel
- [ ] Admin dashboard
- [ ] Search & filter features

Status: To Do" --label "frontend,phase-3"

gh issue create --repo ZINC137/SIH26036 --title "Phase 3: Mobile - Certificate Viewer" --body "Mobile Developer Tasks:
- [ ] Certificate viewer mobile
- [ ] Notification handling
- [ ] Field officer dashboard
- [ ] Performance optimization

Status: To Do" --label "mobile,phase-3"

gh issue create --repo ZINC137/SIH26036 --title "Phase 3: DevOps - Kubernetes & Security" --body "DevOps Tasks:
- [ ] Docker image optimization
- [ ] Kubernetes manifests
- [ ] SSL/TLS configuration
- [ ] Database backups

Status: To Do" --label "devops,phase-3"

gh issue create --repo ZINC137/SIH26036 --title "Phase 3: QA - Advanced Testing" --body "QA Tasks:
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Cross-browser testing

Status: To Do" --label "qa,phase-3"

gh issue create --repo ZINC137/SIH26036 --title "Phase 3: PM - Presentation Prep" --body "PM/Documentation Tasks:
- [ ] Create deployment guide
- [ ] Finalize presentation slides
- [ ] Create demo video script
- [ ] Document lessons learned

Status: To Do" --label "documentation,phase-3"

# Phase 4: Polish & Deployment (Sep 24-30)
gh issue create --repo ZINC137/SIH26036 --title "Phase 4: Final Testing & Deployment" --body "All Teams:
- [ ] Code review & optimization
- [ ] Final bug fixes
- [ ] Performance tuning
- [ ] Production deployment
- [ ] Final regression testing

Status: To Do" --label "phase-4"

echo "✅ All issues created successfully!"
