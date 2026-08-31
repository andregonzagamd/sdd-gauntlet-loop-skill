const AMOUNT_PATTERN = /^-?\d+\.\d{2}$/;

export function parseAmountToCents(raw) {
  if (!AMOUNT_PATTERN.test(raw)) {
    throw new Error(`invalid amount: "${raw}"`);
  }
  const negative = raw.startsWith('-');
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction] = unsigned.split('.');
  const cents = Number(whole) * 100 + Number(fraction);
  return negative ? -cents : cents;
}

export function centsToDisplay(cents) {
  if (!Number.isInteger(cents)) {
    throw new Error(`not an integer: ${cents}`);
  }
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, '0');
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}
