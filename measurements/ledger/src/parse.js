import { parseAmountToCents } from './money.js';

const HEADER = 'date,description,category,amount';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseCsv(text) {
  const lines = text.split('\n');
  const rows = [];
  let headerSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const raw = lines[i];
    const line = raw.replace(/\r$/, '');

    if (line.trim() === '') {
      continue;
    }

    if (!headerSeen) {
      if (line !== HEADER) {
        throw new Error(`invalid header, expected "${HEADER}", got "${line}"`);
      }
      headerSeen = true;
      continue;
    }

    const fields = line.split(',');
    if (fields.length !== 4) {
      throw new Error(`line ${lineNumber}: expected 4 fields, got ${fields.length}`);
    }

    const [date, description, category, amount] = fields;

    if (!DATE_PATTERN.test(date)) {
      throw new Error(`line ${lineNumber}: invalid date "${date}"`);
    }

    if (description === '') {
      throw new Error(`line ${lineNumber}: empty description`);
    }

    if (category === '') {
      throw new Error(`line ${lineNumber}: empty category`);
    }

    let amountCents;
    try {
      amountCents = parseAmountToCents(amount);
    } catch (err) {
      throw new Error(`line ${lineNumber}: ${err.message}`);
    }

    rows.push({ date, description, category, amountCents });
  }

  return rows;
}
