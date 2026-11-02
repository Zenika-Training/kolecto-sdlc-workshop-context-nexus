---
id: squad-a-policy/reminder-decision
register: contracts
level: team
owner: squad-a-policy
status: draft
version: 0.1.0
last-validated: 2026-11-01
consumption-mode: context-injection
consumes: [programme/payment-reminders/knowledge/business-rules.md@1.0.0]
consumers: [squad-b-outreach]
exception-to: null
exception-approved-by: null
---
# Contract · reminder-decision · v0 (draft by facilitation, to be taken over by squad A)

> v0 is a starting point, written before the squad existed. Squad A reviews it, completes it and publishes **v1 (1.0.0)** before G2.

## Purpose

For one invoice and one day, tell whether a reminder is due, at which step, and with which fees.

## Interface

- Function: `decideReminder({ invoice, payments, customer, today })`
- HTTP: `GET /v1/invoices/{invoiceId}/reminder-decision?today=YYYY-MM-DD`

## Output fields (v0)

| Field | Type | Example |
|---|---|---|
| `invoiceId` | string | `inv_0005` |
| `eligible` | boolean | `true` |
| `daysOverdue` | integer, days | `50` |
| `outstandingMinor` | integer, minor units | `150000` |
| `step` | `friendly` \| `firm` \| `formal` \| null | `formal` |
| `feeMinor` | integer, minor units | `6055` |

## To clarify before v1

- Which fields does squad B need to write the e-mail subject? (Look at RR-07.)
- What does the decision say when the invoice is not eligible, and why?
- Currency?
