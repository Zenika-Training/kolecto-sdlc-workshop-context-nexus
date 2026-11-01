---
id: <squad>/runbook
register: process
level: team
owner: <first.last, operations owner>
status: active
version: 1.0.0
last-validated: <YYYY-MM-DD>
consumption-mode: context-injection
consumes: []
consumers: []
exception-to: null
exception-approved-by: null
---

# Runbook · <service> · G4 Released and Observable

> Five lines, one per heading. Someone on call reads it in 30 seconds.

**Owner:** <who is called first, and their backup>
**Flag:** <flag name, who may switch it; trace in `flags-journal.md`>
**Watch:** <one signal from /metrics or the events, its normal value, the alert threshold>
**If it goes wrong:** <first check, then first action>
**Rollback:** <switch the flag off with `npm run flag -- <name> off --reason "…"`: who decides, how fast>
