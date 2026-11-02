# Implementation Plan: Reminder decision

**Branch**: `001-reminder-decision` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-reminder-decision/spec.md`

## Summary

Implement `decideReminder({ invoice, payments, customer, today })` as a pure function returning the
10-field decision of the reference cases (RR-01 to RR-05), reusing Core Billing for days overdue,
outstanding balance and interest. Harden the existing HTTP route so that an impossible day
(`2026-13-45`) is rejected with `400 REMINDER_INVALID_TODAY` (SEC-04). Everything stays behind the
flag `reminders_policy_decision`, off by default (ORG-02).

## Technical Context

**Language/Version**: TypeScript on Node 22 (ESM, `.js` import suffixes)

**Primary Dependencies**: Fastify (route already wired), Core Billing `src/billing/` (reused, read-only)

**Storage**: N/A — the route reads the synthetic JSON dataset in `data/` via `src/data.ts`

**Testing**: Vitest — `test/unit/` (AC-n tests, ENG-02), `test/reference/` (read-only, ENG-04)

**Target Platform**: Linux server, local deploy on port 3001

**Project Type**: web-service (single project)

**Performance Goals**: none specific; one pure in-memory computation per request

**Constraints**: no system clock (D-06); integer minor units only; no Core Billing edit (ORG-08);
no `@deprecated` symbol (`daysLate`, `getBalance`, `toEuros`, `fromEuros`); logs carry ids only (SEC-03)

**Scale/Scope**: pilot of 50 customers; 15 `decideReminder` reference cases

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Human decisions (ORG-02, ORG-05) | Route stays behind `reminders_policy_decision`, off; agent never flips it nor sets the contract `active` | PASS |
| II. Contracts (ORG-04, API-01/02/03) | Output follows the reference cases (10 fields). Gap with contract v0 (6 fields) and squad B's v0 (`daysLate`) **reported**, not resolved by us — see research R-6 | PASS with open report |
| III. No stale context (ORG-06) | Brief assembled 2026-11-02, no `stale` artefact reported | PASS |
| IV. Reuse Core Billing (ORG-08) | `daysPastDue`, `outstandingMinorAt`, `simpleInterest`, `dayNumber`/`fromDayNumber` reused; `npm run deprecated` clean | PASS |
| V. Tested against the spec (ENG-01..05) | One `it('AC-n: …')` per AC-1..AC-7 in `test/unit/`; reference tests untouched | PASS (planned) |
| Data, security, time (SEC-01..04, ORG-03, D-06) | `today` parameter; strict day validation → 400; no PII logged | PASS |

Note: the constitution's "Business rules of this slice" section is still empty. Run
`/speckit-constitution` to add RR-01..RR-05 with their ids before `/speckit-tasks`.

**Post-design re-check**: unchanged, all PASS (design adds no project, no pattern, no dependency).

## Project Structure

### Documentation (this feature)

```text
specs/001-reminder-decision/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── reminder-decision.md   # Phase 1: proposed v1 shape (draft, for the squad)
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── decide-reminder.ts   # implement: pure decision, typed ReminderDecision
│   ├── day.ts               # new: isValidDay(value) — regex + calendar round-trip via Core Billing
│   └── types.ts             # unchanged
├── routes.ts                # use isValidDay instead of the regex-only check
└── billing/                 # Core Billing — read-only, reused

test/
├── unit/
│   ├── decide-reminder.test.ts   # AC-1..AC-6 + edge cases
│   └── app.test.ts               # extend: AC-7 (400, invalid/impossible today), flag off → 404
└── reference/                    # read-only
```

**Structure Decision**: single project, existing starter layout. Domain logic in `src/domain/`,
HTTP concerns in `src/routes.ts`, no new layer.

## Complexity Tracking

No violation to justify.
