import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from './format.js';

test('formatCurrency defaults to USD without a browser document', () => {
  assert.match(formatCurrency(1234), /1,234/);
});
