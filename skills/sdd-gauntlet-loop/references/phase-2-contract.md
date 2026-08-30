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

### Run every verifier before you write it down, and record that it was red

"A command with an exit code" is not a high enough bar. A command that exits 1 no
matter what the code does is also a command with an exit code, and it will hold
the whole loop hostage: builders will keep failing a gate that was never theirs
to pass, and the node that finally hits it will be the one blamed.

So before a command goes into VERIFIERS, run it **now, against the unbuilt
repo**, and write the exit code you saw into the contract:

```
All three exited 1 before any work started, so a 0 later is real signal
and not an empty suite trivially passing.
```

That line does two jobs. It proves the verifier can discriminate — it is capable
of failing, so its passing means something. And it dates the baseline, so when a
verifier turns out to be broken mid-run, you can tell a scaffold defect that was
always there from a regression a builder introduced. A verifier that is already
green before anything is built is worse than useless: it is a gate that will
never catch anything, and it must be replaced, not kept for comfort.

**Tests are written before or alongside the code, by the builder, and are themselves subject to critique.** A critic that finds a test asserting `expect(true).toBe(true)`, a mocked-away core path, or a `skip` added to make the suite green must fail the node regardless of the exit code.

## Writing the rubric

Score 0–10 on each dimension, with the bar the node must clear. Default bar: 8.5.

### Anchor the scale, or the top of it collapses

An unanchored 0–10 is not a scale, it is a mood. Left to itself a critic scores
bimodally — a defect crashes the number to 5, and its absence floats it to 9 or
10 — so the bar never binds, and the loop exits on the first clean pass. That is
"iterate until nobody finds a bug", which is a much lower bar than the one this
technique is named after.

Put the anchors in the contract, and make the top expensive:

| Score | Meaning |
|---|---|
| 10 | you would teach the reference standard using this, and can name no change that would improve it |
| 9 | you would approve it with no comment |
| 8 | you would approve it and leave one comment |
| 7 | you would ask for changes first |
| ≤6 | something is wrong, not merely improvable |

**8 is where competent, defect-free work lands** — and 8 is below the bar. That
is deliberate. It forces the second iteration that a bimodal scale skips, and
the second iteration is where the technique earns its cost.

Pair the anchors with the critic's `TO REACH 10:` obligation: for every
dimension not scored 10, name the one change that would get it there. A critic
that can still name something is not impressed, and a node whose critic is not
impressed is not finished. When the critic can name nothing, the loop is done —
that, not the iteration counter, is the brake.

Dimensions worth scoring, chosen to fit the change:

- **Correctness** — does it do what the objective says, including the edge cases named in the design?
- **Completeness** — any stub, `TODO`, hardcoded value, or path that silently does nothing?
- **Fidelity to the design** — did the builder quietly redesign something mid-build?
- **Failure behavior** — what happens on bad input, network failure, empty state?
- **Fit with the codebase** — does this look like it was written by whoever wrote the rest?
- **Reference comparison** — held next to `<named standard>`, where does it fall short?

Name the reference standard explicitly. "Good UI" is unscoreable; "the density and hierarchy of Linear's issue list" is scoreable.

### Prohibit the behavior, never the token

A rubric line like *"any `* 100` is an automatic FAIL"* reads as admirably strict
and is a trap. Critics pattern-match on it, and a correct implementation that
happens to contain those characters — integer arithmetic on two already-split
integer substrings, say — gets failed for the shape of its source text while a
genuinely broken one that spells the same bug differently sails through.

Write the rule as the property that must hold, then offer the tokens as a place
to start looking:

> No floating-point arithmetic is ever performed on a monetary amount. Values are
> integer cents from the moment they leave the input text until the moment they
> are formatted for display. `parseFloat`, `Number()` on a whole amount string,
> `toFixed`, `* 100` and `/ 100` are where this usually goes wrong — judge each
> occurrence by what it actually operates on, not by the characters.

The same applies to every "automatic FAIL" you are tempted to write. State the
property; let the critic do the judging. That is what you dispatched it for.

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
