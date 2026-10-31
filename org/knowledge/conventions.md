---
id: org/conventions
register: knowledge
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
# Conventions

- JSON fields in camelCase. Event names in snake_case, past tense or "scheduled" (`reminder_scheduled`, `payment_received`).
- Amounts are integer **minor units** (cents) in a field ending in `Minor`, always with a `currency` (ISO 4217). Never floats for money.
- Ids are opaque strings with a prefix: `inv_`, `cus_` style for new ids; the dataset uses `inv_0001`, `C01`, `pay_0001`.
- HTTP APIs are versioned in the path (`/v1/…`). Errors: `{ "code": "REMINDER_XXX", "message": "…", "details": {} }`.
- Tests: Vitest, one `describe` per function, test names start with the acceptance-criterion id they prove.
