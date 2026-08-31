# measurements/

Frozen targets for measuring the skill. Not part of the skill, and not shipped by
`install.sh` — this is the bench.

## ledger/

A 430-line offline CLI: reads a CSV of expenses, prints a report by month and
category. Built end to end by the pipeline on 2026-08-30 and then used as the
target for every measurement recorded in `CLAUDE.md`.

It earns its place in this repo because a skill whose product is instructions has
no other way to be tested. Every claim in `CLAUDE.md` about how the critics behave
was produced here, and the open experiments need the same target or they are not
comparable.

**Why this target.** Zero dependencies — the test runner is `node --test`, built
into Node — so it runs on a clean machine with nothing installed. And all three
verifiers exited **1** before any code was written, so a 0 is real signal rather
than an empty suite passing.

```bash
cd measurements/ledger
npm run check   # node --check on all four src files
npm test        # 26 tests
npm run smoke   # end-to-end against fixtures/expenses.csv
```

All three should exit 0.

**Do not "improve" this code.** Its value is that it is exactly what the pipeline
produced, warts included. The two known warts are the point:

| Node | What is missing | Found by |
|---|---|---|
| `src/money.js` | no test for `centsToDisplay(NaN)` or `Infinity`, though `design.md:95` names both | Haiku/magro ✓ · Sonnet/longo ✗ · Sonnet/template ✓ · Haiku/template ✓ |
| `src/report.js` | no test for a zero category total, a negative month total, or `formatReport({months: [], grandTotalCents: N})` | Sonnet/longo ✓ · Haiku/magro ✗ · Sonnet/template ✗ · Haiku/template ✗ · Sonnet/1b ✓✓✗ · Gemini/1b refinado ✓✓✗ · **Gemini/produto completo ✓✓✓** |

Those two gaps are the measuring instrument. A critic that finds them is working;
one that closes the node as finished is not. Fixing them destroys the bench.

Four critics in, **no single one has found both.** Read the rows sideways and the
bench has already answered two design questions:

- The `money.js` row flips with the **prompt**, not the model: the thin prompt and
  the full template find it, the long ad-hoc one did not. The `report.js` item has
  been found exactly once, by the one prompt whose probe list differed — never by a
  different model running the same probes. That killed the first version of decision
  #11 ("same prompt, cheaper model"), which found zero new items across both nodes.
- The critic dispatched with the full template **ran** the `report.js` gap, saw
  correct behavior and closed the node on it. Hence the rule that a critic's own
  probe is not coverage.

The `report.js` item is also the reason generator 1b exists: its cases are implied
by a pinned value domain ("may be negative") rather than named as cases, so the
design-versus-`done when` crossing walks past them. Generator 1b was then run on
this node — **same model, same contract, same task, only the probe list changed** —
and flipped it from finished to open, which is the cleanest evidence in the whole
series that the probe list, not the model, is what a second critic has to vary.

It also found two states nobody had listed (a negative grand total; categories
differing only in case, which `design.md:57` leaves unqualified under "string
sort"), and still missed the third bench item.

**That third item survived six critics, and the seventh closed it.** It is one
corner of the `months` × `grandTotalCents` product: `done when` covers
`(empty, zero)`, the fixture covers `(non-empty, non-zero)`, and *two* corners are
left. The generator's refined form crossed the right pair of fields and stopped at
the other leftover corner. Its final form — write every corner of every shape and
mark it covered / impossible / uncovered **before** probing any, with a
combination no producer emits still counted as reachable through any **exported**
function that accepts the shape — reached it on the first pass, on Gemini 3.1 Pro,
in a fresh agent with no part of this skill installed.

**What it cost is now part of what this bench measures.** That exhaustive pass
returned **19 open items on a 47-line module** — the three real ones, a few more
worth having, and a long tail of corners that take the same branches with
different numbers. Enumerating exhaustively is what finds the item; reporting
exhaustively is what stops a node from ever finishing. If you run a critic here,
that trade-off is the thing to watch.

The spec that produced it is in `specs/archive/ledger-core/`, and `progress.md` is
the full append-only log of the run — 21 events, including the one node that
failed its first critic for fabricated test data.
