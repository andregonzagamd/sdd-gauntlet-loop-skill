# Design — ledger-core

## Architecture

Straight-line pipeline, no shared mutable state, no classes (per `AGENTS.md` naming rule — there
are none):

```
cli.js
  reads process.argv[2] as a file path
  reads the file with fs.readFileSync(path, 'utf8')
    -> on ENOENT / read error: print "Error: cannot read file <path>" to stderr, exit 1
  passes the raw text to parse.js#parseCsv
    -> on ParseError: print "Error: <message>" to stderr, exit 1
  passes the returned rows to report.js#buildReport
  passes the returned Report to report.js#formatReport
  prints the returned string to stdout with a single trailing newline, exit 0
```

`money.js` has no dependency on the other three modules; `parse.js` depends only on `money.js`
(to convert the amount field to cents at the parse boundary); `report.js` depends only on the
row shape produced by `parse.js` (not on `parse.js` itself, and not on `money.js`'s string
parsing — only on its cents-to-string formatting); `cli.js` depends on all three.

The **string ↔ cents boundary is exactly two functions in `money.js`**. No other module ever
does string math on a dollar amount, and no other module ever does floating-point arithmetic on
money. `parse.js` calls `money.js#parseAmountToCents` once per row, at the edge, and from then
on every amount in the system is an integer number of cents. `report.js` calls
`money.js#centsToDisplay` once per number, only when producing the final display string.

## Data model

### Row (produced by `parse.js`, consumed by `report.js`)

Plain object, one per valid CSV data row:

```
{
  date: string,        // exactly as it appears in the CSV, e.g. "2026-01-04" (YYYY-MM-DD)
  description: string,  // exactly as it appears in the CSV, unescaped
  category: string,     // exactly as it appears in the CSV, lowercase in the fixture but not
                         // normalized by parse.js — used as-is as the grouping key
  amountCents: number   // integer, may be negative, produced by money.js#parseAmountToCents
}
```

`parse.js#parseCsv` returns `Row[]` (a plain array, in the same order as the input rows).

### Report (produced by `report.js#buildReport`, consumed by `report.js#formatReport`)

```
{
  months: [
    {
      month: string,           // "YYYY-MM", taken from the first 7 characters of Row.date
      categories: [
        { category: string, totalCents: number }   // sorted by category, ascending, string sort
      ],
      totalCents: number        // sum of every Row.amountCents whose date falls in this month
    }
  ],                             // sorted by month, ascending, string sort
  grandTotalCents: number        // sum of every Row.amountCents in the report
}
```

Grouping key for month is `Row.date.slice(0, 7)`. No calendar library, no date parsing beyond
that string slice — the fixture's dates are always `YYYY-MM-DD` and `parse.js` is responsible for
rejecting anything that is not that shape (see Interfaces below).

## Interfaces

### `src/money.js`

```js
export function parseAmountToCents(raw)
```
- `raw`: `string`, the exact `amount` field text from one CSV row (e.g. `"4.35"`, `"-12.05"`,
  `"1200.00"`).
- Returns: `number`, integer cents (e.g. `435`, `-1205`, `120000`).
- Accepts an optional leading `-`, one or more digits, a literal `.`, and exactly two digits
  after the `.` — i.e. matches `/^-?\d+\.\d{2}$/`. Nothing else is valid input (no `$`, no
  thousands separators, no scientific notation, no more or fewer than two decimal places).
- Throws `Error` (message: `` `invalid amount: "${raw}"` ``) if `raw` does not match that shape.
  Computes cents by splitting on `.` and doing integer arithmetic — never `parseFloat` /
  `Number()` on the whole string, and never multiplies a float by 100.

```js
export function centsToDisplay(cents)
```
- `cents`: `number`, integer (may be negative or zero).
- Returns: `string`, always two decimal places, no thousands separator, no currency symbol,
  minus sign directly before the digits for negative values. Examples: `120000` → `"1200.00"`,
  `435` → `"4.35"`, `-1205` → `"-12.05"`, `0` → `"0.00"`.
- Throws `Error` (message: `` `not an integer: ${cents}` ``) if `cents` is not an integer
  (`Number.isInteger(cents) === false`), including if it is `NaN` or a non-finite float.

### `src/parse.js`

```js
export function parseCsv(text)
```
- `text`: `string`, the full contents of the CSV file including the header row, as read by
  `fs.readFileSync(path, 'utf8')`.
- Returns: `Row[]` as defined in **Data model**, one entry per non-empty, non-header line, in
  file order.
- Header row: the first non-empty line must be exactly
  `date,description,category,amount` (no other column order or names is accepted).
  Throws `Error` (message: `` `invalid header, expected "date,description,category,amount", got "${line}"` ``)
  if it does not match.
- Each subsequent non-empty line is split on `,` into exactly 4 fields. No quoted-field or
  embedded-comma handling — the fixture has none and none is in scope.
  - Line numbers are 1-indexed against the raw input (the header is line 1).
  - Wrong field count: throws `Error` (message:
    `` `line ${n}: expected 4 fields, got ${count}` ``).
  - `date` field must match `/^\d{4}-\d{2}-\d{2}$/`: throws `Error` (message:
    `` `line ${n}: invalid date "${date}"` ``) otherwise.
  - `description` and `category` must be non-empty after no trimming beyond the split (i.e.
    an empty string between two commas is invalid): throws `Error` (message:
    `` `line ${n}: empty ${fieldName}` ``) otherwise.
  - `amount` field is passed to `money.js#parseAmountToCents`. If that throws, `parseCsv`
    re-throws a new `Error` with message `` `line ${n}: ${originalError.message}` ``.
- Blank lines (empty string after trimming trailing `\r`/whitespace) anywhere in the file,
  including a trailing one at end of file, are skipped and do not count toward field validation,
  but they are still counted when computing line numbers for every subsequent line.
- Every thrown error is a plain `Error` (not a custom class) — `cli.js` only reads `.message`.

### `src/report.js`

```js
export function buildReport(rows)
```
- `rows`: `Row[]`, as returned by `parse.js#parseCsv`. `report.js` does not import `parse.js` or
  validate row shape beyond what's used — it trusts the shape.
- Returns: `Report` as defined in **Data model**.
- Empty input (`rows.length === 0`) returns `{ months: [], grandTotalCents: 0 }` — not an error.

```js
export function formatReport(report)
```
- `report`: `Report`, as returned by `buildReport`.
- Returns: `string`, the exact display text (see **Exact CLI output** below), **without** a
  trailing newline — `cli.js` is responsible for the one trailing newline on stdout.
- Uses `money.js#centsToDisplay` for every number, prefixed with a literal `$`.
- If `report.months.length === 0`, returns the single line `"No expenses."` (no grand total
  line, no trailing blank line).

### `src/cli.js`

- No named exports required (it is the entry point); may export functions for its own tests
  (e.g. `export function run(argv)`) at the builder's discretion, but the process behavior below
  is the contract:
- `process.argv[2]` missing: print `"Usage: ledger <path-to-csv>"` to stderr, exit 1.
- File unreadable (`fs.readFileSync` throws): print `` `Error: cannot read file "${path}"` `` to
  stderr, exit 1.
- `parseCsv` or `buildReport` throws: print `` `Error: ${err.message}` `` to stderr, exit 1.
- Success: print `formatReport(buildReport(parseCsv(text))) + '\n'` to stdout, exit 0 (the
  process's natural exit code — do not call `process.exit(0)` unless needed to flush; do not
  call `process.exit` at all on the success path unless the runtime requires it).

## Exact CLI output

Running `node src/cli.js fixtures/expenses.csv` must print exactly the following to stdout
(shown between the markers, markers not included; every line has no trailing whitespace, and
there is exactly one trailing newline at the very end of the whole output):

```
2026-01
  food: $67.47
  transport: $2.90
  Total: $70.37

2026-02
  food: $46.35
  housing: $1200.00
  Total: $1246.35

Grand total: $1316.72
```

Derivation, for the critic to check the builders' arithmetic against:
- 2026-01 food: `435 + 6312 = 6747` → `$67.47`. transport: `290` → `$2.90`. Month total:
  `6747 + 290 = 7037` → `$70.37`.
- 2026-02 food: `5840 + (-1205) = 4635` → `$46.35` (this is the fixture's negative-amount row).
  housing: `120000` → `$1200.00`. Month total: `4635 + 120000 = 124635` → `$1246.35`.
- Grand total: `7037 + 124635 = 131672` → `$1316.72`.

Category lines within a month are sorted ascending by category name (`food` before `transport`
in January, `food` before `housing` in February — both already alphabetical, this is called out
so no builder assumes insertion order). Months are sorted ascending by `"YYYY-MM"` string. There
is exactly one blank line between each month block and the next, and exactly one blank line
between the last month block and the `Grand total:` line — see the fixture block above, which is
the literal expected `npm run smoke` output.

## Dependencies

None added. Zero runtime, zero dev, per `AGENTS.md`. Test runner is `node:test`, assertions are
`node:assert/strict`, both built into Node 24.

## Alternatives rejected

- **A single `src/index.js` doing everything.** Rejected because the request explicitly asked
  for four separate modules, and `package.json#check` already names all four files.
- **A `Money` class wrapping cents.** Rejected — `AGENTS.md` conventions say there are no
  classes in this codebase (`PascalCase for nothing`), and a plain integer is sufficient and
  keeps `report.js` from needing to import a type from `money.js`.
- **`Intl.NumberFormat` for display formatting.** Rejected — pulls in locale/currency behavior
  (thousands separators, locale-dependent decimal points) that is not pinned by the fixture and
  would make the exact stdout string environment-dependent. Manual integer-cents formatting in
  `money.js#centsToDisplay` is fully deterministic.
- **CSV parsing via `String.split('\n')` + a real CSV-parsing library.** Rejected — zero
  dependencies is a hard rule, and the fixture has no quoted fields or embedded commas, so a
  4-field comma split is sufficient and in scope.
- **Grouping report data in a `Map`/object keyed by month+category instead of the nested array
  shape above.** Rejected for the *interface* (internal implementation may still use a `Map`) —
  the nested array shape is what's pinned so `formatReport`'s sort order is unambiguous to a
  builder who only reads this document.

## Open questions

None. Every ambiguity a builder could hit (error message text, sort order, whitespace, the empty
report case, the negative-amount case) is pinned above.
