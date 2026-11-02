# Quickstart: validate the reminder decision

## Checks

| Command | Expected |
|---|---|
| `npm test` | AC-1..AC-7 unit tests green, legacy tests green |
| `npm run test:reference` | 15/15 `decideReminder` cases green (SC-001) |
| `npm run test:coverage` | line coverage ≥ 70 % |
| `npm run lint` / `npm run typecheck` | clean |
| `npm run deprecated` | "The squad's code uses none of them" |
| `npm run scan` | no secret, no bank data |

## HTTP smoke test (flag must be switched on by a human first)

`npm run deploy`, then:

| Request | Expected |
|---|---|
| `GET /v1/invoices/inv_0012/reminder-decision?today=2026-11-20` | 200, `step: "friendly"`, `daysOverdue: 3` (AC-1) |
| `GET /v1/invoices/inv_0005/reminder-decision?today=2026-11-20` | 200, `step: "formal"`, `feeMinor: 6055` (AC-3) |
| `…?today=2026-13-45` or no `today` | 400 `REMINDER_INVALID_TODAY` (AC-7) |
| `GET /v1/invoices/inv_9999/reminder-decision?today=2026-11-20` | 404 `REMINDER_INVOICE_NOT_FOUND` |
| any request with flag off | 404 `REMINDER_FEATURE_DISABLED` |

Field list and errors: [contracts/reminder-decision.md](./contracts/reminder-decision.md).
