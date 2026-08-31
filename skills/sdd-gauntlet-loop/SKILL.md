---
name: sdd-gauntlet-loop
description: Run a project or feature end-to-end through a spec-first, graph-parallel, critic-gated pipeline. Use when the user asks to build, implement, or ship a feature/project autonomously, or invokes /sdd-gauntlet-loop. Phases - spec (SDD), contract, parallel builders (diamond graph), skeptical critics (gauntlet), integration, archive.
color: purple
metadata:
  version: "1.0.0"
  techniques: "spec-driven-development, diamond-graph, gauntlet-loop, disk-persisted-state"
---

# SDD + Gauntlet Loop

An autonomous build pipeline that layers three techniques:

| Layer | Technique | Answers |
|---|---|---|
| Plan | Spec-Driven Development | *What exactly are we building, and what counts as done?* |
| Topology | Diamond Graph | *Who works on what, in parallel, and where does it converge?* |
| Quality | Gauntlet Loop | *Who says it's good enough, and when do we stop?* |

**The one rule everything else serves: the agent that writes the code never decides whether it passed.**

## Operating principles

1. **Disk over memory.** Every decision, verdict and iteration is written to a file before moving on. Context windows rot; `progress.md` does not. Never hold loop state only in the conversation.
2. **Spec before code.** No implementation file is touched until `specs/<change-id>/` and `contract.md` exist and are approved.
3. **Clean-context critics.** A critic receives the contract and the diff — never the builder's reasoning, excuses, or self-assessment.
4. **Bounded autonomy.** Every loop has a hard stop: max iterations, forbidden actions, and an escalation path to the human.
5. **Surgical edits.** Read before write. Edit before create. Build the smallest thing that satisfies the contract — no scaffolding nobody asked for.

## Pipeline

```
                    [0] BOOTSTRAP  (AGENTS.md, contract.md, progress.md)
                            |
                    [1] SPEC       proposal.md -> design.md -> tasks.md    (no code)
                            |
                    [2] CONTRACT   objective + verifiers + rubric + boundaries
                            |
        ________________ [3] FAN-OUT ________________          <- top of the diamond
       /                 |                |                \
   builder A         builder B        builder C         builder D        (parallel wave)
       \                 |                |                /
        \__ critic A     critic B         critic C     critic D __/       <- clean context, readonly
                    \        |          |         /
                     \_______ FAIL -> back to its own builder (bounded)
                            |
                    [4] INTEGRATE  full verifier suite + whole-change critic
                            |
                    [5] ARCHIVE    spec becomes living docs; summarize
```

## Phase 0 — Bootstrap

Check the repo root for `AGENTS.md`, `contract.md`, `progress.md`. Create any that are missing from `assets/` in this skill directory. If `AGENTS.md` exists but has no "Golden rules" section, ask before overwriting — never clobber a constitution someone wrote.

Determine the change id: a kebab-case slug for this piece of work (e.g. `jwt-auth`, `checkout-redesign`). Everything below lives under it.

## Phase 1 — Spec (SDD)

Read `AGENTS.md` first. Then produce, without touching a single implementation file:

- `specs/<change-id>/proposal.md` — problem, motivation, scope, explicit non-goals
- `specs/<change-id>/design.md` — architecture, data model, API contracts, libraries, trade-offs rejected
- `specs/<change-id>/tasks.md` — ordered atomic tasks, each with the files it touches and its dependencies

If OpenSpec is present, drive this phase through it (`/opsx propose`) and treat its artifacts as the ones above. The pipeline never depends on a tool being installed.

**Code lock:** writing implementation code during this phase is a failure. Stop and present the spec to the user for approval unless the invocation said to run unattended.

Details and templates: `references/phase-1-spec.md`.

## Phase 2 — Contract

Translate `design.md` + `tasks.md` into `contract.md` at the repo root. It has four sections, and every requirement in them must be *checkable* — by a command, or by evidence a critic can produce:

- **OBJECTIVE** — the exact observable outcome, one paragraph, no adjectives that can't be measured.
- **VERIFIERS** — shell commands that must exit 0 (tests, typecheck, lint, build), plus any manual check with a pass/fail statement.
- **CRITIC RUBRIC** — the dimensions a critic must close, the reference standard they are held against, and each node's tier: `gauntlet` or `review`. There is no score; each dimension ends as `GAP`, `IMPROVEMENT`, or `CLEAR`.
- **BOUNDARIES** — max iterations per node (default 5), max total waves, forbidden actions, and what forces escalation to the human.

Details: `references/phase-2-contract.md`.

## Phase 3 — Fan-out and gauntlet (the diamond)

Read `AGENTS.md`, `contract.md`, `progress.md` before every wave — state comes from disk, not from what you remember.

1. **Build the graph.** Group `tasks.md` into waves. Two tasks belong in the same wave only if they are independent *and* touch disjoint files. Write the wave plan into `progress.md` before dispatching.
2. **Fan out.** Dispatch one `builder` subagent per node, in parallel across the wave. Each gets: the constitution, the contract, its task, and the files it may touch — nothing else. If two nodes must touch the same file, run them in isolated worktrees or serialize them.
3. **Run the gauntlet.** For each finished node, dispatch a `harsh-critic` subagent with a clean context. It receives `contract.md` and the diff, never the builder's narrative. It runs the verifiers and closes every rubric dimension, each with `file:line` or the evidence behind it.
4. **Loop, bounded.** Any `GAP` returns to the builder verbatim, re-critiqued by a *fresh* critic. `IMPROVEMENT` buys another round on a `gauntlet` node; on a `review` node it goes to the polish queue and the node is done. Escalate at the iteration cap, or when two rounds leave the same items open.
5. **Confirm the finish.** `PASS-FINISHED` is the verdict whose error is silent, so a `gauntlet` node needs **two** clean-context critics — the second blind to the first and aimed at **different probes**, since a repeated probe list finds nothing new. Both at zero, or their items union and the node continues.
6. **Persist.** After every critic verdict, append to `progress.md`: wave, node, iteration, verdict, open count, items, files changed. One line per event, newest last.

Waves and the stall protocol: `references/phase-3-graph-gauntlet.md`. **Prompts and probes: `references/dispatch-prompts.md` — read before dispatching.**

## Phase 4 — Integrate

Dispatch the `integrator` subagent once all waves pass individually. It resolves seams between nodes, runs the **full** verifier suite on the merged result, and hands the whole change to one final clean-context critic. Node-level passes do not imply the system works; this phase exists because they often don't.

## Phase 5 — Archive

When every contract box is checked: move `specs/<change-id>/` to `specs/archive/<change-id>/` (or run `/opsx archive`), leaving the specification as the project's living documentation. Append the closing entry to `progress.md`, with the commit it describes. Then report to the user.

Details: `references/phase-4-integrate-archive.md`.

## Stop conditions

**The brake is the critic being impressed, not the counter running out.** A node finishes when a clean-context critic can name no **material** improvement — nothing that would change behavior, failure, or verification. Naming and taste never hold a node open.

Defect-free is not finished — it means no `GAP`, with every `IMPROVEMENT` still open. Only `gauntlet`-tier nodes buy the rounds that clear those; `review`-tier nodes stop there and hand theirs to the integrator. The counters below are safety valves; reaching one is an escalation, not a success.

Stop and hand back to the human when any of these is true:

- All verifiers exit 0, every task in `tasks.md` is checked, and two independent critics closed **every** dimension `CLEAR`. **(success)**
- A node hits its iteration cap, or two consecutive rounds leave the same items open. **(stall — a safety valve, not a finish)**
- The work would require an action listed as forbidden in `BOUNDARIES` — schema drops, deploys, deleting data, rewriting history, touching credentials. **(boundary)**
- The spec turns out to be wrong. Do not patch around a bad spec: stop, say which assumption broke, and go back to Phase 1.

## Anti-patterns

- A critic that edits code. Critics are read-only and stay that way.
- Running a wave with nodes that write the same file.
- Loop state kept in the conversation instead of `progress.md`.
- **A dimension closed on a probe the critic ran itself.** The probe dies with the context; the suite survives. An uncovered case that works is the finding, not the evidence.
- **Treating "no defects found" as "impressive".** They are different questions, and only the second one ends the loop.
- Committing secrets, keys, or `.env` contents — never, under any framing.
