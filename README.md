# Fleet Maintenance API

A personal TypeScript/Express REST API prototype for managing fleet maintenance operations. It tracks vehicles, preventive maintenance plans, work orders, expenses, audit records, and cost reports. The current implementation uses in-memory repositories and is intended for local development and testing, not production use.

## Stack

- TypeScript, Node.js, Express
- Zod for request validation
- Vitest and Supertest for automated API tests
- In-memory repositories (no database configured)

## Current capabilities

- Tenant-scoped vehicle registration, listing, and odometer updates
- Preventive maintenance plans and due-maintenance lookup
- Work-order creation, status transitions, and expense recording
- Audit-log retrieval and fleet cost reporting
- Domain rules for odometer progression and vehicle availability
- Monetary amounts represented as integer cents

## Getting started

Requires a supported Node.js/npm installation.

```bash
npm install
npm test
npm run build
npm run dev
```

The development server is started by `src/server.ts`. Consult `src/app.ts` for the current API routes and request schemas.

## API routes

- `POST /vehicles`
- `GET /vehicles?tenantId=...&status=...`
- `PATCH /vehicles/:id/odometer`
- `POST /maintenance-plans`
- `GET /maintenance/due?tenantId=...`
- `POST /work-orders`
- `PATCH /work-orders/:id/status`
- `POST /work-orders/:id/expenses`
- `GET /reports/fleet-costs?tenantId=...`
- `GET /audit-logs?tenantId=...`

## Architecture

`src/app.ts` defines the HTTP interface. Modules in `src/modules/` contain domain types, services, and repositories. `src/shared/` contains common utilities. `tests/` covers core workflows. `CLAUDE.md` documents repository development conventions.

## Limitations

This is a prototype: data is not persisted across process restarts, tenant IDs are supplied by API clients rather than derived from authenticated identities, and there is no production-grade authorization or deployment configuration. Do not use it to store real customer data or confidential records.

## Future development

See [ROADMAP.md](ROADMAP.md) for proposed work. Estimates are planning ranges, not work already completed.

## License

MIT; see [LICENSE](LICENSE).
