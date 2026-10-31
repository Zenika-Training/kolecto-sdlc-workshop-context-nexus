---
id: org/security
register: contracts
level: org
owner: security-office
status: active
version: 1.0.0
last-validated: 2026-11-16
consumption-mode: system-prompt
consumes: []
consumers: [all]
exception-to: null
exception-approved-by: null
---
# Security contract

| ID | Requirement | Checked by |
|---|---|---|
| SEC-01 | No secret in code, tests, data or logs (API keys, tokens, private keys). | `npm run scan` (gate G3) |
| SEC-02 | No IBAN, card number or bank detail anywhere in this project, even fake. | `npm run scan` (gate G3) |
| SEC-03 | Logs never contain an e-mail address or a customer name: log ids only (`customerId`, `invoiceId`). | review at G3 |
| SEC-04 | Inputs from HTTP are validated; an invalid input returns `400` with an error code, never a stack trace. | tests |
