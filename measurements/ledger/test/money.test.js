import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmountToCents, centsToDisplay } from '../src/money.js';

test('parseAmountToCents parses a positive amount', () => {
  assert.equal(parseAmountToCents('4.35'), 435);
});

test('parseAmountToCents parses a negative amount', () => {
  assert.equal(parseAmountToCents('-12.05'), -1205);
});

test('parseAmountToCents parses a large amount', () => {
  assert.equal(parseAmountToCents('1200.00'), 120000);
});

test('parseAmountToCents throws on one decimal digit', () => {
  assert.throws(() => parseAmountToCents('4.3'), {
    message: 'invalid amount: "4.3"',
  });
});

test('parseAmountToCents throws on three decimal digits', () => {
  assert.throws(() => parseAmountToCents('4.355'), {
    message: 'invalid amount: "4.355"',
  });
});

test('parseAmountToCents throws on non-numeric input', () => {
  assert.throws(() => parseAmountToCents('abc'), {
    message: 'invalid amount: "abc"',
  });
});

test('centsToDisplay formats a positive amount', () => {
  assert.equal(centsToDisplay(435), '4.35');
});

test('centsToDisplay formats a negative amount', () => {
  assert.equal(centsToDisplay(-1205), '-12.05');
});

test('centsToDisplay formats a large amount', () => {
  assert.equal(centsToDisplay(120000), '1200.00');
});

test('centsToDisplay formats zero', () => {
  assert.equal(centsToDisplay(0), '0.00');
});

test('centsToDisplay throws on a non-integer', () => {
  assert.throws(() => centsToDisplay(1.5), {
    message: 'not an integer: 1.5',
  });
});
