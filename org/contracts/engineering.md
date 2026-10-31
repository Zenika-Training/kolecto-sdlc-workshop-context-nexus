---
id: org/engineering
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
# Engineering contract

| ID | Requirement | Checked by |
|---|---|---|
| ENG-01 | Lint and typecheck pass. | gate G3 |
| ENG-02 | Every acceptance criterion of the spec has at least one test **named after it** (`it('AC-3: …')`). | gate G3 + review |
| ENG-03 | Line coverage ≥ 70 %. | gate G3 |
| ENG-04 | The programme's reference tests (`test/reference/`) pass. They are read-only. | gate G3 |
| ENG-05 | The spec is updated with what implementation taught (new edge case, decision): code and spec never drift. | review at G3 |
| ENG-06 | Every deployed service exposes `/health` and `/metrics`, and has a runbook with an owner and a rollback. | gate G4 |
