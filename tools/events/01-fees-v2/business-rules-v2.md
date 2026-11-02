# Business rules · payment reminders

> **Changed in 2.0.0** (Head of Receivables, after a legal review): RR-05 and RR-08. Fees now start at the firm step and are listed separately.

> Simplified for the workshop. The real legal rules are richer; these are the ones the business validated for the pilot.

## Deciding (squad A)

- **RR-01 · Days overdue.** `daysOverdue` = number of calendar days from the invoice's `dueDate` to `today` (both `YYYY-MM-DD`). `today − dueDate`; never negative (0 if not yet due).
- **RR-02 · Outstanding.** `outstandingMinor` = `totalMinor` − sum of the invoice's payments **dated on or before `today`**. Never negative.
- **RR-03 · Eligibility.** An invoice gets no reminder when one of these applies. The **first** that applies is the `reason`:
  1. `PAID`: outstanding ≤ 0
  2. `NOT_OVERDUE`: days overdue ≤ 0
  3. `NOT_B2B`: the customer is not a business (B2C is out of the pilot)
  4. `DISPUTED`: the invoice is disputed
  5. `OPTED_OUT`: the customer opted out of reminders
  6. `BELOW_THRESHOLD`: outstanding < €10 (1000 minor units)
  7. `TOO_EARLY`: days overdue < 3
- **RR-04 · Steps.** For an eligible invoice: `friendly` from 3 days overdue, `firm` from 15 days, `formal` (formal notice) from 30 days.
- **RR-05 · Fees (changed in 2.0.0).** From the **`firm`** step on (firm and formal), the reminder adds two separate late-payment fees: a fixed recovery indemnity of **€40** (4000), and late interest at **10 % a year** on the outstanding amount, pro rata of days overdue: `round(outstandingMinor × 10 / 100 × daysOverdue / 365)` (round half up to the cent). The decision lists them in `fees: [{ "kind": "indemnity" | "interest", "amountMinor": … }]`, indemnity first. No fees at the `friendly` step, or when not eligible (`fees: []`). The single `feeMinor` field is gone.

## Sending (squad B)

- **RR-06 · Sending window.** Reminders go out on business days (Monday to Friday, except French public holidays listed below), between **09:00 included and 18:00 excluded**, Paris time. If "now" is inside the window, send now. Otherwise send at **09:00 on the next business day** (or today at 09:00 if it is a business day and it is before 09:00). Public holidays for the pilot: 2026-11-11, 2026-12-25, 2027-01-01.
- **RR-07 · Template and subject.** One e-mail per reminder, in the customer's language (`fr` or `en`). Template id `<step>-<language>`. Subjects:

| Step | en | fr |
|---|---|---|
| friendly | `Friendly reminder: invoice {invoiceNumber} is {daysOverdue} days overdue` | `Petit rappel : la facture {invoiceNumber} est en retard de {daysOverdue} jours` |
| firm | `Second reminder: invoice {invoiceNumber} is {daysOverdue} days overdue` | `Deuxième relance : la facture {invoiceNumber} est en retard de {daysOverdue} jours` |
| formal | `Formal notice: invoice {invoiceNumber} is {daysOverdue} days overdue` | `Mise en demeure : la facture {invoiceNumber} est en retard de {daysOverdue} jours` |

- **RR-08 · Amount due (changed in 2.0.0).** The reminder shows each fee on its own line: `Fixed recovery indemnity` for `indemnity`, `Late-payment interest` for `interest`, in the order of `fees`. `amountDueMinor` = outstanding + all fees. Fee labels stay in English in both languages for the pilot: the legal team has not validated a French wording yet.
- **RR-09 · Events.** Planning a reminder emits `reminder_scheduled` (invoiceId, step, sendAt). Sending emits `reminder_sent`; a payment received after a reminder emits `payment_after_reminder`. These events measure the pilot.

## Exact expected outputs

The business's acceptance examples are in `programme/payment-reminders/contracts/reference-cases.md`, with exact inputs and outputs. When this page and a reference case seem to disagree, the reference case wins and you tell the Head of Receivables.
