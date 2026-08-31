# Tasks — ledger-core

- [x] T1 — implement `money.js#parseAmountToCents` and `money.js#centsToDisplay`
      files: src/money.js, test/money.test.js
      depends: none
      done when: `node --test test/money.test.js` passes, and it includes a test for each of:
      `parseAmountToCents("4.35") === 435`, `parseAmountToCents("-12.05") === -1205`,
      `parseAmountToCents("1200.00") === 120000`, `parseAmountToCents("4.3")` throws,
      `parseAmountToCents("4.355")` throws, `parseAmountToCents("abc")` throws,
      `centsToDisplay(435) === "4.35"`, `centsToDisplay(-1205) === "-12.05"`,
      `centsToDisplay(120000) === "1200.00"`, `centsToDisplay(0) === "0.00"`,
      `centsToDisplay(1.5)` throws.

- [x] T2 — implement `parse.js#parseCsv`
      files: src/parse.js, test/parse.test.js
      depends: T1
      done when: `node --test test/parse.test.js` passes, and it includes a test for each of:
      parsing `fixtures/expenses.csv` returns 6 rows in file order with the exact field values
      from the CSV (including `amountCents: -1205` for the refund row), a bad header throws, a
      row with 3 fields throws with a message containing the correct line number, a row with an
      invalid date throws, a row with an empty `description` throws, a row with an invalid
      `amount` throws with a message that includes the line number, and a trailing blank line at
      end of file does not throw and does not appear as a row.

- [x] T3 — implement `report.js#buildReport` and `report.js#formatReport`
      files: src/report.js, test/report.test.js
      depends: T1
      done when: `node --test test/report.test.js` passes, and it includes a test that feeds
      `buildReport` the exact 6-row array parsed from `fixtures/expenses.csv` (rows constructed
      directly in the test, not via `parse.js`) and asserts `formatReport(buildReport(rows))`
      equals character-for-character the block pinned under **Exact CLI output** in
      `specs/ledger-core/design.md` (without the trailing newline `cli.js` adds), plus a test
      that `buildReport([])` returns `{ months: [], grandTotalCents: 0 }` and
      `formatReport({ months: [], grandTotalCents: 0 })` returns `"No expenses."`.

- [x] T4 — implement `cli.js` entry point
      files: src/cli.js, test/cli.test.js
      depends: T1, T2, T3
      done when: `node --test test/cli.test.js` passes and includes a test that spawns
      `node src/cli.js fixtures/expenses.csv` (e.g. via `node:child_process`'s
      `execFileSync`) and asserts stdout equals character-for-character the block pinned under
      **Exact CLI output** in `specs/ledger-core/design.md` plus one trailing newline, exit code
      0; a test that running with no argument exits non-zero and writes to stderr; and a test
      that running against a nonexistent file path exits non-zero and writes to stderr. In
      addition, `npm run check`, `npm test`, and `npm run smoke` all exit 0 from the repo root,
      and `npm run smoke`'s stdout matches the same pinned block plus trailing newline.
