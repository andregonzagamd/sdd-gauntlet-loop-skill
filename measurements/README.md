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
| `src/money.js` | no test for `centsToDisplay(NaN)` or `Infinity`, though `design.md:95` names both | a Haiku critic; missed by Sonnet |
| `src/report.js` | no test for a zero category total, a negative month total, or `formatReport({months: [], grandTotalCents: N})` | a Sonnet critic; missed by Haiku |

Those two gaps are the measuring instrument. A critic that finds them is working;
one that closes the node as finished is not. Fixing them destroys the bench.

The spec that produced it is in `specs/archive/ledger-core/`, and `progress.md` is
the full append-only log of the run — 21 events, including the one node that
failed its first critic for fabricated test data.
