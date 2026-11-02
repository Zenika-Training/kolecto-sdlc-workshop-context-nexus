# Research: Reminder decision

No `NEEDS CLARIFICATION` remained in the Technical Context. The items below record the design
choices, mostly what Core Billing already offers (found with `graphify query`, checked with
`npm run deprecated`).

## R-1 · Days overdue (RR-01)

- **Decision**: `daysPastDue(invoice, today)` from `src/billing/ledger/invoice-status.ts`
  (`max(0, daysBetween(dueDate, today))`).
- **Rationale**: exactly RR-01, pure, not deprecated, UTC day arithmetic (no DST drift).
- **Alternatives**: `daysLate` — `@deprecated`, rejected. `daysBetween` + clamp — equivalent, kept as fallback.

## R-2 · Outstanding (RR-02)

- **Decision**: `outstandingMinorAt(invoice, payments, today)` from `src/billing/ledger/balance.ts`.
- **Rationale**: counts payments dated on or before `today`, clamps at 0, integer cents. Covers AC-3, AC-4
  and the "payment on today" / "overpayment" edge cases.
- **Alternatives**: `getBalance` — `@deprecated`, floats and counts future payments (would break AC-4). Rejected.

## R-3 · Fees (RR-05)

- **Decision**: `4000 + simpleInterest(outstandingMinor, 10, daysOverdue)` from `src/billing/money/cents.ts`.
- **Rationale**: `simpleInterest` = `roundHalfUp(amount × rate × days / (100 × 365))`, one division, so
  fewer float artefacts than chaining `× 10 / 100 × days / 365`. Checked: AC-3 → 4000 + 2055 = 6055;
  AC-4 (45 days, 64000) → 4000 + 789 = 4789. `roundHalfUp` is `Math.round`, half up for positive values.
- **Alternatives**: hand-written formula — duplicates Core Billing (ORG-08 reuse rule).

## R-4 · Eligibility order (RR-03) and steps (RR-04)

- **Decision**: one ordered list of `[reason, predicate]`, first match wins; step from thresholds 30 / 15 / 3.
- **Rationale**: the order is the rule; a list makes it visible and testable (AC-5).
- **Alternatives**: `invoiceStatusAt` — its order (paid, disputed, overdue) differs from RR-03. Rejected.

## R-5 · Validating `today` (SEC-04, edge case `2026-13-45`)

- **Decision**: new `isValidDay(value)` in `src/domain/day.ts`: regex `YYYY-MM-DD` **and**
  `fromDayNumber(dayNumber(value)) === value` (Core Billing helpers). Used by `src/routes.ts`.
- **Rationale**: the current route regex and Core Billing's `assertDay` accept `2026-13-45`. Core Billing
  cannot be modified (ORG-08); a small domain helper on top of its arithmetic closes the gap.
- **Alternatives**: change request to Core Billing for a stricter `assertDay` — worth filing, not blocking.

## R-6 · Output shape vs contracts — **REPORT, not decided here**

- **Decision**: the output is the 10 fields of the reference cases (read-only tests, ENG-04), in this order:
  `invoiceId, invoiceNumber, customerId, eligible, reason, daysOverdue, outstandingMinor, currency, step, feeMinor`.
- **Gaps to settle by humans (ORG-04)**:
  1. Our contract `reminder-decision` v0 lists 6 fields; v1 must list all 10 before G2.
  2. Squad B's `reminder-events` v0 says: *"The decision gives `invoiceId`, `eligible`, `step`, `daysLate`
     and the fees."* Our field (reference cases, RR-01, RR-07 subject `{daysOverdue}`) is `daysOverdue`.
     [To confirm: squad B] that they consume `daysOverdue` and `feeMinor`.
  3. `currency` is `EUR` only in the dataset type. [To confirm: Head of Receivables] whether non-EUR is in scope.
- **Rationale**: picking an interpretation for another squad's contract is out of our remit.
