---
id: squad-a-policy/business-intent
register: intent
level: team
owner: <sebastien.hug>
status: active
version: 1.0.0
last-validated: 2026-11-03
consumption-mode: context-injection
consumes: [programme/payment-reminders/knowledge/brief.md@1.0.0, programme/payment-reminders/knowledge/decisions.md@1.0.0]
consumers: []
exception-to: null
exception-approved-by: null
---

# Business Intent Spec · Policy (`decideReminder`) · G1 Ready to Spec

> Five short answers, before any solution. Every claim carries one of these four source tags:
> - **[Nexus: path]**: a fact, rule or decision found in the Context Nexus;
> - **[Head of Receivables, date]**: the business's ambition, horizon or priority, dated the day they answered (not the dataset's day). Their decisions: go and ask;
> - **[Squad decision]**: what your squad chooses and signs (committed threshold, owner, what you won't do);
> - **[To confirm: who can answer]**: what nobody has yet. Never invent it.

## 1. Problem
SME customers lose cash because they chase unpaid invoices by hand, late, or not at all. The platform already knows every invoice, its due date and the payments received. [Nexus: programme/payment-reminders/knowledge/brief.md]

Our slice: for one invoice and one day, decide whether a reminder is due, at which step, and with which fees (`decideReminder`). One decision per invoice per day; squad B never recomputes steps or fees. [Nexus: programme/payment-reminders/knowledge/decisions.md D-03]

## 2. Users and stakeholders
- SME customers (50 volunteers in the pilot) and their own customers who receive the reminder. [Nexus: brief.md]
- Head of Receivables: owns the business ambition and the rules.
- Squad B (Outreach): consumes our decision field for field, at a pinned version. [Nexus: decisions.md D-04]
- Squad C (Insight): measures the pilot, downstream of B. [Nexus: decisions.md D-07]

## 3. Quantified success criterion
- Success target and horizon for the pilot: **none set**: the business has given no numeric target. [Head of Receivables, 2026-11-03]
- No metric is therefore committed by this slice. Squad C measures the pilot (RR-10 to RR-13); if a target is set later, this section is updated and the intent re-versioned.
- What this slice must guarantee, whatever the target: the decision matches the programme's reference cases 1.0.0 exactly. [Nexus: programme/payment-reminders/contracts/reference-cases.md@1.0.0]

## 4. Data
| Data | Status |
|---|---|
| Invoices, customers, payments (synthetic pilot dataset, reference day 2026-11-20, amounts in integer cents) | **available** [Nexus: programme/payment-reminders/data/, decisions.md D-06] |
| Business rules RR-01 to RR-05 and reference cases 1.0.0 | **available** [Nexus: knowledge/business-rules.md@1.0.0] |
| History of reminders already sent | **not needed by this slice**: `decideReminder` receives no send history; squad B keeps the trace of what was sent (reported by the squad after talking to B, 2026-11-03; not yet in a published contract). |

Business rules this intent relies on (unchanged, confirmed by the Head of Receivables on 2026-11-03):
- Days overdue are counted from the invoice `dueDate`. [Head of Receivables, 2026-11-03] [Nexus: business-rules.md RR-01]
- `friendly` from 3 days overdue, `firm` from 15 days, `formal` from 30 days. [Nexus: business-rules.md RR-04]
- Fees only at `formal`: the €40 recovery indemnity **plus** late-payment penalties (late interest at 10 % a year on the outstanding amount, pro rata of days overdue). The €40 is not the whole fee: the penalties come on top and grow each day. Currency is EUR, not USD. [Nexus: business-rules.md RR-05]
- No reminder once the payment is recorded (outstanding ≤ 0, reason `PAID`). [Head of Receivables, 2026-11-03] [Nexus: business-rules.md RR-03]

## 5. Priority and owner
- Why now: squad B cannot plan a reminder without our decision, and squad C cannot measure without B's plans. We publish `reminder-decision` first. [Nexus: brief.md]
- Out of scope for the pilot, as stated by the business: B2C, legal matters, any channel other than e-mail, and the payment-received confirmation e-mail. [Head of Receivables, 2026-11-03] (Consistent with [Nexus: decisions.md D-01, D-02, known unknowns] and [Nexus: business-rules.md RR-03].)
- What we will NOT do: no SMS, no letter (e-mail only) [Nexus: decisions.md D-01]; no legal threat in the reminder [Nexus: decisions.md D-02]; no B2C [Nexus: business-rules.md RR-03]; no sending, planning or measuring (squads B and C); no use of the system clock (`today` is a parameter) [Nexus: decisions.md D-06].
- Who answers for this intent: owner to be set by the squad. Who switches the feature on for the pilot: the Head of Receivables. [Head of Receivables, 2026-11-03] (In the harness the switch itself is traced and done by a human after the G3 GO; the intent records who decides.)

## Open points
1. **After 30 days: settled.** The decision stays `formal` with fees beyond 30 days (no upper bound), as RR-04 and the reference cases return at 31, 39, 45, 50 and 67 days. [Head of Receivables, 2026-11-03] The squad's wish that reminders stop after the third one is then a matter of sending (who avoids repeating a step), not of this decision: see point 2.
2. **One reminder per step: handled by squad B.** Squad B keeps the trace of sends, so `decideReminder` stays stateless (one invoice, one day) and never repeats-checks. [Squad decision, from the exchange with squad B, 2026-11-03] To be written down in squad B's published contract: **[To confirm: squad B, in their contract]**
3. **Out of scope:** settled, see section 5.

## Notes for contract `reminder-decision` v1.0.0 (for G2)

Squad decisions of 2026-11-03, to carry into the contract, each checked against [Nexus: reference-cases.md@1.0.0] and [Nexus: business-rules.md@1.0.0]:
- Fields added to v0 for the e-mail: `invoiceNumber`, `customerId`, `reason`, `currency` (`EUR`). To confirm with squad B, with the customer's language.
- `reason` is a closed list of 7 values (`PAID`, `NOT_OVERDUE`, `NOT_B2B`, `DISPUTED`, `OPTED_OUT`, `BELOW_THRESHOLD`, `TOO_EARLY`) or `null`. The first applicable one in RR-03 order wins.
- `eligible: false` ⇔ `reason` is not null; `eligible: true` ⇔ `reason` is null. (`null` for eligible is not stated in the Nexus: a convention to confirm with squad B.)
- Not eligible ⇒ `step: null` and `feeMinor: 0` (all 8 not-eligible reference cases).
- Eligible ⇒ `step` is never null; `feeMinor` is 0 at `friendly` and `firm`, and at `formal` is 4000 plus interest (always above 4000).
- After 30 days the decision stays `formal` with fees, no upper bound. [Head of Receivables, 2026-11-03]
- `feeMinor` stays a single total (indemnity + interest), as RR-05 says and the reference cases show. Splitting it later is a minor version if the old field stays; removing or redefining it is breaking (API-02).
- The decision is stateless (one invoice, one day); squad B keeps the trace of sends.

## Dependencies on the other squad
| What we need | Squad | Contract (version read) | Open question |
|---|---|---|---|
| Nothing: we start the chain | - | - | - |
| What squad B needs from our decision to write the e-mail (RR-07) | B (consumer) | `reminder-decision` v0.1.0 (draft, ours) | The squad adds to the v0 fields: `invoiceNumber`, `customerId`, `reason` (when not eligible) and `currency`. [Squad decision, 2026-11-03] Names, types and units to be written in contract v1.0.0. **[To confirm: squad B]** that this list is enough (e.g. the customer's language `fr`/`en` for the template id `<step>-<language>`). |
