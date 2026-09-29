# Contributing

## Workflow

1. Create a focused branch from `main`, for example `feature/inspection-evidence` or `fix/login-error`.
2. Keep changes scoped, follow existing project patterns, and do not commit secrets, local databases, or backup contents.
3. Use a descriptive Conventional Commit message, such as `feat: add inspection evidence upload`.
4. Run the relevant checks before opening a pull request. Include a summary, test results, and any database or configuration changes.
5. Open a pull request against `main` and address review feedback before merging.

## Checks

- Backend (`backend/`): `npm test`; also run `npm run test:e2e` or `npm run test:security` when relevant.
- Frontend (`frontend/`): `npm test` and `npm run build` when relevant.
- Database changes: update `backend/prisma/schema.prisma` and describe any required setup or migration steps in the pull request.

See the [README](./README.md) for local setup and the project documentation.
