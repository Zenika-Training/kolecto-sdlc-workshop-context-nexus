---
id: programme/brief
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
# Brief · Smart payment reminders

> A sandbox feature, inspired by the domain of an SME invoicing platform. Fictional: no real customer, no real roadmap.

## The need, as the business wrote it

"Our SME customers lose cash because they chase unpaid invoices by hand, late, or not at all. We want the platform to send payment reminders automatically, at the right moment, with the right tone, and with the late-payment fees the law allows. Pilot with 50 volunteer customers."

— Head of Receivables

## What we know

- Today, users chase late invoices themselves, from their mailbox. Many never do.
- The platform already knows every invoice, its due date, and the payments received.
- The business rules for a reminder are in `business-rules.md`; decisions already taken are in `decisions.md`.

## What this brief does NOT say (on purpose)

- How success will be measured, by how much, and by when.
- Who owns the decision to activate the feature.
- What is out of scope.

Ask the Head of Receivables. Everything else is in the Context Nexus, or is your squad's decision.

## One feature, three squads

| Squad | Builds | Publishes | Consumes |
|---|---|---|---|
| **A · Policy** | Decides whether an invoice gets a reminder today, which step, and which fees: `decideReminder` | `reminder-decision` contract | business rules, reference cases |
| **B · Outreach** | Plans the reminder: when to send it, which template, what amount due: `planReminder` | `reminder-events` contract | `reminder-decision`, business rules, reference cases |
| **C · Insight** | Measures the pilot from the planned reminders and the payments: reminded invoices, paid within 7 days, payment delay, fees: `measurePilot` | `pilot-kpi` contract | `reminder-events`, business rules, reference cases |

No squad can finish alone: Outreach cannot plan without Policy's decision, Insight cannot measure without Outreach's plans, and nobody knows whether the pilot works until Insight's figures exist. A change upstream travels down the chain A → B → C.
