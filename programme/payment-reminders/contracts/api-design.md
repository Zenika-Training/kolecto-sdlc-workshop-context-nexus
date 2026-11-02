---
id: programme/api-design
register: contracts
level: programme
owner: architecture
status: active
version: 1.0.0
last-validated: 2026-11-16
consumption-mode: system-prompt
consumes: []
consumers: [squad-a-policy, squad-b-outreach, squad-c-insight]
exception-to: null
exception-approved-by: null
---
# API design contract · programme

| ID | Requirement |
|---|---|
| API-01 | Every contract between squads gives each field a name, a type, a unit (for amounts: minor units + `currency`) and one example. |
| API-02 | A breaking change (field removed, renamed, type or meaning changed) bumps the **major** version. Consumers are told before publishing. |
| API-03 | A contract lists its `consumers` in its frontmatter. |
| API-04 | Until a squad publishes its v1, consumers code against the v0 mock in their starter (`src/mocks/`). |
