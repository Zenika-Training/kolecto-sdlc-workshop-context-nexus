# Data model: Reminder decision

Inputs are the dataset shapes in `src/domain/types.ts` (unchanged). Amounts are integer cents.

## Inputs

| Entity | Fields used | Rule |
|---|---|---|
| `Invoice` | `id`, `number`, `customerId`, `dueDate`, `totalMinor`, `currency`, `disputed` | RR-01, RR-02, RR-03 |
| `Payment[]` | `invoiceId`, `date`, `amountMinor` | RR-02 (only `date <= today` count) |
| `Customer` | `type`, `optedOut` | RR-03 (`name`, `email` never read nor logged, SEC-03) |
| `today` | `YYYY-MM-DD` | D-06, validated at the HTTP edge |

## Output: `ReminderDecision`

| Field | Type | Unit / values | Source |
|---|---|---|---|
| `invoiceId` | string | `inv_0012` | invoice |
| `invoiceNumber` | string | `F-2026-0012` | invoice |
| `customerId` | string | `C06` | invoice |
| `eligible` | boolean | | RR-03 |
| `reason` | `ReminderReason` \| null | null when eligible | RR-03 |
| `daysOverdue` | integer ≥ 0 | calendar days | RR-01 |
| `outstandingMinor` | integer ≥ 0 | minor units | RR-02 |
| `currency` | string | ISO 4217, invoice's | invoice |
| `step` | `ReminderStep` \| null | null when not eligible | RR-04 |
| `feeMinor` | integer ≥ 0 | minor units; 0 unless `formal` | RR-05 |

`ReminderReason` = `PAID` | `NOT_OVERDUE` | `NOT_B2B` | `DISPUTED` | `OPTED_OUT` | `BELOW_THRESHOLD` | `TOO_EARLY`
`ReminderStep` = `friendly` | `firm` | `formal`

## Derivation (in order)

1. `daysOverdue = daysPastDue(invoice, today)`; `outstandingMinor = outstandingMinorAt(invoice, payments, today)`.
2. `reason` = first true of: `outstanding ≤ 0` → PAID; `days ≤ 0` → NOT_OVERDUE; `customer.type ≠ 'B2B'` → NOT_B2B;
   `invoice.disputed` → DISPUTED; `customer.optedOut` → OPTED_OUT; `outstanding < 1000` → BELOW_THRESHOLD;
   `days < 3` → TOO_EARLY; else null.
3. `eligible = reason === null`.
4. `step` (eligible only): `days ≥ 30` formal, `≥ 15` firm, else friendly.
5. `feeMinor` = `step === 'formal' ? 4000 + simpleInterest(outstanding, 10, days) : 0`.

No state, no transition: one decision per invoice per day (D-03), recomputed on demand.
