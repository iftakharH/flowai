const test = require('node:test');
const assert = require('node:assert/strict');
const { parseQuickAdd } = require('../services/smartService.js');

test('quick add parses a dated expense and category', () => {
  const result = parseQuickAdd('coffee 4.50 yesterday');
  assert.equal(result.amount, 4.5);
  assert.equal(result.type, 'expense');
  assert.equal(result.category, 'Food');
  assert.equal(result.date.getDate(), new Date(Date.now() - 86400000).getDate());
});

test('quick add parses income language', () => {
  const result = parseQuickAdd('salary 2500');
  assert.equal(result.amount, 2500);
  assert.equal(result.type, 'income');
});
