---
id: programme/decisions
register: knowledge
level: programme
owner: head-of-receivables
status: active
version: 1.0.0
last-validated: 2026-11-16
consumption-mode: context-injection
consumes: []
consumers: [squad-a-policy, squad-b-outreach, squad-c-insight]
exception-to: null
exception-approved-by: null
---
# Decisions already taken

| # | Decision | Taken by | Why |
|---|---|---|---|
| D-01 | Reminders are e-mail only for the pilot. No SMS, no letter. | Head of Receivables | Cost and consent |
| D-02 | The reminder never threatens legal action; the formal notice states the fees, nothing more. | Legal | Tone |
| D-03 | One decision per invoice per day: squad A computes, squad B never recomputes steps or fees. | Architecture | Single source of truth |
| D-04 | Squad B receives the decision as published by squad A, field for field, and only consumes `reminder-decision` at a pinned version. | Architecture | Contract-first |
| D-05 | Amounts in the e-mail are formatted by the mailer later, not by squad B: B outputs minor units. | Architecture | Separation |
| D-06 | The pilot's dataset reference day is **2026-11-20** (a Friday). Code always takes `today` / `now` as parameters, never the system clock. | Architecture | Testable, reproducible |
| D-07 | Squad C measures from squad B's plans as published (`reminder-events`, pinned version) and from the payments; it never recomputes decisions or plans. It reuses Core Billing's reporting (`paidWithinRate`, `averagePaymentDelay`) so the pilot's figures match the finance dashboard. | Architecture | One number, one definition |

## Known unknowns

| Question | Who can answer |
|---|---|
| The success target and its horizon | Head of Receivables |
| Who switches the feature on for the pilot | Head of Receivables names the owner |
| What the customer sees after paying (thank-you e-mail?) | Not decided: out of scope for today |
