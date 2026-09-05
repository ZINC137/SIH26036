# Contributing Guide

## Team Members & Responsibilities

### Backend Lead
- Design REST API endpoints
- Set up database schema
- Implement business logic
- Handle authentication & authorization
- Location: `backend/`

### Frontend Lead
- Create React UI components
- Build dashboards
- Handle form submissions
- Responsive design
- Location: `frontend/`

### Mobile Developer
- Develop React Native app
- Field verification interface
- Offline capabilities
- Location: `mobile/`

### DevOps/Infrastructure
- Docker & containerization
- Database setup & migrations
- Deployment pipelines
- CI/CD configuration
- Location: `deployment/`

### QA/Integration
- Write test suites
- API integration testing
- End-to-end testing
- Bug tracking
- Location: `tests/`

### PM/Documentation
- Technical documentation
- Presentation materials
- Requirements tracking
- Communication
- Location: `docs/`

## Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

Branch naming convention:
- `feature/user-authentication`
- `feature/dashboard-ui`
- `feature/certificate-generation`
- `bugfix/login-issue`

### 2. Make Changes
- Code in your feature branch
- Keep commits atomic and descriptive
- Write meaningful commit messages

### 3. Commit
```bash
git add .
git commit -m "Add user registration API endpoint"
```

Commit message format:
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 4. Push
```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Go to GitHub → Pull Requests → New PR
- Describe your changes clearly
- Request 2 team members to review
- Wait for approval before merging

### 6. Merge
After approval, merge to `develop` branch, then eventually to `main`.

## Code Standards

### General
- Use consistent naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Write meaningful variable names

### Backend
- Follow REST API conventions
- Use async/await
- Validate all inputs
- Handle errors gracefully
- Write unit tests

### Frontend
- Use functional components
- Implement responsive design
- Follow Material-UI guidelines
- Add PropTypes validation
- Write component tests

### Mobile
- Optimize for performance
- Handle offline mode
- Test on multiple devices
- Follow React Native best practices

## Testing Requirements

- Write unit tests for new functions
- Test API endpoints before merging
- Run full test suite: `npm test`
- Aim for >80% code coverage

## Communication

### Daily
- Async updates on Slack/Discord
- Update GitHub project board

### Weekly
- Video sync meeting
- Demo of completed features
- Discuss blockers

### Use GitHub Issues For
- Bug reports
- Feature requests
- Technical discussions

## Project Phases

Build incrementally following these phases:
1. **Foundation:** Architecture, database, API setup
2. **Core Features:** APIs, authentication, dashboards
3. **Advanced Features:** Certificates, notifications, workflows
4. **Polish:** Testing, optimization, deployment

## Questions?
Create a GitHub issue or ask in team chat.

---
Good luck! 🚀
