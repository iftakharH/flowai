const test = require('node:test');
const assert = require('node:assert/strict');
const { budgetSchema, transactionArraySchema, onboardingSchema } = require('../utils/validators.js');
const { publicProfile } = require('../services/profileService.js');
const validate = require('../middlewares/validateMiddleware.js');

test('category budgets require a category', () => {
  assert.equal(budgetSchema.safeParse({ amount: 100, type: 'category' }).success, false);
  assert.equal(budgetSchema.safeParse({ amount: 100, type: 'category', category: 'Food' }).success, true);
});

test('CSV rows reject invalid amounts', () => {
  const result = transactionArraySchema.safeParse([{ amount: -1, type: 'expense', category: 'Food' }]);
  assert.equal(result.success, false);
});

test('onboarding requires a focused goal and positive income', () => {
  assert.equal(onboardingSchema.safeParse({ goal: 'unknown', monthlyIncome: 4200 }).success, false);
  assert.equal(onboardingSchema.safeParse({ goal: 'control', monthlyIncome: 0 }).success, false);
  assert.equal(onboardingSchema.safeParse({ goal: 'control', monthlyIncome: 4200 }).success, true);
});

test('onboarding accepts an optional first expense', () => {
  const result = onboardingSchema.safeParse({
    goal: 'save',
    monthlyIncome: 4200,
    firstExpense: { amount: 18.4, category: 'Food', note: 'Lunch', date: '2026-10-22' },
  });
  assert.equal(result.success, true);
});

test('existing profiles without an onboarding flag stay onboarded', () => {
  assert.equal(publicProfile({ onboardingCompleted: undefined }).onboardingCompleted, true);
  assert.equal(publicProfile({ onboardingCompleted: false }).onboardingCompleted, false);
  assert.equal(publicProfile({ onboardingCompleted: true }).onboardingCompleted, true);
});

test('validation middleware returns a readable 400 instead of throwing', () => {
  let statusCode;
  let receivedError;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
  };
  validate(onboardingSchema)(
    { body: { goal: 'nope', monthlyIncome: 0 } },
    res,
    (error) => { receivedError = error; }
  );
  assert.equal(statusCode, 400);
  assert.match(receivedError.message, /Choose what you want to improve/);
});
