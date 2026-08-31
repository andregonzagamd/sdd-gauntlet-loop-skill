# Proposal — ledger-core

## Problem

`ledger` has no implementation. `src/` and `test/` are empty. There is a stack decision
(`AGENTS.md`), a fixture (`fixtures/expenses.csv`) and three verifier scripts already wired in
`package.json` (`npm test`, `npm run check`, `npm run smoke`), but nothing they can run against
yet — `npm run check` fails today because `src/parse.js`, `src/money.js`, `src/report.js` and
`src/cli.js` do not exist.

## Motivation

This is the first build of the product. Without it there is no offline way to turn a CSV of
expenses into a per-month, per-category report — the single thing this CLI exists to do. Building
it now, as four small modules with pinned interfaces, lets four builders work in parallel instead
of one builder working serially through the whole thing.

## Scope

- In:
  - `src/parse.js` — parse CSV text into row records, reject malformed rows with a line number.
  - `src/money.js` — string-to-cents and cents-to-string conversions, integer-only arithmetic.
  - `src/report.js` — group parsed rows by month then category, produce the exact report text.
  - `src/cli.js` — read a file path argument, wire the three modules together, print to stdout,
    set exit codes.
  - `test/parse.test.js`, `test/money.test.js`, `test/report.test.js`, `test/cli.test.js` — one
    test file per module, covering the error paths named in `design.md`.
- Out:
  - Any output format other than plain text to stdout (no JSON, no CSV export, no color).
  - Reading more than one input file, reading from stdin, or any flag/option parsing beyond a
    single positional file path argument.
  - Any currency other than the fixture's implicit single currency — no currency symbol
    detection, no multi-currency totals.
  - Any persistence, caching, config file, or network call.
  - Any dependency, runtime or dev. Zero stays zero.
  - Editing `fixtures/expenses.csv` to make anything pass.

## Success looks like

Running `npm run check`, `npm test` and `npm run smoke` all exit 0 on a clean checkout with
nothing installed but Node. A person with the fixture and no knowledge of the code can run
`node src/cli.js fixtures/expenses.csv`, see two months of spending broken down by category with
correct dollar-and-cent totals (including the one refund row), and check the arithmetic on a
calculator by hand.

## Risks

- The four module interfaces are the seams between four builders who will not see each other's
  code. If a signature, an error shape, or the exact report text is left ambiguous in
  `design.md`, each builder will invent its own version and `npm test` / `npm run smoke` will
  fail at integration even though every module passes in isolation.
- Money handled as cents everywhere is a discipline that only one file's mistake can break —
  the string-to-cents and cents-to-string boundary must be in exactly one module (`money.js`),
  or float error will creep back in wherever a builder is tempted to shortcut it.
- The negative amount in the fixture (a refund) must not be special-cased; it has to fall out of
  ordinary signed-integer-cent arithmetic, or it will be silently dropped or mis-summed.
