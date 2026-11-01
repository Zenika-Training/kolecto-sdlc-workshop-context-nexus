---
id: <squad>/business-intent
register: intent
level: team
owner: <first.last of whoever owns this intent>
status: draft
version: 1.0.0
last-validated: <YYYY-MM-DD>
consumption-mode: context-injection
consumes: [programme/payment-reminders/knowledge/brief.md@1.0.0, programme/payment-reminders/knowledge/decisions.md@1.0.0]
consumers: []
exception-to: null
exception-approved-by: null
---

# Business Intent Spec · <squad slice> · G1 Ready to Spec

> Five short answers, before any solution. Every claim carries one of these four source tags:
> - **[Nexus: path]**: a fact, rule or decision found in the Context Nexus;
> - **[Head of Receivables, date]**: the business's ambition, horizon or priority, dated the day they answered (not the dataset's day). Their decisions: go and ask;
> - **[Squad decision]**: what your squad chooses and signs (committed threshold, owner, what you won't do);
> - **[To confirm: who can answer]**: what nobody has yet. Never invent it.

## 1. Problem
<Which problem, for whom, observed how? Source.>

## 2. Users and stakeholders
<SME customer, their customers, Head of Receivables, the other squad…>

## 3. Quantified success criterion
<Metric + threshold + horizon. Who set it? E.g. "≥ X % of reminded invoices paid within N days, measured over M days on the pilot".>

## 4. Data
<Which data, from where. For each: **available**, **to acquire** or **blocked**.>

## 5. Priority and owner
<Why now, what you will NOT do, who answers for this intent.>

## Dependencies on the other squad
| What we need | Squad | Contract (version read) | Open question |
|---|---|---|---|
