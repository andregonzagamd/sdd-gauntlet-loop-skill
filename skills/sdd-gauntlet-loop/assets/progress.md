# progress.md

Append-only log of the loop. One event per line, newest last. **Never rewrite
history here** — a fresh session reads this file to learn what has already been
tried and what failed, and edited history makes it repeat those failures.

Format:

```
<ISO timestamp>  <scope>  node=<task>  iter=<n>  <VERDICT>  open=<n>  <detail>
```

`<scope>` is `wave=<n>` for node events, and `phase=<n>` or `change=<id>` for the
events that belong to no wave — spec, contract, integrate, archive. `node=` and
`iter=` are omitted when they do not apply.

Verdicts: `PLAN` · `PASS-FINISHED` · `PASS-UNFINISHED` · `CONFIRM` · `FAIL` ·
`STALL` · `ESCALATE` · `BOUNDARY` · `INTEGRATE` · `ARCHIVE`

`open` is the count of `GAP` + `IMPROVEMENT` items the critic left on the node.
It is the number the stall rule watches: two consecutive rounds where it does not
fall, or where the same item is still open, is a stall.

`CONFIRM` is the second critic on a `gauntlet` node's `PASS-FINISHED`. Say which
model it was and that it was blind to the first — a confirmation nobody can tell
apart from a re-read is not a confirmation.

**Three things every line must let a stranger reconstruct**, because a clean-context
agent reading this file could not:

- **Who acted.** A re-work line names the builder, and says the critic was fresh.
- **What it points at on disk.** The `ARCHIVE` line carries the commit SHA. Without
  it the log floats free of the repository and cannot answer "is this still true?".
- **Who authorized a deviation.** A `BOUNDARY` resolved without a human goes in
  **both** the assumptions list below and the escalations table — a boundary that
  was crossed and left out of both reads, later, as though nobody noticed.

A mid-run edit to `contract.md` is itself an event. Log it, or the verdicts above
it were graded against rules nobody can reconstruct.

---

## Change: [change-id]

Fill this header in place — the append-only rule is about the **Log**, not about
the placeholders. A file whose top still reads like an unstarted template while a
finished change sits appended below is a file that lies to whoever opens it.

**Assumptions made without human approval** (unattended runs only):

- [none]

---

## Log

```
2026-01-01T00:00Z  wave=0  bootstrap   AGENTS.md, contract.md, progress.md ready
2026-01-01T00:00Z  wave=0  spec        specs/<change-id>/ generated, awaiting approval
```

---

## Polish queue

`IMPROVEMENT` items a critic named on a **review-tier** node
that passed. The node was done at defect-free; these were banked instead of
buying each one its own builder round. The integrator applies the whole queue in
one pass in Phase 4, and the final critic sees this list — so an item that
quietly disappeared is a gap, not a saving.

Nothing cosmetic belongs here. If it would not change behavior, failure, or
verification, it was a `NOTES` item and it never reached this queue.

| Node | Improvement named | Applied by integrator? |
|---|---|---|
| | | |

---

## Open escalations

| When | Node | Why it stopped | Decision needed from a human |
|---|---|---|---|
| | | | |

---

## Closing summary

Filled at archive time.

- **Built:** [one paragraph]
- **Commit:** [the SHA this summary describes]
- **Verifiers:** [each command and its result]
- **Final critic:** [how each dimension was closed, and the evidence for each `CLEAR`]
- **Left undone:** [deliberate non-goals, and anything deferred]
- **Watch first if it breaks:** [where the risk actually lives]
