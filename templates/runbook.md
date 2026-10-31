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

## Owner
<Who is called first, and their backup.>

## Flag
<Flag name, current state, who may switch it, link to `flags-journal.md`.>

## What we watch
<Signal (from /metrics or the events), normal value, alert threshold.>

## If it goes wrong
| Symptom | Check | Action |
|---|---|---|

## Rollback
<How to switch off in under one minute, and who decides.>
