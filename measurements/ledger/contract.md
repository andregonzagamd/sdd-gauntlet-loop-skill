# Contract — ledger-core

Derived from `specs/ledger-core/design.md` and `tasks.md`. This is the only document both
builders and critics read. A requirement that is not here will not be enforced by any critic
and therefore will not exist in the finished product.

## OBJECTIVE

`node src/cli.js fixtures/expenses.csv` reads the six-row fixture, groups its rows by month and
then by category, and prints to stdout the exact block pinned under **Exact CLI output** in
`specs/ledger-core/design.md` followed by exactly one newline, exiting 0. Every monetary value
in the system is an integer number of cents from the moment it leaves the CSV text until the
moment it is formatted for display; no floating-point arithmetic is performed on money anywhere.
Invalid input — a missing argument, an unreadable file, a bad header, a malformed row — produces
a message on stderr naming the problem and the offending 1-indexed line number where applicable,
and a non-zero exit code, never a partial report and never `NaN`.

## VERIFIERS

Every one of these is a command with an exit code, run from the repository root. All three
exited **1** before any work started, so a 0 is real signal and not an empty suite passing.

```bash
npm run check   # node --check on all four src files — syntax gate
npm test        # node --test test/ — full suite; also fails if zero tests run
npm run smoke   # node src/cli.js fixtures/expenses.csv — end-to-end, must exit 0
```

Plus one output assertion that no exit code can express, which a critic must check by running
the command and comparing text:

```bash
npm run smoke   # stdout must equal, character for character, the block pinned under
                # "Exact CLI output" in specs/ledger-core/design.md, plus one trailing newline
```

Per-node, a node is only verifiable when its own test file runs and passes:

| Node | Command |
|---|---|
| T1 | `node --test test/money.test.js` |
| T2 | `node --test test/parse.test.js` |
| T3 | `node --test test/report.test.js` |
| T4 | `node --test test/cli.test.js` + all three repo-root verifiers above |

## CRITIC RUBRIC

Bar: **8.5/10 on every dimension.** A strong average does not rescue a weak dimension.

Reference standard: **the Node.js core library's own `lib/internal` modules** — plain ES
modules, no dependencies, explicit argument validation that throws `Error` with a precise
message naming the bad value, and tests written with `node:test` + `node:assert/strict` that
assert exact values rather than shapes.

| Dimension | What it scores |
|---|---|
| Correctness | Does it produce the values the design pins — including the negative-amount row, the month/category sort order, and the exact whitespace? Check the arithmetic by hand against the derivation in `design.md`, do not trust that a passing test proves it. |
| Money discipline | **Score this first.** Any `parseFloat`, `Number(x)` on a dollar string, `* 100`, `/ 100`, `toFixed`, or float arithmetic on an amount is an automatic FAIL for this dimension regardless of whether tests pass. Cents in, cents out, integers only. |
| Completeness | Any stub, `TODO`, hardcoded expected value standing in for real logic, or error branch that cannot actually be reached? |
| Fidelity to the design | Did the builder quietly change a function signature, an error message string, a sort order, or the Row/Report shape? Those are the seams four independent builders rely on; drift here is invisible per-node and fatal at integration. |
| Failure behavior | Does every error path named in the design's Interfaces section exist, throw the exact message specified, and have a test that triggers it? A path with no test is unverified. |
| Test honesty | Does any test assert nothing, assert against a value copied out of the implementation rather than the design, mock away the thing under test, or use `skip`/`only`? Held next to the reference standard: does it assert exact values? |

## BOUNDARIES

- Max iterations per node: **5**
- Max waves: **4**
- Stall rule: stop a node after **2 consecutive rounds with no score improvement** and escalate.
- **Never add a dependency.** Not a CSV library, not a formatter, not a test framework. Zero
  runtime and zero dev dependencies is a hard rule from `AGENTS.md`; a task that appears to need
  one is a wrong task and must be escalated, not satisfied by installing something.
- **Never do float arithmetic on money.** See the rubric dimension above.
- **Never edit `fixtures/expenses.csv`.** It is the input contract. If the code disagrees with
  the fixture, the code is wrong.
- **Never edit `package.json`.** The three verifier scripts are fixed; a node that changes them
  is changing its own exam.
- **Never disable, skip, or weaken a test** to make the suite green.
- **Never touch a file outside the node's declared `files:` list.** If a node believes it must,
  it stops and reports why.
- **No network calls and no environment variables.** This CLI is offline and pure.
- Escalate to the human: any need to change `design.md`, the pinned stdout block, or this
  contract.
