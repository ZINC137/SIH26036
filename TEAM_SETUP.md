# Team Setup Guide - SIH26036

## 🎯 Quick Start for All Team Members

### Step 1: Clone the Repository
```bash
git clone https://github.com/ZINC137/SIH26036.git
cd SIH26036
```

### Step 2: Create Your Feature Branch
```bash
# Backend Lead
git checkout -b feature/backend-setup

# Frontend Lead
git checkout -b feature/frontend-setup

# Mobile Developer
git checkout -b feature/mobile-setup

# DevOps
git checkout -b feature/devops-setup

# QA
git checkout -b feature/qa-setup

# PM/Documentation
git checkout -b feature/documentation-setup
```

### Step 3: Start Working in Your Folder
Each team member works in their respective folder without interfering with others.

---

## 📁 Folder Structure

### Backend (`backend/`)
```
backend/
├── src/
│   ├── routes/          # API endpoints
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── middleware/       # Auth, validation, etc.
│   └── utils/            # Helper functions
├── tests/                # Unit tests
└── .gitkeep
```

**Backend Lead starts here** → Initialize Node.js project, set up Express, create database schema

---

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/            # Page components (Login, Dashboard, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── context/          # Context API state management
│   └── styles/           # CSS/SCSS files
├── public/               # Static assets
└── .gitkeep
```

**Frontend Lead starts here** → Initialize React, set up Material-UI, create components

---

### Mobile (`mobile/`)
```
mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation structure
│   ├── services/         # API services
│   └── .gitkeep
```

**Mobile Developer starts here** → Initialize React Native, set up navigation

---

### Deployment (`deployment/`)
```
deployment/
├── docker/               # Dockerfile, docker-compose.yml
├── kubernetes/           # K8s manifests
├── scripts/              # Deployment scripts
└── .gitkeep
```

**DevOps starts here** → Create Docker setup, database config

---

### Tests (`tests/`)
```
tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
├── e2e/                  # End-to-end tests
└── .gitkeep
```

**QA starts here** → Write test suites

---

### Documentation (`docs/`)
```
docs/
├── api/                  # API documentation
├── architecture/         # Architecture docs
├── deployment/           # Deployment guides
└── .gitkeep
```

**PM/Documentation starts here** → Maintain documentation

---

## 🚀 Daily Workflow

### Morning: Update Your Branch
```bash
git pull origin main
git merge main into your-feature-branch
```

### During Day: Make Changes
```bash
# Make your changes...
git add .
git commit -m "feat: add user authentication"
```

### End of Day: Push Your Work
```bash
git push origin your-feature-branch
```

### Create Pull Request
1. Go to GitHub → Your repo → Pull Requests
2. Click "New Pull Request"
3. Select your branch
4. Add description of changes
5. Request 2 reviewers
6. Wait for approval, then merge

---

## 👥 Role-Specific Setup Commands

### Backend Lead
```bash
cd backend
npm init -y
npm install express pg jsonwebtoken bcryptjs cors dotenv
npm install -D nodemon jest supertest
mkdir -p src/{routes,controllers,models,middleware,utils}
```

### Frontend Lead
```bash
npx create-react-app frontend
cd frontend
npm install @mui/material @emotion/react @emotion/styled axios react-router-dom
```

### Mobile Developer
```bash
npx react-native init mobile
cd mobile
npm install @react-navigation/native react-native-screens
```

### DevOps
```bash
cd deployment
# Create docker-compose.yml with PostgreSQL, backend, frontend services
touch docker/Dockerfile docker/docker-compose.yml
```

### QA
```bash
cd tests
npm init -y
npm install jest supertest
```

### PM/Documentation
```bash
cd docs
# Keep updating markdown files as development progresses
```

---

## 📊 GitHub Project Board

Visit: https://github.com/ZINC137/SIH26036

### Issues Tracking
- **24 Issues created** across 4 phases
- Each issue has subtasks (checkboxes)
- Label your work with: `backend`, `frontend`, `mobile`, `devops`, `qa`, `documentation`
- Phase labels: `phase-1`, `phase-2`, `phase-3`, `phase-4`

### Workflow States
- **To Do** → Not started
- **In Progress** → Currently working on it
- **Review** → Waiting for PR approval
- **Done** → Merged to main

---

## 📅 Timeline & Milestones

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1** | Week 1 | Architecture, Auth, DB Schema |
| **Phase 2** | Week 2 | Core APIs, Dashboards |
| **Phase 3** | Week 3 | Certificates, Notifications |
| **Phase 4** | Week 4 | Testing, Deployment, Polish |

---

## 🔒 Git Best Practices

### Commit Message Format
```
<type>: <subject>

<body (optional)>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Example
```bash
git commit -m "feat: add user registration endpoint

- Create POST /api/users/register route
- Add input validation
- Hash password before storing"
```

### Before Pushing
```bash
git log --oneline -5  # Check your commits
git status            # Make sure everything is staged
```

---

## 🤝 Communication

### Daily Standup
- Update GitHub issues with progress
- Comment on your assigned tasks

### Weekly Sync
- Video call to demo features
- Discuss blockers
- Plan next week

### Questions?
- Create a GitHub Issue
- Tag relevant team members
- Ping on chat

---

## ⚠️ Common Issues

### Issue: "Your branch is behind origin/main"
```bash
git fetch origin
git merge origin/main
```

### Issue: "Conflict in merge"
```bash
git status  # See conflicting files
# Edit files to resolve conflicts
git add .
git commit -m "fix: resolve merge conflicts"
```

### Issue: "Accidentally committed to main"
```bash
git reset --soft HEAD~1  # Undo last commit, keep changes
git checkout -b feature/my-feature
git commit -m "feat: my feature"
```

---

## ✅ Before Submitting

- [ ] All 6 team members have commits
- [ ] README.md is up-to-date
- [ ] Documentation is complete
- [ ] Code is clean (no console.log, commented code)
- [ ] Tests pass
- [ ] Presentation is ready
- [ ] Demo works without errors

---

## 🎬 Ready to Start?

1. **Everyone:** Clone the repo
2. **Everyone:** Create your feature branch
3. **Backend Lead:** Start with `npm init` and Express setup
4. **Frontend Lead:** Start with React setup
5. **Mobile Dev:** Start with React Native setup
6. **DevOps:** Start with Docker setup
7. **QA:** Start with Jest setup
8. **PM:** Keep documentation updated

**Questions?** Check [CONTRIBUTING.md](./CONTRIBUTING.md)

Good luck! 🚀
