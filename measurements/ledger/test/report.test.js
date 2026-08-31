import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReport, formatReport } from '../src/report.js';

const EXPECTED_OUTPUT = `2026-01
  food: $67.47
  transport: $2.90
  Total: $70.37

2026-02
  food: $46.35
  housing: $1200.00
  Total: $1246.35

Grand total: $1316.72`;

test('buildReport + formatReport matches the pinned exact CLI output for the fixture rows', () => {
  // The 6 rows from fixtures/expenses.csv, reproduced field for field and built directly here
  // (not via parse.js), deliberately scrambled to prove buildReport sorts rather than relying
  // on input order.
  const rows = [
    { date: '2026-02-02', description: 'Rent', category: 'housing', amountCents: 120000 },
    { date: '2026-01-04', description: 'Coffee', category: 'food', amountCents: 435 },
    { date: '2026-02-11', description: 'Refund', category: 'food', amountCents: -1205 },
    { date: '2026-01-04', description: 'Bus fare', category: 'transport', amountCents: 290 },
    { date: '2026-01-17', description: 'Groceries', category: 'food', amountCents: 6312 },
    { date: '2026-02-09', description: 'Groceries', category: 'food', amountCents: 5840 },
  ];

  const report = buildReport(rows);

  assert.deepEqual(report, {
    months: [
      {
        month: '2026-01',
        categories: [
          { category: 'food', totalCents: 6747 },
          { category: 'transport', totalCents: 290 },
        ],
        totalCents: 7037,
      },
      {
        month: '2026-02',
        categories: [
          { category: 'food', totalCents: 4635 },
          { category: 'housing', totalCents: 120000 },
        ],
        totalCents: 124635,
      },
    ],
    grandTotalCents: 131672,
  });

  assert.equal(formatReport(report), EXPECTED_OUTPUT);
});

test('buildReport([]) returns an empty report', () => {
  assert.deepEqual(buildReport([]), { months: [], grandTotalCents: 0 });
});

test('formatReport of an empty report returns "No expenses."', () => {
  assert.equal(formatReport({ months: [], grandTotalCents: 0 }), 'No expenses.');
});
