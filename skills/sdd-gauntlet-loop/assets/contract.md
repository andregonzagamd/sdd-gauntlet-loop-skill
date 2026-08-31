# contract.md

> **Change:** [change-id]
> **Spec:** `specs/[change-id]/`
> **Status:** draft | approved | in progress | passed
> **Quality bar:** 8.5 / 10

The single source of truth for both builders and critics. Anything not written
here will not be built and will not be enforced.

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

Scored 0–10 by a clean-context critic that did not write the code. Bar: **8.5**.
Every dimension must clear the bar; a high average does not rescue a low one.

**The scale is anchored, and 8 is the default for work with nothing wrong with it:**

| Score | Meaning |
|---|---|
| 10 | the critic would teach the reference standard using this, and can name no change that would improve it |
| 9 | the critic would approve it with no comment |
| 8 | the critic would approve it and leave one comment |
| 7 | the critic would ask for changes first |
| ≤6 | something is wrong, not merely improvable |

A node is finished when the critic **cannot name what would make it better** —
not when it stops finding defects. "Nothing broken" is an 8, and 8 is below the
bar. The counters under BOUNDARIES are safety valves for when that never
happens; hitting one is an escalation, not a finish.

| Dimension | What earns a low score |
|---|---|
| Correctness | the objective is not actually met, or an edge case in `design.md` is unhandled |
| Completeness | stubs, `TODO`s, hardcoded values, silently dead paths |
| Design fidelity | the builder quietly changed an interface or decision from `design.md` |
| Failure behavior | bad input, network failure, or empty state does something wrong or unclear |
| Codebase fit | reads like a foreign object next to the surrounding code |
| Test integrity | tests assert nothing, mock away the thing under test, or were weakened to pass |
| Reference comparison | falls short of the named reference standard, with the gap stated |

---

## BOUNDARIES

- Max iterations per node: **5**
- Max waves: **4**
- Stall rule: stop a node after **2** consecutive rounds with no score improvement
- Escalate to a human for: [auth, billing, data retention, anything irreversible]

**Never, under any framing:**

- commit secrets, keys, or `.env` contents
- drop or alter production schema, delete data, force-push, rewrite history
- deploy, or call a paid/external API not named in `design.md`
- disable, skip, or weaken a test to make the suite pass
- mark a node passed on the builder's own say-so

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

- [ ] T1 — [task] — tier: [gauntlet|review] — [why] — critic: __ /10
- [ ] T2 — [task] — tier: [gauntlet|review] — [why] — critic: __ /10
- [ ] T3 — [task] — tier: [gauntlet|review] — [why] — critic: __ /10

**Integration:** [ ] full verifier suite on the merged change — critic: __ /10

---

## OUT OF SCOPE

[Copied from the proposal's non-goals. The critic enforces these too: work
that appears here and got built anyway is scope creep, and it fails the node.]
