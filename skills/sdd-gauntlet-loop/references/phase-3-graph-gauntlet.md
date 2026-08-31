# Phase 3 — Diamond graph + gauntlet loop

Two ideas doing different jobs. The **graph** decides who works at the same time. The **gauntlet** decides whether their work survives.

## Planning waves

```
for each task in tasks.md:
    node = task
    edges = task.depends

wave_1 = nodes with no unmet dependencies AND pairwise-disjoint `files:`
wave_2 = next such set, and so on
```

Two nodes go in the same wave only when both hold:

1. Neither depends on the other, directly or transitively.
2. Their declared `files:` sets do not intersect.

If two independent nodes must touch the same file, choose one:

- run them in **separate worktrees** and merge in Phase 4 (preferred for large, genuinely independent work), or
- **serialize** them into consecutive waves (simpler, and usually right for two small edits).

Write the wave plan into `progress.md` before dispatching anything. If the loop is interrupted, this is what lets a fresh session resume without redoing work.

## Dispatching builders and critics

One builder subagent per node, dispatched in parallel across the wave. A **fresh** critic per verdict, including every re-check — reusing a critic that saw an earlier attempt destroys the clean context that makes it useful.

**The full working prompts live in [`dispatch-prompts.md`](dispatch-prompts.md)**, together with the generators for the node-specific probes. Read it before dispatching anything: measured on real runs, that is where most of this phase's quality actually comes from.

Four rules from that file are load-bearing enough to repeat here:

- **The builder does not get** the other nodes' work, the critic's rubric, or permission to declare success.
- **The critic does not get** the builder's narrative, self-assessment, or account of how hard the problem was. It gets the contract and the diff.
- **Name the probes for every node.** Agent definitions carry the *format* — a critic dispatched with three lines still returns every dimension in a state with `file:line`. They do not carry the *rigor*. The measured difference between a critic that catches a fabricated test fixture and one that shrugs is whether the prompt told it what to probe.
- **Say what must not be re-reviewed.** Name the nodes that already passed (read them to understand what this node calls; do not re-score them) and the nodes in flight (their files may be absent or half-written, and that is not this node's gap). Without this a critic re-litigates a closed node, and the same work gets failed twice for the same thing.

Critics are **read-only**. A critic that fixes what it found has stopped being an independent check and has started grading its own work.

## The loop

```
iteration = 1
while iteration <= max_iterations:
    verdict = critic(diff)                 # every dimension GAP | IMPROVEMENT | CLEAR
    append_to_progress(wave, node, iteration, verdict)

    if verdict.gaps:                       # something is wrong
        if stalled(verdict, previous):     # see below
            escalate("stalled", verdict.gaps); break
        builder(items=verdict.gaps)        # verbatim, always
        iteration += 1; continue

    if not verdict.improvements:           # all CLEAR — a candidate finish, not a finish
        if node.tier == "review":
            mark task done in tasks.md; break
        second = critic(diff, probes=unused_generators)   # fresh context, blind to the first
        append_to_progress(wave, node, iteration, second, confirming=True)
        if not second.open_items:
            mark task done in tasks.md; break
        verdict = union(verdict, second)   # the second critic's items are now the node's
        # falls through into the GAP / IMPROVEMENT branches above, same rules

    # works, and not finished: material improvements remain
    if node.tier == "gauntlet":
        if stalled(verdict, previous):
            escalate("stalled", verdict.improvements); break
        builder(items=verdict.improvements)
        iteration += 1
    else:                                  # review tier: bank and move on
        defer_to_integrator(verdict.improvements)
        mark task done in tasks.md; break
else:
    escalate("iteration cap reached", verdict.open_items)
```

**The brake is every dimension closing `CLEAR`** — the critic produced, for each one, the command, probe or comparison that closes it, and could name no material change left. A verdict with `IMPROVEMENT` still on it is a node that works and is not finished.

## Confirming a finish — two critics, not one

`FAIL` and `PASS-UNFINISHED` are self-correcting: they buy another round, and a
critic that invents an item costs you iterations but not correctness.
`PASS-FINISHED` is the only verdict whose error is **silent** — nobody looks
again. So it is the one verdict that is not taken on a single agent's word.

When a `gauntlet` node comes back with zero open items, dispatch a second
clean-context critic on the same node, and take the **union** of both critics'
items. The node is finished only when both return zero.

Three constraints make it worth the call:

- **Different probes, not a different model.** This is the one that was measured
  and got the answer backwards from what everyone expects. Running the identical
  prompt again on a second model found **nothing new on either node** — where the
  first critic was blind, its twin was blind in the same place. What varies a
  critic's findings is what it was pointed at. So the second dispatch keeps the
  contract, the design and the task verbatim and swaps in the probe generators
  the first prompt did not use.
- **The second critic must be blind to the first.** Not its verdict, not its
  probes, not the fact that it exists. A confirming critic that knows a peer
  already closed the node is a rubber stamp with extra steps.
- **It runs once per node, on the last iteration only.** Every earlier round
  already has open items, and open items do not need confirming.

Why not simply a better prompt: that was tested too. A single critic dispatched
with the full [`dispatch-prompts.md`](dispatch-prompts.md) template found the real
item on one node and closed the other as finished, missing an item another critic
had found with a *different* probe list. Sharper aiming raised the floor and did
not close the blind spot — but neither did a second opinion on the same aim. The
blind spot lives in the probe list, which is why the fix is to vary it.

The cost is one extra call per finished node. Spend it where the first prompt's
generators structurally cannot reach — a probe list that repeats the first one is
the one configuration measured to be worth nothing.

`stalled(verdict, previous)` replaces the old score-improvement rule: a node is stalled when two consecutive rounds leave `OPEN` unchanged, or leave the same item open. That is an observable fact about named items, not a trend read off a number — and it is why the critic reports `OPEN` as a count.

**What happens next depends on the node's tier, declared in `contract.md` before any code existed:**

- **gauntlet tier** — the nodes carrying the change's real risk. Send the `IMPROVEMENT` items back to the builder and run another iteration. This is the expensive path and it is where the technique earns its cost.
- **review tier** — glue, wiring, scaffolding, config. The node is done at defect-free. Its `IMPROVEMENT` items are not thrown away: append them to the **polish queue** in `progress.md`, and Phase 4 hands the whole queue to the integrator, which is already running and already licensed to edit.

That split is what keeps a real gauntlet on what matters without paying gauntlet prices on a 35-line entry point. A review-tier node still gets a clean-context critic, the full verifiers, and a verdict with `file:line` — it is a genuine code review. It simply is not asked to become excellent.

Deferring is not discarding. Everything in the polish queue is applied in one existing pass and then judged by the final whole-change critic, so nothing named ever silently disappears.

Pass the critic's items to the builder **verbatim**, `GAP` and `IMPROVEMENT` alike. Softening them — "the critic had some minor notes", "it was only polish" — is how a loop converges on mediocrity.

## The stall protocol

When a node stalls, do not keep spending iterations on it. Stop and report:

- the task and what it was supposed to do,
- the last two critic verdicts with their open items, so it is visible what stayed open,
- your read on why it is stuck — most stalls are a bad spec, a contradictory contract, or a verifier asserting something the design never actually specified,
- the smallest decision a human could make to unblock it.

A stall is usually information about Phase 1, not about the builder.

## Writing progress.md

Append-only. One event per line, newest last, never rewritten:

```
2026-08-30T14:02Z  wave=1  plan       nodes=[T1,T2,T3]  parallel=3
2026-08-30T14:11Z  wave=1  node=T1  iter=1  FAIL             open=2  gap="no test for expired token (auth.ts:88)"
2026-08-30T14:19Z  wave=1  node=T1  iter=2  PASS-UNFINISHED  open=1  improvement="refresh path unverified: no probe exists (auth.ts:104)"
2026-08-30T14:26Z  wave=1  node=T1  iter=3  PASS-FINISHED    open=0  files=[src/api/auth.ts, src/api/auth.test.ts]
2026-08-30T14:29Z  wave=1  node=T1  iter=3  CONFIRM          open=0  second critic (haiku, blind to the first) agrees; node finished
2026-08-30T14:20Z  wave=1  node=T2  iter=1  PASS-FINISHED    open=0  files=[src/db/schema.ts]
2026-08-30T14:41Z  wave=1  node=T3  iter=5  STALL            open=2  escalated: same 2 items open since iter=3; design.md silent on refresh-token rotation
```

This file is the loop's memory. A new session should be able to read `AGENTS.md`, `contract.md` and `progress.md` and know exactly where to pick up — that is the whole point of writing to disk instead of trusting the context window.
