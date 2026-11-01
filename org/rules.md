---
id: org/rules
register: contracts
level: org
owner: engineering-direction
status: active
version: 1.0.0
last-validated: 2026-11-16
consumption-mode: system-prompt
consumes: []
consumers: [all]
exception-to: null
exception-approved-by: null
---
# Organisation rules · always apply

These rules apply to every team, every agent, every task. A lower level (programme, team) may extend them, never contradict them without an approved exception.

| ID | Rule |
|---|---|
| ORG-01 | Synthetic data only. Never paste real customer, invoice, bank or personal data into a prompt, a test or a log. |
| ORG-02 | Every new behaviour ships behind a feature flag, **off** by default. Activating a flag is a human decision, traced in the flag journal. |
| ORG-03 | Dates are ISO 8601. Calendar days are `YYYY-MM-DD`; instants carry their offset. Business time is Europe/Paris. |
| ORG-04 | Published contracts are the source of truth between teams. When code and a contract disagree, stop and report: do not guess. |
| ORG-05 | The agent never sets an intent, a spec or a contract to `active`, and never signs a gate. It proposes; a named human decides. |
| ORG-06 | Never build on a `stale` artefact. Re-read what changed, update, re-pin, then a human sets it back to `active`. |
| ORG-07 | A squad writes only in its own folder of the Context Nexus. A disagreement with another squad's contract is settled by talking to that squad. |
| ORG-08 | Existing code owned by another team (Core Billing, `src/billing/`) is reused, not modified. A needed change goes to its owners as a change request. Nothing new is built on a `@deprecated` symbol. |
