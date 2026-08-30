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

- [ ] T1 — [task] — critic: __ /10
- [ ] T2 — [task] — critic: __ /10
- [ ] T3 — [task] — critic: __ /10

**Integration:** [ ] full verifier suite on the merged change — critic: __ /10

---

## OUT OF SCOPE

[Copied from the proposal's non-goals. The critic enforces these too: work
that appears here and got built anyway is scope creep, and it fails the node.]
