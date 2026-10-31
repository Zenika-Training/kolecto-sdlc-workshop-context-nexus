# Checklist · publishing your contract v1 (before G2)

- [ ] `version: 1.0.0`, `status: active`, a named `owner`, `last-validated` of today
- [ ] `consumes` pinned on the **current** version of everything you read (`npm run context -- --check` passes)
- [ ] `consumers` up to date
- [ ] Every exchanged field has a type, a **unit** and an example (API-01)
- [ ] Field names checked **with the other squad**, side by side (the contract market). Gaps settled or written as open questions
- [ ] The "To clarify before v1" section of v0 is handled or explicitly postponed
