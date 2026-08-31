import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const CLI_PATH = path.join(REPO_ROOT, 'src', 'cli.js');

const EXPECTED_OUTPUT = `2026-01
  food: $67.47
  transport: $2.90
  Total: $70.37

2026-02
  food: $46.35
  housing: $1200.00
  Total: $1246.35

Grand total: $1316.72
`;

test('prints exact report for the fixture and exits 0', () => {
  const stdout = execFileSync('node', [CLI_PATH, 'fixtures/expenses.csv'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  assert.equal(stdout, EXPECTED_OUTPUT);
});

test('exits non-zero and writes to stderr when no argument is given', () => {
  assert.throws(
    () => {
      execFileSync('node', [CLI_PATH], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
    },
    (err) => {
      assert.notEqual(err.status, 0);
      assert.equal(err.stderr, 'Usage: ledger <path-to-csv>\n');
      return true;
    },
  );
});

test('exits non-zero and writes to stderr for a nonexistent file path', () => {
  const missingPath = 'fixtures/does-not-exist.csv';
  assert.throws(
    () => {
      execFileSync('node', [CLI_PATH, missingPath], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
    },
    (err) => {
      assert.notEqual(err.status, 0);
      assert.equal(err.stderr, `Error: cannot read file "${missingPath}"\n`);
      return true;
    },
  );
});
