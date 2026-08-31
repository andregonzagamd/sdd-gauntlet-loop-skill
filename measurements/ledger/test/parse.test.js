import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseCsv } from '../src/parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, '..', 'fixtures', 'expenses.csv');

test('parses fixtures/expenses.csv into 6 rows in file order with exact field values', () => {
  const text = readFileSync(fixturePath, 'utf8');
  const rows = parseCsv(text);
  assert.equal(rows.length, 6);
  assert.deepEqual(rows, [
    { date: '2026-01-04', description: 'Coffee', category: 'food', amountCents: 435 },
    { date: '2026-01-04', description: 'Bus fare', category: 'transport', amountCents: 290 },
    { date: '2026-01-17', description: 'Groceries', category: 'food', amountCents: 6312 },
    { date: '2026-02-02', description: 'Rent', category: 'housing', amountCents: 120000 },
    { date: '2026-02-09', description: 'Groceries', category: 'food', amountCents: 5840 },
    { date: '2026-02-11', description: 'Refund', category: 'food', amountCents: -1205 },
  ]);
});

test('a bad header throws', () => {
  const text = 'date,description,category\n2026-01-04,Coffee,food,4.35\n';
  assert.throws(
    () => parseCsv(text),
    { message: 'invalid header, expected "date,description,category,amount", got "date,description,category"' }
  );
});

test('a row with 3 fields throws with a message containing the correct line number', () => {
  const text = 'date,description,category,amount\n2026-01-04,Coffee,food\n';
  assert.throws(
    () => parseCsv(text),
    { message: 'line 2: expected 4 fields, got 3' }
  );
});

test('a row with an invalid date throws', () => {
  const text = 'date,description,category,amount\n2026/01/04,Coffee,food,4.35\n';
  assert.throws(
    () => parseCsv(text),
    { message: 'line 2: invalid date "2026/01/04"' }
  );
});

test('a row with an empty description throws', () => {
  const text = 'date,description,category,amount\n2026-01-04,,food,4.35\n';
  assert.throws(
    () => parseCsv(text),
    { message: 'line 2: empty description' }
  );
});

test('a row with an empty category throws', () => {
  const text = 'date,description,category,amount\n2026-01-04,Coffee,,4.35\n';
  assert.throws(
    () => parseCsv(text),
    { message: 'line 2: empty category' }
  );
});

test('a row with an invalid amount throws with a message that includes the line number', () => {
  const text = 'date,description,category,amount\n2026-01-04,Coffee,food,4.3\n';
  assert.throws(
    () => parseCsv(text),
    { message: 'line 2: invalid amount: "4.3"' }
  );
});

test('a trailing blank line at end of file does not throw and does not appear as a row', () => {
  const text = 'date,description,category,amount\n2026-01-04,Coffee,food,4.35\n\n';
  const rows = parseCsv(text);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], { date: '2026-01-04', description: 'Coffee', category: 'food', amountCents: 435 });
});

test('a blank line in the middle is skipped but subsequent line numbers still account for it', () => {
  const text = 'date,description,category,amount\n\n2026-01-04,Coffee,food,4.3\n';
  assert.throws(
    () => parseCsv(text),
    { message: 'line 3: invalid amount: "4.3"' }
  );
});
