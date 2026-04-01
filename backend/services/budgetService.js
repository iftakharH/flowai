const Budget = require('../models/Budget.js');

const setBudget = async (userId, data) => {
  let budget;

  if (data.type === 'overall') {
    budget = await Budget.findOne({ user: userId, type: 'overall' });
    if (budget) {
      budget.amount = data.amount;
      return await budget.save();
    }
  } else if (data.type === 'category') {
    budget = await Budget.findOne({ user: userId, type: 'category', category: data.category });
    if (budget) {
      budget.amount = data.amount;
      return await budget.save();
    }
  }

  return await Budget.create({ ...data, user: userId });
};

const getBudgets = async (userId) => {
  return await Budget.find({ user: userId });
};

const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOne({ _id: budgetId, user: userId });
  if (!budget) throw new Error('Budget not found');
  await Budget.deleteOne({ _id: budgetId });
  return true;
};

module.exports = {
  setBudget,
  getBudgets,
  deleteBudget,
};
