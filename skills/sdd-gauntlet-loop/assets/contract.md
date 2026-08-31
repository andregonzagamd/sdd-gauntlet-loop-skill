# contract.md

> **Change:** [change-id]
> **Spec:** `specs/[change-id]/`
> **Status:** draft | approved | in progress | passed
> **Done means:** every rubric dimension closed `CLEAR` by a clean-context critic

The single source of truth for both builders and critics. Anything not written
here will not be built and will not be enforced.

That is a claim this file has to earn. **Every literal the rubric grades against
lives here, or is cited here by file and section** — the pinned output, the exact
error strings, the signatures, the `files:` list each node is fenced into. A
contract that forbids touching "the node's declared `files:` list" while the list
itself is in another document is enforcing a boundary it never defined, and the
critic reading only this file cannot check it.

---

## OBJECTIVE

[One paragraph. The exact observable outcome. No adjective that cannot be
measured. Write it so that a stranger could tell whether it happened.]

**Reference standard:** [the named thing this is held next to — a competitor's
implementation, a spec, an existing module in this repo. "Good" is not a
standard; "the error handling in `src/payments/`" is.]

---

## VERIFIERS

Commands that must exit 0. If it has no exit code, it belongs in the rubric, not here.

| # | Command | What it proves |
|---|---|---|
| V1 | `[pnpm test path/to/spec]` | [the behavior it asserts] |
| V2 | `[pnpm typecheck]` | no type regressions |
| V3 | `[pnpm lint]` | style and dead-code rules hold |
| V4 | `[pnpm build]` | the change ships |
| V5 | `[curl -s localhost:3000/... \| jq -e '...']` | [the runtime behavior] |

**Manual checks** (pass/fail, stated as a question a human answers yes to):

- [ ] M1 — [e.g. "Submitting the form with an expired token shows the re-login prompt, not a 500."]

---

## CRITIC RUBRIC

Closed by a clean-context critic that did not write the code. **There is no
score and no bar.** Each dimension below ends in exactly one state:

| State | What the critic writes | Effect |
|---|---|---|
| **GAP** | the defect, with `file:line`, and what would fix it | FAIL |
| **IMPROVEMENT** | the material change missing, with `file:line` | passes, not finished |
| **CLEAR** | *how it knows* — command + exit code, probe + result, or the two things compared and where | finished, for that dimension |

An `IMPROVEMENT` must alter how the code **behaves**, how it **fails**, or how it
is **verified**. Naming, structure, layout, comments and taste are `NOTES` and
never hold a node open.

`CLEAR` is not "I found nothing here" — that is a feeling, and a dimension closed
on a feeling is unverified. It is the evidence that closes the question. If the
evidence cannot be produced, the dimension is an `IMPROVEMENT` naming the check
nobody can currently run.

A node is finished when **every** dimension is `CLEAR`. Defect-free is not
finished: it only means no `GAP`. The counters under BOUNDARIES are safety valves
for when that state never arrives; hitting one is an escalation, not a finish.

| Dimension | What it asks |
|---|---|
| Correctness | is the objective met, including every edge case named in `design.md`? |
| Completeness | any stub, `TODO`, hardcoded value, or silently dead path? |
| Design fidelity | did the builder quietly change an interface or decision from `design.md`? |
| Failure behavior | does every error path named in the design exist, behave as pinned, and have a test that triggers it? |
| Codebase fit | does this read like whoever wrote the rest of the repo wrote it? |
| Test integrity | do tests assert exact values from the design, rather than nothing, a mock, or the implementation itself? A case only the critic's own probe ever exercised is untested — that is a finding, not evidence. |
| Reference comparison | held next to [the named reference standard], where does it fall short? |

---

## BOUNDARIES

- Max iterations per node: **5**
- Max waves: **4**
- Stall rule: stop a node after **2** consecutive rounds where the open-item
  count did not fall, or where the same item is still open
- Escalate to a human for: [auth, billing, data retention, anything irreversible]

**Never, under any framing:**

- commit secrets, keys, or `.env` contents
- drop or alter production schema, delete data, force-push, rewrite history
- deploy, or call a paid/external API not named in `design.md`
- disable, skip, or weaken a test to make the suite pass
- mark a node passed on the builder's own say-so
- touch a file outside the node's declared `files:` list — stop and report instead

---

## TASK CHECKLIST

Mirrors `specs/[change-id]/tasks.md`. A box is checked only by a critic verdict.

**Every node is tiered here, before any code exists.** Both tiers get a
clean-context critic, the full verifiers, and a verdict with `file:line` — the
tier decides only whether the node iterates toward excellence or stops at
defect-free.

| Tier | Which nodes | Ends when |
|---|---|---|
| **gauntlet** | the ones carrying this change's real risk — the logic that is hard to get right, the thing that is expensive when wrong | the critic can name no material improvement |
| **review** | glue, wiring, config, scaffolding | no defects found; named improvements go to the polish queue for the integrator |

Assign the tier from risk, not from size, and write the reason. If everything is
gauntlet, nothing is: you have just made the loop expensive without aiming it.
Tiering it now, before there is code to defend, is what stops this from becoming
a retroactive excuse for mediocre work.

Each line carries the node's `files:` list, copied from `tasks.md`. That list is
the fence the boundary below refers to, and a critic that only reads this file
has no other way to know where the node was allowed to write.

- [ ] T1 — [task] — tier: [gauntlet|review] — [why] — files: [] — open: __
- [ ] T2 — [task] — tier: [gauntlet|review] — [why] — files: [] — open: __
- [ ] T3 — [task] — tier: [gauntlet|review] — [why] — files: [] — open: __

**Integration:** [ ] full verifier suite on the merged change — open: __

A `gauntlet` node's box is checked by **two** critics agreeing on zero open items,
the second dispatched blind to the first and aimed at probes the first did not
run. So is the final whole-change verdict.

---

## OUT OF SCOPE

[Copied from the proposal's non-goals. The critic enforces these too: work
that appears here and got built anyway is scope creep, and it fails the node.]
