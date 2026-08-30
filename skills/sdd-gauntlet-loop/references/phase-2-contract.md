# Phase 2 — The contract

`contract.md` is the only thing both builders and critics read. If a requirement is not in the contract, no critic will enforce it, and it will not exist in the final product.

## Deriving it

| Source | Becomes |
|---|---|
| `proposal.md` → Success looks like | OBJECTIVE |
| `design.md` → Interfaces, Data model | VERIFIERS (tests that assert them) |
| `design.md` → the quality reference | CRITIC RUBRIC |
| `AGENTS.md` → golden rules | BOUNDARIES |
| `tasks.md` → done-when clauses | the per-node checklist |

## Writing verifiers

A verifier is a command with an exit code. Not a wish.

```
Good:  pnpm test src/api/auth.test.ts     (exits 0)
Good:  pnpm typecheck                      (exits 0)
Good:  curl -s localhost:3000/health | jq -e '.status == "ok"'
Bad:   "the API should be fast"
Bad:   "code should be clean"
```

If a requirement genuinely cannot be turned into a command — visual design, copy tone, API ergonomics — it does not go in VERIFIERS. It goes in the CRITIC RUBRIC with a named reference standard to compare against, so the critic has something concrete to hold it next to.

**Tests are written before or alongside the code, by the builder, and are themselves subject to critique.** A critic that finds a test asserting `expect(true).toBe(true)`, a mocked-away core path, or a `skip` added to make the suite green must fail the node regardless of the exit code.

## Writing the rubric

Score 0–10 on each dimension, with the bar the node must clear. Default bar: 8.5.

Dimensions worth scoring, chosen to fit the change:

- **Correctness** — does it do what the objective says, including the edge cases named in the design?
- **Completeness** — any stub, `TODO`, hardcoded value, or path that silently does nothing?
- **Fidelity to the design** — did the builder quietly redesign something mid-build?
- **Failure behavior** — what happens on bad input, network failure, empty state?
- **Fit with the codebase** — does this look like it was written by whoever wrote the rest?
- **Reference comparison** — held next to `<named standard>`, where does it fall short?

Name the reference standard explicitly. "Good UI" is unscoreable; "the density and hierarchy of Linear's issue list" is scoreable.

## Writing boundaries

```markdown
## BOUNDARIES
- Max iterations per node: 5
- Max waves: 4
- Stall rule: stop a node after 2 consecutive rounds with no score improvement
- Never: commit secrets, .env contents, or keys
- Never: drop/alter production schema, delete data, force-push, rewrite history
- Never: deploy, or call a paid/external API not named in design.md
- Never: disable, skip, or weaken a test to make the suite pass
- Escalate to human: any change to auth, billing, or data retention
```

The boundaries exist so the loop can run unattended. An unbounded loop is not autonomous, it is unsupervised.

## Template

The fill-in-the-blanks version lives in `../assets/contract.md`.
