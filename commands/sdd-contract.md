---
name: sdd-contract
description: Phase 2 only — translate an approved design.md and tasks.md into contract.md at the repo root, with runnable verifiers and a scored rubric. Stops before any building.
argument-hint: <change-id>
disable-model-invocation: true
---

Run **Phase 2** of the SDD + Gauntlet Loop for change id `$ARGUMENTS`, and stop.

Read `skills/sdd-gauntlet-loop/references/phase-2-contract.md` and follow it.

## Precondition

`specs/$ARGUMENTS/design.md` and `specs/$ARGUMENTS/tasks.md` exist and the user has
approved them. If they do not exist, stop and say so — run `/sdd-spec` first.
Do not invent a spec here to unblock yourself.

## Produce `contract.md` at the repo root

Four sections, each one mechanically checkable or explicitly scored:

- **OBJECTIVE** — the observable outcome in one paragraph. No adjective that
  cannot be measured.
- **VERIFIERS** — shell commands that must exit 0 (tests, typecheck, lint, build),
  plus any manual check written as a pass/fail statement.
- **CRITIC RUBRIC** — the dimensions a critic scores, the minimum bar
  (default 8.5/10), and the named reference standard being compared against.
- **BOUNDARIES** — max iterations per node (default 5), max waves (default 4),
  forbidden actions, and what forces escalation to the human.

## The rule that makes this phase worth running

A verifier nobody can run is not a verifier. Every command in VERIFIERS must be
one you actually ran once, in this repo, and saw exit. If you cannot name the
command for something the design requires, write it down as an open question and
ask the user — do not paper over it with a plausible-looking command.

## Stop by returning

The contract, the verifier commands with the exit code you observed for each, and
any dimension you could not make checkable. Then ask for approval before
`/sdd-gauntlet`.
