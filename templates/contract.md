---
id: <squad>/<contract-name>
register: contracts
level: team
owner: <first.last of the contract owner>
status: draft
version: 1.0.0
last-validated: <YYYY-MM-DD>
consumption-mode: context-injection
consumes: [<every artefact you read>@<the version you read>]
consumers: [<the squad that reads this contract>]
exception-to: null
exception-approved-by: null
---
# Contract · <contract-name> · v1

> Start from your squad's v0 in `teams/<squad>/contracts/`, then this shape. A human sets `status: active` after review (ORG-05).
> Checklist before G2: `templates/contract-v1-checklist.md`.

## Purpose
<One sentence: what this contract answers, for whom.>

## Interface
- Function: `<name>({ … })`
- HTTP: `<METHOD> <path>`

## Fields (API-01)
| Field | Type | Unit | Example | Rule |
|---|---|---|---|---|
| `<name>` | <type> | <days, minor units + currency, ISO 8601…> | `<value>` | <RR-xx, D-xx> |

## Errors
| HTTP | Code | When |
|---|---|---|
| 400 | `<CODE>` | <invalid input> |

## Versioning (API-02)
A field removed, renamed, or changed in type or meaning bumps the **major** version. Tell the consumers before you publish it.

## Open questions
- <[To confirm: who] …>
