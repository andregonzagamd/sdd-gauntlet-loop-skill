---
name: sdd-integrate
description: Phase 4 only — reconcile the seams between builder nodes, run the full verifier suite on the merged result, and put the whole change through one final clean-context critic.
argument-hint: <change-id>
disable-model-invocation: true
---

Run **Phase 4** of the SDD + Gauntlet Loop for change id `$ARGUMENTS`, and stop
before archiving.

Read `skills/sdd-gauntlet-loop/references/phase-4-integrate-archive.md` and follow
the integration half of it.

## Precondition

Every node in `progress.md` has a PASS from a clean-context critic. If a node
stalled or escalated, stop and report it — integrating around an unfinished node
buries the failure instead of fixing it.

## Do

1. **Dispatch the `integrator` subagent.** Its job is the seams: duplicated
   helpers, an interface that drifted on one side of `design.md`, migrations that
   conflict in sequence, a config key written under one name and read under
   another, imports that resolve per node and break together.
2. **Full verifier suite, from a clean state.** Not per-node subsets. Every node
   passing its own slice is not evidence the system works — this phase exists
   because it frequently isn't.
3. **Reconcile drift in `design.md`.** If the build diverged from the design and
   the divergence was right, update the design before it gets archived. An
   archived spec that lies poisons the next change planned against it.
4. **Final gauntlet.** Dispatch one more `harsh-critic`, clean context, scoring the
   **whole** change against `contract.md` — not any single node.

## The integrator's limits

It may edit to reconcile seams. It may not add features, expand scope, or disable,
skip or weaken a test to make the suite green. If the merged result cannot pass
without changing the contract, that is an escalation to the human, not an edit.

## Stop by returning

Each seam and the choice made at it, the full verifier output, the final critic's
verdict with every dimension's state, and any drift found between `design.md` and reality. Archiving
is `/sdd-archive`.
