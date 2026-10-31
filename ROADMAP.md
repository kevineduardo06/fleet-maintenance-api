# Development roadmap

These are proposed enhancements to the personal fleet maintenance prototype, not completed features. Time estimates are approximate and should be adjusted as the scope is refined.

| Proposed improvement | Estimated effort |
| --- | ---: |
| Add database persistence and migrations for vehicles, plans, work orders, and expenses | 7–11 hours |
| Strengthen maintenance-due calculations across mileage and calendar thresholds | 4–6 hours |
| Implement explicit work-order state transition rules and cancellation release behavior | 4–6 hours |
| Introduce authentication and server-enforced tenant isolation | 6–10 hours |
| Extend fleet cost reporting with filters, pagination, and summary metrics | 4–6 hours |
| Improve expense validation, audit event consistency, and failure handling | 4–6 hours |
| Expand integration and regression tests for boundary cases and cross-tenant access | 5–8 hours |
| Document API examples and add local database setup / CI checks | 3–5 hours |
| **Total proposed effort** | **37–58 hours** |

## Suggested sequence

1. Reproduce and document current edge cases in automated tests.
2. Improve maintenance and work-order invariants without changing the public API unnecessarily.
3. Introduce durable storage and verify consistency under concurrent operations.
4. Add authentication, authorization, and tenant isolation.
5. Expand reporting, CI, and documentation.

Only undertake items that remain relevant to the project; do not represent planned items as implemented functionality.
