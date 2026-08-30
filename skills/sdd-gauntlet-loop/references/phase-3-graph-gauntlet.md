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

## Dispatching a builder

One subagent per node, dispatched in parallel across the wave. Give it exactly this and nothing more:

```
You are building one node of a larger change. Stay inside it.

CONSTITUTION: <contents of AGENTS.md>
CONTRACT:     <contents of contract.md>
YOUR TASK:    <the single task from tasks.md, verbatim>
FILES YOU MAY TOUCH: <the task's declared files>

Rules:
- Read every file before editing it.
- Write the smallest change that satisfies the task. No extra abstraction,
  no unrequested features, no files nobody asked for.
- Write or update the tests that prove your "done when" clause.
- Do not touch files outside your list. If you believe you must, stop and
  report why instead of doing it.
- Do not judge your own work. Report what you changed and what you did not.

Return: the files changed, and the "done when" check with its actual result.
```

The builder does **not** get: the other nodes' work, the critic rubric's scoring weights, or permission to declare success.

## Dispatching a critic

A fresh `harsh-critic` subagent per verdict — including every re-check. Reusing a critic that already saw an earlier attempt destroys the clean context that makes it useful.

```
You are reviewing a change you did not write. You have no stake in it passing.

CONTRACT: <contents of contract.md>
DIFF:     <the node's diff>
VERIFIERS: <the commands from the contract>

Do this in order:
1. Run every verifier. Record the exact exit code and output.
2. Read the diff for what the verifiers cannot catch: stubs, TODOs,
   hardcoded values, swallowed errors, dead paths, tests that assert
   nothing, mocks that mock away the thing under test.
3. Score each rubric dimension 0-10 against the named reference standard.
4. Verdict.

You are not here to be encouraging. A change that "mostly works" fails.
If you cannot verify a claim, it is unverified, which is not a pass.

Return exactly:
VERDICT: PASS | FAIL
SCORES:  <dimension>: <n>/10 — <one line of evidence, with file:line>
GAPS:    <numbered, specific, each pointing at file:line and what is wrong>
```

Critics are **read-only**. A critic that fixes what it found has stopped being an independent check and has started grading its own work.

## The loop

```
iteration = 1
while iteration <= max_iterations:
    verdict = critic(diff)
    append_to_progress(wave, node, iteration, verdict)

    if verdict.pass and all_verifiers_exit_0:
        mark task done in tasks.md
        break

    if iteration >= 2 and no_score_improvement_over_last_two:
        escalate("stalled", verdict.gaps)
        break

    builder(gaps=verdict.gaps)     # gaps passed through verbatim
    iteration += 1
else:
    escalate("iteration cap reached", verdict.gaps)
```

Pass the critic's gaps to the builder **verbatim**. Softening them — "the critic had some minor notes" — is how a loop converges on mediocrity.

## The stall protocol

When a node stalls, do not keep spending iterations on it. Stop and report:

- the task and what it was supposed to do,
- the last two critic verdicts with scores, so the trend is visible,
- your read on why it is stuck — most stalls are a bad spec, a contradictory contract, or a verifier asserting something the design never actually specified,
- the smallest decision a human could make to unblock it.

A stall is usually information about Phase 1, not about the builder.

## Writing progress.md

Append-only. One event per line, newest last, never rewritten:

```
2026-08-30T14:02Z  wave=1  plan       nodes=[T1,T2,T3]  parallel=3
2026-08-30T14:11Z  wave=1  node=T1    iter=1  FAIL  7.0/10  gap="no test for expired token (auth.ts:88)"
2026-08-30T14:19Z  wave=1  node=T1    iter=2  PASS  9.0/10  files=[src/api/auth.ts, src/api/auth.test.ts]
2026-08-30T14:20Z  wave=1  node=T2    iter=1  PASS  8.7/10  files=[src/db/schema.ts]
2026-08-30T14:41Z  wave=1  node=T3    iter=5  STALL 6.5/10  escalated: design.md silent on refresh-token rotation
```

This file is the loop's memory. A new session should be able to read `AGENTS.md`, `contract.md` and `progress.md` and know exactly where to pick up — that is the whole point of writing to disk instead of trusting the context window.
