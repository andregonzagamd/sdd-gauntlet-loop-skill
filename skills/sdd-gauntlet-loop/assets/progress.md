# progress.md

Append-only log of the loop. One event per line, newest last. **Never rewrite
history here** — a fresh session reads this file to learn what has already been
tried and what failed, and edited history makes it repeat those failures.

Format:

```
<ISO timestamp>  wave=<n>  node=<task>  iter=<n>  <VERDICT>  <score>  <detail>
```

Verdicts: `PLAN` · `PASS` · `FAIL` · `STALL` · `ESCALATE` · `INTEGRATE` · `ARCHIVE`

---

## Change: [change-id]

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

Material improvements a critic named in `TO REACH 10:` on a **review-tier** node
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
- **Verifiers:** [each command and its result]
- **Final critic:** [score per dimension]
- **Left undone:** [deliberate non-goals, and anything deferred]
- **Watch first if it breaks:** [where the risk actually lives]
