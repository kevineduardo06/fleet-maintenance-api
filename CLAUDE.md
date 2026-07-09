# CLAUDE.md

## Commands

- Install dependencies: `npm install`
- Run tests: `npm test`
- Type-check/build: `npm run build`
- Lint equivalent: `npm run lint`

## Workflow

- Do not push changes unless explicitly asked.
- Do not use `--no-verify`.
- Do not run destructive git commands such as `git reset --hard`, `git clean -fd`, deleting branches, or force-pushing without confirmation.
- Keep diffs focused on the requested task.
- Add or update tests for behavior changes.
- Report the exact commands run and their results before finishing.

## Architecture

- Routes should stay thin and delegate business rules to services.
- Repositories own in-memory persistence and test reset helpers.
- Services own fleet maintenance rules such as odometer validation, preventive maintenance due dates, work order status transitions, and cost reporting.
- Money is represented in integer cents.
- All tenant-scoped queries must filter by `tenantId`.
- Prefer extending existing patterns before adding abstractions or dependencies.
