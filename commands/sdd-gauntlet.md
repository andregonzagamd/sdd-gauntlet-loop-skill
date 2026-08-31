---
name: sdd-gauntlet
description: Phase 3 only — fan out builders wave by wave and run each node through a clean-context harsh-critic until it passes the bar, stalls, or hits its cap. Stops before integration.
argument-hint: <change-id>
disable-model-invocation: true
---

Run **Phase 3** of the SDD + Gauntlet Loop for change id `$ARGUMENTS`, and stop
before Phase 4.

Read `skills/sdd-gauntlet-loop/references/phase-3-graph-gauntlet.md` — it has the
wave planning rules, the dispatch prompts, and the stall protocol. Follow it.

## Before every wave

Re-read `AGENTS.md`, `contract.md` and `progress.md` **from disk**. State comes
from files, not from what you remember of this conversation. If you are resuming a
loop a previous session started, `progress.md` tells you which nodes already
passed — do not rebuild them.

## The loop

1. **Plan the wave.** Two tasks share a wave only if they are independent *and*
   their `files:` sets are disjoint. Overlap means separate worktrees or
   consecutive waves. Write the wave plan to `progress.md` before dispatching.
2. **Fan out.** One `builder` subagent per node, in parallel. Each receives the
   constitution, the contract, its single task, and its file list — nothing else.
3. **Gauntlet.** For each finished node, dispatch a **fresh** `harsh-critic` with a
   clean context. It gets `contract.md` and the diff. It does **not** get the
   builder's narrative, self-assessment, or account of how hard it was.
4. **Iterate by tier.** On FAIL, the gap goes back to that node's builder
   verbatim and a *new* critic re-reviews — both tiers, always. On a PASS that
   still carries `IMPROVEMENT` items:
   - **gauntlet-tier** node: send it back and run another iteration. It works,
     and it is not yet impressive.
   - **review-tier** node: it is done. Append the items to the polish queue in
     `progress.md` for the integrator, and move on.

   The iteration cap and the stall rule are safety valves for when every
   dimension never comes back `CLEAR`; hitting one is an escalation, not a finish.
   A node stalls when two consecutive rounds leave the open count unchanged, or
   leave the same item open.
5. **Persist after every verdict.** Append to `progress.md`: wave, node, iteration,
   verdict, open count, items, files changed. One line per event, newest last.

## Never

- Let a builder judge its own work, or accept "mostly works" as a pass.
- Show a critic the builder's reasoning before it reviews.
- Accept a `CLEAR` with no evidence behind it — "I found nothing" is not a check.
- Reuse a critic across iterations of the same node.
- Run two nodes that write the same file in one wave.
- Keep loop state in the conversation instead of `progress.md`.

## Stop by returning

Per node: final verdict, open count, iterations used, and the files it changed. Then
the list of nodes that stalled or escalated, and what the human has to decide
about each. Integration is `/sdd-integrate`.
