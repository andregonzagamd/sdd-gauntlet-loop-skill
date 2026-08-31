---
name: sdd-contract
description: Phase 2 only — translate an approved design.md and tasks.md into contract.md at the repo root, with runnable verifiers and a rubric a critic can close. Stops before any building.
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

Four sections. Every requirement in them must be checkable — by a command, or by
evidence a critic can produce:

- **OBJECTIVE** — the observable outcome in one paragraph. No adjective that
  cannot be measured.
- **VERIFIERS** — shell commands that must exit 0 (tests, typecheck, lint, build),
  plus any manual check written as a pass/fail statement.
- **CRITIC RUBRIC** — the dimensions a critic must close and the named reference
  standard they are held against. **No score, no bar:** each dimension ends as
  `GAP` (defect, `file:line`), `IMPROVEMENT` (a change that would alter behavior,
  failure or verification), or `CLEAR` (the command, probe or comparison proving
  it — never "I found nothing"). A node is finished only when every dimension is
  `CLEAR`.
- **TASK CHECKLIST** — every node tiered `gauntlet` (carries the change's real
  risk; iterates until a critic can name no material improvement) or `review`
  (glue and wiring; done at defect-free, improvements deferred to the
  integrator). Assign by risk, never by size, and write the reason. Decide it
  here, before any code exists to defend — and if every node is gauntlet,
  nothing is.
- **BOUNDARIES** — max iterations per node (default 5), max waves (default 4),
  forbidden actions, and what forces escalation to the human.

## The rule that makes this phase worth running

A verifier nobody can run is not a verifier — and neither is one that can never
pass. Run every command **now, against the unbuilt repo**, and record the exit
code you saw in the contract. They should be red. A verifier that is already
green before anything exists is a gate that will never catch anything; a verifier
that fails for a reason unrelated to the code will hold the loop hostage and the
node that hits it will be blamed for a defect it did not introduce.

Writing the red baseline down is what later lets you tell a broken scaffold from
a real regression.

If you cannot name the command for something the design requires, write it down
as an open question and ask the user — do not paper over it with a
plausible-looking command.

## Stop by returning

The contract, the verifier commands with the exit code you observed for each, and
any dimension you could not make checkable. Then ask for approval before
`/sdd-gauntlet`.
