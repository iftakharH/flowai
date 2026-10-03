const test = require('node:test');
const assert = require('node:assert/strict');
const { budgetSchema, transactionArraySchema } = require('../utils/validators.js');

test('category budgets require a category', () => {
  assert.equal(budgetSchema.safeParse({ amount: 100, type: 'category' }).success, false);
  assert.equal(budgetSchema.safeParse({ amount: 100, type: 'category', category: 'Food' }).success, true);
});

test('CSV rows reject invalid amounts', () => {
  const result = transactionArraySchema.safeParse([{ amount: -1, type: 'expense', category: 'Food' }]);
  assert.equal(result.success, false);
});
