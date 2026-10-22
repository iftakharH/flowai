const test = require('node:test');
const assert = require('node:assert/strict');
const { parseQuickAdd, buildRecurring } = require('../services/smartService.js');

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

test('recurring detection finds a monthly subscription', () => {
  const items = buildRecurring([
    { category: 'Entertainment', amount: 15.99, note: 'Netflix', date: '2026-06-01' },
    { category: 'Entertainment', amount: 15.99, note: 'Netflix', date: '2026-07-01' },
    { category: 'Entertainment', amount: 15.99, note: 'Netflix', date: '2026-08-01' },
    { category: 'Entertainment', amount: 15.99, note: 'Netflix', date: '2026-09-01' },
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].name, 'Netflix');
  assert.equal(items[0].intervalLabel, 'Monthly');
  assert.equal(items[0].occurrences, 4);
  assert.equal(items[0].confidence, 'high');
  assert.ok(items[0].annualCost > 180);
});

test('recurring detection understands yearly charges', () => {
  const items = buildRecurring([
    { category: 'Bills', amount: 99, note: 'Cloud storage', date: '2025-10-01' },
    { category: 'Bills', amount: 99, note: 'Cloud storage', date: '2026-10-01' },
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].intervalLabel, 'Yearly');
  assert.equal(items[0].annualCost, 99);
});

test('one-off purchases are not treated as subscriptions', () => {
  const items = buildRecurring([
    { category: 'Shopping', amount: 240, note: 'Desk', date: '2026-10-01' },
  ]);
  assert.equal(items.length, 0);
});
