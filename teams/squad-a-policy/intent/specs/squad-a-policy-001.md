---
id: squad-a-policy/spec-001
register: intent
level: team
owner: ann.pen
status: active
version: 1.0.0
last-validated: 2026-11-02
consumption-mode: context-injection
source: starter-squad-a-policy/specs/001-reminder-decision/spec.md
consumes: [programme/payment-reminders/knowledge/business-rules.md@1.0.0, programme/payment-reminders/contracts/reference-cases.md@1.0.0, teams/squad-a-policy/contracts/reminder-decision.md@0.1.0, teams/squad-b-outreach/contracts/reminder-events.md@0.1.0]
consumers: []
exception-to: null
exception-approved-by: null
---

# Feature Specification: Reminder decision

**Feature Branch**: `001-reminder-decision`

**Created**: 2026-11-02

**Input**: User description: "Decide whether an unpaid invoice gets a reminder today, at which step
(friendly, firm, formal) and with which fees, per the business rules RR-01 to RR-05 and the
reference cases. Keep it short: at least 3 acceptance criteria AC-n in Given/When/Then."

**Sources**: `business-rules.md` v1.0.0 (RR-01 to RR-05), `reference-cases.md` v1.0.0,
`decisions.md` v1.0.0 (D-03, D-06). When a rule and a reference case disagree, the reference
case wins and the Head of Receivables is told.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decide the reminder for an overdue invoice (Priority: P1)

For one invoice and one given day, the platform tells whether a reminder is due, at which step,
and with which late-payment fees, so that squad B (Outreach) can plan the e-mail without
recomputing anything (D-03).

**Why this priority**: Without the decision, no reminder can be sent. It is the whole slice.

**Independent Test**: Run the decision on the 15 `decideReminder` reference cases and compare
the output field for field.

**Acceptance Scenarios**:

- **AC-1**: **Given** a B2B, undisputed, not opted-out invoice of €540.00 due 2026-11-17 with no
  payment, **When** the decision is asked for today = 2026-11-20, **Then** it is eligible with
  `reason: null`, `daysOverdue: 3`, `outstandingMinor: 54000`, `step: "friendly"`, `feeMinor: 0`.
- **AC-2**: **Given** an eligible invoice 20 days overdue (due 2026-10-31, today 2026-11-20),
  **When** the decision is asked, **Then** `step` is `"firm"` and `feeMinor` is 0.
- **AC-3**: **Given** an invoice of €2,500.00 due 2026-10-01 with a €1,000.00 payment dated
  2026-10-12, **When** the decision is asked for today = 2026-11-20, **Then** `daysOverdue: 50`,
  `outstandingMinor: 150000`, `step: "formal"` and `feeMinor: 6055`
  (4000 + round(150000 × 10 / 100 × 50 / 365)).
- **AC-4**: **Given** an invoice of €640.00 due 2026-10-06 with a full payment dated 2026-11-25,
  **When** the decision is asked for today = 2026-11-20, **Then** the payment is ignored:
  `outstandingMinor: 64000`, `step: "formal"`, `feeMinor: 4789`.
- **AC-5**: **Given** an invoice for which several ineligibility conditions could apply,
  **When** the decision is asked, **Then** `eligible` is false, `reason` is the first applicable
  one in the order `PAID`, `NOT_OVERDUE`, `NOT_B2B`, `DISPUTED`, `OPTED_OUT`, `BELOW_THRESHOLD`,
  `TOO_EARLY`, `step` is null and `feeMinor` is 0 (e.g. a B2C invoice of €99.00 → `NOT_B2B`, not
  `BELOW_THRESHOLD`).
- **AC-6**: **Given** an invoice not yet due (due 2026-11-24, today 2026-11-20), **When** the
  decision is asked, **Then** `daysOverdue` is 0 (never negative) and `reason` is `NOT_OVERDUE`.
- **AC-7**: **Given** a request whose `today` is missing or not a valid `YYYY-MM-DD` day, **When**
  the decision is asked over HTTP, **Then** the answer is `400` with code `REMINDER_INVALID_TODAY`
  and no stack trace (SEC-04).

### Edge Cases

- Exactly 3, 15 and 30 days overdue: the step starts on that day (RR-04 "from").
- Payment dated exactly on `today`: it counts (RR-02 "on or before").
- Payments exceeding the total: outstanding is 0, never negative (RR-02) → `PAID`.
- Outstanding exactly 1000 minor units: eligible (RR-03 is "< 1000").
- Fee rounding at exactly half a cent: rounds up (RR-05).
- A syntactically valid but impossible day such as `2026-13-45`: rejected with `400`.
- Unknown invoice: `404` with code `REMINDER_INVOICE_NOT_FOUND`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** (RR-01): The decision MUST compute `daysOverdue` as calendar days from `dueDate` to
  `today`, floored at 0.
- **FR-002** (RR-02): The decision MUST compute `outstandingMinor` as `totalMinor` minus payments
  dated on or before `today`, floored at 0.
- **FR-003** (RR-03): The decision MUST return `eligible: false` and the first applicable
  `reason` in the RR-03 order; otherwise `eligible: true` and `reason: null`.
- **FR-004** (RR-04): For an eligible invoice, `step` MUST be `friendly` (≥ 3 days), `firm`
  (≥ 15 days) or `formal` (≥ 30 days); `step` is null when not eligible.
- **FR-005** (RR-05): `feeMinor` MUST be 4000 + `round(outstandingMinor × 10 / 100 × daysOverdue
  / 365)` (half up) at `formal`, and 0 otherwise.
- **FR-006** (reference cases): The decision MUST carry exactly these fields: `invoiceId`,
  `invoiceNumber`, `customerId`, `eligible`, `reason`, `daysOverdue`, `outstandingMinor`,
  `currency`, `step`, `feeMinor`. `currency` is the invoice's.
- **FR-007** (D-06): The decision MUST take `today` as an input, never read the system clock.
- **FR-008** (ORG-02): The behaviour MUST sit behind the flag `reminders_policy_decision`, off
  by default; while off, the HTTP route answers `404 REMINDER_FEATURE_DISABLED`.
- **FR-009** (SEC-03): No log line carries a customer name or e-mail; ids only.

### Key Entities

- **Invoice**: id, number, customer, due date, total (minor units), currency, disputed flag.
- **Payment**: invoice, date, amount (minor units).
- **Customer**: id, type (B2B / B2C), language, opted-out flag.
- **Reminder decision**: the output above, one per invoice per day (D-03), consumed field for
  field by squad B through the `reminder-decision` contract.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 15 out of 15 `decideReminder` reference cases produce exactly the expected output.
- **SC-002**: The same invoice, payments and day always produce the same decision (100 %
  reproducible).
- **SC-003**: Squad B can plan every eligible reference case from the decision alone, with no
  extra field and no recomputation.
- **SC-004**: Business target for the pilot (e.g. share of overdue invoices reminded, cash
  recovered, horizon). [To confirm: Head of Receivables]

## Assumptions

- Pilot invoices are in EUR; the €10 threshold (1000 minor units) is applied in the invoice's
  currency as is.
- "Business" means customer type `B2B`; any other type is `NOT_B2B`.
- The decision needs no data beyond the invoice, its payments and its customer.
- Who switches the flag on for the pilot is named by the Head of Receivables, not by this spec.
- **Contract gap to settle**: the `reminder-decision` v0 draft lists 6 output fields; the
  reference cases expect 10 (`invoiceNumber`, `customerId`, `reason`, `currency` added). This
  spec follows the reference cases; contract v1 must list all 10 before G2 and squad B must be
  told.
