# Frontmatter to paste on top of a Spec Kit spec published to the Nexus

Copy `specs/001-<name>/spec.md` from your starter to `../context-nexus/teams/<squad>/intent/specs/<squad>-001.md`, and put this on top:

```yaml
---
id: <squad>/spec-001
register: intent
level: team
owner: <first.last>
status: active
version: 1.0.0
last-validated: <YYYY-MM-DD>
consumption-mode: context-injection
source: starter-<squad>/specs/001-<name>/spec.md
consumes: [teams/<squad>/intent/business-intent.md@1.0.0, programme/payment-reminders/contracts/reference-cases.md@<current>, <other squad's contract>@<current version>]
consumers: []
exception-to: null
exception-approved-by: null
---
```

Pin **every** contract of the other squad, and the reference cases, at the version you actually read.
This pin is what lets `context-assemble` warn you when something you depend on changes. `/publish` can do this for you.
