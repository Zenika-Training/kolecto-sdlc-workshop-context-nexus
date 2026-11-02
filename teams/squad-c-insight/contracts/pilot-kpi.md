---
id: squad-c-insight/pilot-kpi
register: contracts
level: team
owner: squad-c-insight
status: draft
version: 0.1.0
last-validated: 2026-11-01
consumption-mode: context-injection
consumes: [teams/squad-b-outreach/contracts/reminder-events.md@0.1.0, programme/payment-reminders/knowledge/business-rules.md@1.0.0]
consumers: [head-of-receivables]
exception-to: null
exception-approved-by: null
---
# Contract · pilot-kpi · v0 (draft by facilitation, to be taken over by squad C)

> v0 is a starting point, written before the squad existed. Squad C reviews it, completes it and publishes **v1 (1.0.0)** before G2.

## Purpose

Tell the Head of Receivables, for a period of the pilot, whether reminders get invoices paid: the figures G1 promised.

## Interface

- Function: `measurePilot({ plans, invoices, payments, from, to })`
- HTTP: `GET /v1/pilot/kpi?from=YYYY-MM-DD&to=YYYY-MM-DD`

## What we expect from squad B (v0 assumption)

Each plan gives `invoiceId`, `send`, `sendAt`, the step, and `feeMinor`, the reminder's fees.

## Output (v0)

| Field | Type | Example |
|---|---|---|
| `from`, `to` | `YYYY-MM-DD` | `2026-11-01`, `2026-11-30` |
| `remindedInvoices` | integer | `5` |
| `paidWithin7DaysPercent` | number, one decimal | `20` |
| `feesScheduledMinor` | integer, minor units | `10181` |

## To clarify before v1

- Which reminder counts when an invoice gets several in the period?
- How is the payment delay measured, and over which invoices? (RR-12, and what finance's dashboard already computes.)
- What does the report say when nothing was sent?
