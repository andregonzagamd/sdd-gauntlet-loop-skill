# Phase 1 — Spec-Driven Development

The purpose of this phase is to spend cheap tokens on thinking so the expensive tokens on building are not wasted. An ambiguity resolved here costs one paragraph; the same ambiguity resolved in Phase 3 costs a full gauntlet cycle across every affected node.

## Choosing the path

```
openspec/ exists OR `openspec` CLI on PATH  ->  drive via OpenSpec (/opsx propose)
otherwise                                    ->  generate the three artifacts directly
```

Either way the output is the same three files under `specs/<change-id>/`. Downstream phases must not care which path produced them.

## proposal.md

```markdown
# Proposal — <change-id>

## Problem
What is broken or missing today. Observable, not abstract.

## Motivation
Why now, and what it unblocks.

## Scope
- In: ...
- Out: ...          <- non-goals are load-bearing; the critic will hold you to them

## Success looks like
Two or three sentences a non-engineer could verify.

## Risks
What could make this the wrong change.
```

## design.md

```markdown
# Design — <change-id>

## Architecture
Components, and how a request flows through them.

## Data model
Tables/collections/types, with the fields that matter and why.

## Interfaces
Every route, function signature, or event this change adds or alters.
Request shape, response shape, error cases.

## Dependencies
Libraries added, with the reason and the version.

## Alternatives rejected
What you considered and why not. This is the section that stops the loop
from re-litigating a decision three iterations in.

## Open questions
Anything a human must answer before Phase 3. If this section is non-empty,
the pipeline stops here.
```

## tasks.md

Each task is atomic: one builder, one node of the graph, one critic verdict.

```markdown
# Tasks — <change-id>

- [ ] T1 — <verb + object>
      files: src/db/schema.ts
      depends: none
      done when: <the check that proves it>

- [ ] T2 — <verb + object>
      files: src/api/auth.ts, src/api/routes.ts
      depends: T1
      done when: ...
```

Rules for good tasks:

- **One task, one concern.** If the "done when" needs an "and", split it.
- **Declare files honestly.** The wave planner uses `files:` to decide what can run in parallel. An undeclared file is a merge conflict waiting to happen.
- **`done when` is a check, not a feeling.** "Login works" is not a task check; "POST /login with valid credentials returns 200 and a JWT whose `sub` is the user id" is.
- **Order by dependency, not by importance.**

## The code lock

During this phase, do not create, edit, or delete any implementation file. Writing spec artifacts is the only permitted write. If the urge to "just quickly scaffold it" appears, that is exactly the failure mode this phase exists to prevent.

## Exit gate

Present the three artifacts and stop for approval, unless the invocation explicitly said to run unattended. When unattended, state the assumptions you made in place of that approval at the top of `progress.md`, and proceed.
