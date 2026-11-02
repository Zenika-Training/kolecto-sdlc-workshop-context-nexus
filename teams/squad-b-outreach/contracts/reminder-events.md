---
id: squad-b-outreach/reminder-events
register: contracts
level: team
owner: squad-b-outreach
status: draft
version: 0.1.0
last-validated: 2026-11-01
consumption-mode: context-injection
consumes: [teams/squad-a-policy/contracts/reminder-decision.md@0.1.0, programme/payment-reminders/knowledge/business-rules.md@1.0.0]
consumers: [programme-kpi]
exception-to: null
exception-approved-by: null
---
# Contract · reminder-events and reminder plan · v0 (draft by facilitation, to be taken over by squad B)

> v0 is a starting point, written before the squad existed. Squad B reviews it, completes it and publishes **v1 (1.0.0)** before G2.

## Purpose

Turn a reminder decision into a planned e-mail, and emit the events that measure the pilot.

## Interface

- Function: `planReminder({ decision, customer, now })`
- HTTP: `POST /v1/reminders/plan` with `{ "invoiceId": "…", "now": "ISO 8601" }`

## What we expect from squad A (v0 assumption)

The decision gives `invoiceId`, `eligible`, `step`, `daysLate` and the fees.

## Output: the plan (v0)

| Field | Type | Example |
|---|---|---|
| `invoiceId` | string | `inv_0005` |
| `send` | boolean | `true` |
| `sendAt` | ISO 8601 instant, Paris offset | `2026-11-20T10:15:00+01:00` |
| `template` | string | `formal-en` |
| `subject` | string | `Formal notice: invoice F-2026-0005 is 50 days overdue` |

## Events (v0)

| Event | Payload | Emitted when |
|---|---|---|
| `reminder_scheduled` | `invoiceId`, `step`, `sendAt` | a reminder is planned |
| `reminder_sent` | `invoiceId`, `step`, `sentAt` | the mailer sent it (not built today) |
| `payment_after_reminder` | `invoiceId`, `amountMinor`, `currency`, `daysAfterReminder` | a payment arrives after a reminder (not built today) |

## To clarify before v1

- Where do the fee lines and the amount due come from? (Look at RR-08.)
- What does the plan say when there is nothing to send?
