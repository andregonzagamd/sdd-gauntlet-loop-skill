---
name: sdd-archive
description: Phase 5 only — close out a passed change: archive its spec as living documentation, write the closing progress entry, and report what was built and what was deliberately left out.
argument-hint: <change-id>
disable-model-invocation: true
---

Run **Phase 5** of the SDD + Gauntlet Loop for change id `$ARGUMENTS`.

Read `skills/sdd-gauntlet-loop/references/phase-4-integrate-archive.md` and follow
the archive half of it.

## Precondition — check it, do not assume it

Every box in `contract.md` is checked: all verifiers exit 0 on the merged result,
the final whole-change critic scored at or above the bar, and every task in
`specs/$ARGUMENTS/tasks.md` is ticked. Re-run the verifiers now rather than
trusting the last run recorded in `progress.md`; paste their actual output.

If anything fails, stop. Do not archive a change that did not pass — the archive
is the project's documentation, and a spec filed as done that wasn't is worse than
no spec.

## Do

1. Move `specs/$ARGUMENTS/` to `specs/archive/$ARGUMENTS/`, or run `/opsx archive`
   if the repo is driven by OpenSpec.
2. Confirm the archived `design.md` matches what was actually built. If Phase 4
   left drift unresolved, resolve it before the move, not after.
3. Append the closing entry to `progress.md` — outcome, final score, date.
   `progress.md` is append-only: never rewrite or prune earlier entries, they are
   what lets a future session know what already failed.

## Report to the user

- what was built, in plain language
- every verifier and its result, pasted
- the final critic score per rubric dimension
- what the contract deliberately left **out of scope**, so nobody assumes it shipped
- anything the loop escalated and the human still has to decide
