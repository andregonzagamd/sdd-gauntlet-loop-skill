import { readFileSync } from 'node:fs';
import { parseCsv } from './parse.js';
import { buildReport, formatReport } from './report.js';

export function run(argv) {
  const path = argv[2];

  if (!path) {
    process.stderr.write('Usage: ledger <path-to-csv>\n');
    process.exitCode = 1;
    return;
  }

  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    process.stderr.write(`Error: cannot read file "${path}"\n`);
    process.exitCode = 1;
    return;
  }

  let output;
  try {
    output = formatReport(buildReport(parseCsv(text)));
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`${output}\n`);
}

run(process.argv);
