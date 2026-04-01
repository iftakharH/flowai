const Transaction = require('../models/Transaction.js');

const getSummary = async (userId) => {
  const transactions = await Transaction.find({ user: userId });
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') totalIncome += tx.amount;
    else if (tx.type === 'expense') totalExpense += tx.amount;
  });

  return {
    totalIncome,
    totalExpense,
    remainingBalance: totalIncome - totalExpense,
  };
};

const getAffordability = async (userId, cost) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get total spent this month so far
  const currentMonthExpenses = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const spentSoFar = currentMonthExpenses.length ? currentMonthExpenses[0].total : 0;
  
  // Get insights from global logic
  const summary = await getSummary(userId);
  const currentBalance = summary.remainingBalance;

  // Simple Affordability Check
  const daysInMonth = endOfMonth.getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed + 1; // including today
  
  const dailyAverageSpent = daysPassed > 1 ? (spentSoFar / daysPassed) : spentSoFar;
  const projectedMonthlyExpense = spentSoFar + (dailyAverageSpent * daysLeft);
  
  const canAfford = (currentBalance - cost) > 0;
  let message = '';

  if (!canAfford) {
    message = 'You cannot afford this right now based on your current balance.';
  } else {
    if ((currentBalance - cost) < (projectedMonthlyExpense * 0.2)) {
      message = 'You can afford this, but it will leave you with very little buffer for the rest of the month based on your spending habits.';
    } else {
      message = 'Yes, you can afford this comfortably.';
    }
  }

  return {
    cost,
    currentBalance,
    spentSoFar,
    dailyAverageSpent,
    daysLeft,
    canAfford,
    message
  };
};

module.exports = {
  getSummary,
  getAffordability,
};
