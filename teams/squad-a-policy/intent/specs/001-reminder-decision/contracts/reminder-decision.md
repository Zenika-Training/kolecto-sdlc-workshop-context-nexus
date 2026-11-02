# Contract proposal · reminder-decision · v1 (DRAFT — for the squad to review)

> Working draft from `/speckit-plan`. Not published, not `active`. The squad edits and publishes the real
> contract in `teams/squad-a-policy/contracts/reminder-decision.md`, and tells squad B first (API-02).

## Interface

- Function: `decideReminder({ invoice, payments, customer, today }): ReminderDecision`
- HTTP: `GET /v1/invoices/{invoiceId}/reminder-decision?today=YYYY-MM-DD`

## Output fields

| Field | Type | Unit | Example |
|---|---|---|---|
| `invoiceId` | string | — | `inv_0005` |
| `invoiceNumber` | string | — | `F-2026-0005` |
| `customerId` | string | — | `C03` |
| `eligible` | boolean | — | `true` |
| `reason` | enum \| null | `PAID`, `NOT_OVERDUE`, `NOT_B2B`, `DISPUTED`, `OPTED_OUT`, `BELOW_THRESHOLD`, `TOO_EARLY` | `null` |
| `daysOverdue` | integer | calendar days, ≥ 0 | `50` |
| `outstandingMinor` | integer | minor units | `150000` |
| `currency` | string | ISO 4217 | `EUR` |
| `step` | enum \| null | `friendly`, `firm`, `formal` | `formal` |
| `feeMinor` | integer | minor units | `6055` |

## HTTP errors

| Status | Code | When |
|---|---|---|
| 400 | `REMINDER_INVALID_TODAY` | `today` missing, malformed or impossible |
| 404 | `REMINDER_INVOICE_NOT_FOUND` | unknown invoice |
| 404 | `REMINDER_FEATURE_DISABLED` | flag `reminders_policy_decision` off |

Body: `{ "code": "…", "message": "…", "details": {} }`, never a stack trace.

## Changes from v0

Added `invoiceNumber`, `customerId`, `reason`, `currency` (reference cases; RR-07 subject needs
`invoiceNumber` and `daysOverdue`). Squad B's v0 expects `daysLate`: [To confirm: squad B].

consumers: squad-b-outreach
