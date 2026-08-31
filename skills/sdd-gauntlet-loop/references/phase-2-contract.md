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

**There is no score.** The rubric names the dimensions; the critic closes each one
in a state, and the verdict is computed from the states.

### Why the number had to go

The rubric used to be scored 0–10 against a bar of 8.5. Measured on a real run, it
decided nothing: a defect crashed the number to 5 and its absence floated it to 9
or 10, so the bar never bound. Anchoring the scale — writing "defect-free work is
an 8" into the contract and the critic — did not help either; critics read the
anchors and still returned 9 for defect-free work, twice.

The reason is structural, not a prompting failure. A score is produced *after* the
analysis, as a label on a conclusion already reached, and 9 is the position of
least resistance: 8 reads as criticism you must justify, 10 as a claim you must
defend. More basically, a score asks the critic to **summarize**, and summarizing
is the one thing a critic must never do. Everything valuable it produced on that
run was specific — `file:line`, an exit code, a probe, a named missing test. The
one thing that was not specific was the number, and it was the only useless thing
in the output.

### The three states

Each dimension in the rubric closes as exactly one of:

| State | What the critic writes |
|---|---|
| **GAP** | the defect, with `file:line`, and what would fix it |
| **IMPROVEMENT** | the material change that is missing, with `file:line` |
| **CLEAR** | *how it knows* — the command and exit code, the probe and its result, or the two things compared and where |

`CLEAR` is the load-bearing one. "I found nothing wrong here" is a feeling, and a
dimension closed on a feeling is unverified. Requiring the evidence that closes
the question turns *"unverified is not a pass"* from an exhortation into a shape
the critic has to fill. If the evidence cannot be produced, the dimension is not
`CLEAR` — it is an `IMPROVEMENT` naming the check nobody can currently run.

The verdict falls out mechanically:

```
any GAP              -> FAIL
else any IMPROVEMENT -> PASS, node not finished
else all CLEAR       -> PASS, node finished
```

### Materiality keeps `IMPROVEMENT` finite

An `IMPROVEMENT` must alter how the code **behaves**, how it **fails**, or how it
is **verified**. Naming, structure, file layout, comments and taste are `NOTES`
and never hold a node open. Without that limit there is always one more nitpick,
no node ever finishes, and the iteration cap becomes the real brake — the failure
this whole design exists to avoid.

### Tier every node before there is code to defend

Iterating toward impressive costs a builder round plus a fresh critic per extra
iteration. Paying that on a 35-line entry point buys nothing. So the contract's
task checklist assigns each node a tier:

- **gauntlet** — carries the change's real risk. Iterates until the critic can
  name nothing material.
- **review** — glue, wiring, config, scaffolding. Done at defect-free; its
  `IMPROVEMENT` items go to the polish queue in `progress.md` and are applied by
  the integrator in Phase 4, which runs anyway.

Both tiers get a clean-context critic, the full verifiers, and a `file:line`
verdict. A review-tier node is a real code review; it is simply not asked to
become excellent.

Assign by risk, never by size, and write the reason next to the tier. Two rules
keep this honest: it is decided in Phase 2, before any code exists to protect,
and **if every node is gauntlet, nothing is** — you have made the loop expensive
without aiming it.

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
- Stall rule: stop a node after 2 consecutive rounds where OPEN did not fall,
  or where the same item is still open
- Never: commit secrets, .env contents, or keys
- Never: drop/alter production schema, delete data, force-push, rewrite history
- Never: deploy, or call a paid/external API not named in design.md
- Never: disable, skip, or weaken a test to make the suite pass
- Escalate to human: any change to auth, billing, or data retention
```

The boundaries exist so the loop can run unattended. An unbounded loop is not autonomous, it is unsupervised.

## Template

The fill-in-the-blanks version lives in `../assets/contract.md`.
