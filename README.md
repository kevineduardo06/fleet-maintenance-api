# Fleet Maintenance API

A small but realistic TypeScript/Express API for fleet maintenance workflows. It is intended for agentic coding tasks involving bug fixes, feature extensions, refactors, testing, and code review.

## Domain

The service tracks vehicles, maintenance plans, work orders, expenses, audit logs, and fleet reports.

Core rules:

- Vehicles are tenant-scoped.
- Vehicle odometer readings cannot move backwards.
- Work orders reserve a vehicle while they are open or in progress.
- Completed work orders can create expenses.
- Preventive maintenance is due by mileage interval or by date interval.
- Reports must be tenant-scoped and use integer cents for money.

## Commands

```bash
npm install
npm test
npm run build
npm run dev
```

## Useful endpoints

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

## Task ideas

- Fix preventive maintenance due logic when mileage and date intervals disagree.
- Ensure cancelled work orders release vehicle availability without losing audit history.
- Add filtering by vehicle type and service category to fleet cost reports.
- Refactor duplicate tenant filtering between reports and work order listing.
- Prevent expenses from being added to cancelled work orders.
