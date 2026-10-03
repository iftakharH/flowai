const Transaction = require('../models/Transaction.js');
const Budget = require('../models/Budget.js');

const monthRange = (year, month) => ({
  start: new Date(year, month, 1),
  end: new Date(year, month + 1, 0, 23, 59, 59, 999),
});

// Server's UTC offset formatted for Mongo `$dateToString` timezone, so that
// bucketed dates match server-local time (the same timezone the rest of the
// app uses for "today", "this month", etc.).
const serverTimezoneOffset = () => {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  const minutes = String(abs % 60).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
};

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

// Single aggregation instead of loading every document into memory.
const getSummary = async (userId) => {
  const now = new Date();
  const cur = monthRange(now.getFullYear(), now.getMonth());
  const last = monthRange(now.getFullYear(), now.getMonth() - 1);

  const [result] = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        monthIncome: {
          $sum: { $cond: [{ $and: [{ $eq: ['$type', 'income'] }, { $gte: ['$date', cur.start] }] }, '$amount', 0] },
        },
        monthExpense: {
          $sum: { $cond: [{ $and: [{ $eq: ['$type', 'expense'] }, { $gte: ['$date', cur.start] }] }, '$amount', 0] },
        },
        lastMonthIncome: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$type', 'income'] }, { $gte: ['$date', last.start] }, { $lt: ['$date', cur.start] }] },
              '$amount',
              0,
            ],
          },
        },
        lastMonthExpense: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$type', 'expense'] }, { $gte: ['$date', last.start] }, { $lt: ['$date', cur.start] }] },
              '$amount',
              0,
            ],
          },
        },
      },
    },
  ]);

  const totalIncome = result?.totalIncome || 0;
  const totalExpense = result?.totalExpense || 0;

  // Top expense category for the current month.
  const [topCat] = await Transaction.aggregate([
    { $match: { user: userId, type: 'expense', date: { $gte: cur.start } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);

  return {
    totalIncome,
    totalExpense,
    remainingBalance: totalIncome - totalExpense,
    monthIncome: result?.monthIncome || 0,
    monthExpense: result?.monthExpense || 0,
    lastMonthIncome: result?.lastMonthIncome || 0,
    lastMonthExpense: result?.lastMonthExpense || 0,
    totalTransactions: result?.count || 0,
    topCategory: topCat ? { name: topCat._id, amount: topCat.total } : null,
  };
};

// Chart-ready series: last 7 days (daily) and last 6 months (monthly).
const getFlowSeries = async (userId) => {
  const now = new Date();
  const tz = serverTimezoneOffset();

  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const sixMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const groupStage = {
    income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
    expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
  };

  const [dailyRows, monthlyRows] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: sevenDaysAgo, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: tz } },
          ...groupStage,
        },
      },
    ]),
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgoStart, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date', timezone: tz } },
          ...groupStage,
        },
      },
    ]),
  ]);

  const dailyMap = new Map(dailyRows.map((row) => [row._id, row]));
  const monthlyMap = new Map(monthlyRows.map((row) => [row._id, row]));

  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const row = dailyMap.get(dayKey(d)) || { income: 0, expense: 0 };
    daily.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      income: row.income,
      expense: row.expense,
    });
  }

  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const row = monthlyMap.get(monthKey(m)) || { income: 0, expense: 0 };
    monthly.push({
      label: m.toLocaleDateString('en-US', { month: 'short' }),
      income: row.income,
      expense: row.expense,
    });
  }

  return { daily, monthly };
};

// Compares stored budgets against month-to-date spending.
const getBudgetStatus = async (userId) => {
  const { start, end } = monthRange(new Date().getFullYear(), new Date().getMonth());
  const budgets = await Budget.find({ user: userId });

  const spentByCategory = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);

  const categorySpend = new Map(spentByCategory.map((row) => [row._id, row.spent]));
  const totalSpent = [...categorySpend.values()].reduce((sum, value) => sum + value, 0);

  const tracked = budgets.map((budget) => {
    const spent =
      budget.type === 'overall'
        ? totalSpent
        : categorySpend.get(budget.category) || 0;

    const remaining = budget.amount - spent;

    return {
      _id: budget._id,
      type: budget.type,
      category: budget.category,
      period: budget.period,
      amount: budget.amount,
      spent,
      remaining,
      percentUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      overBudget: remaining < 0,
    };
  });

  return {
    period: { start, end },
    totalSpent,
    budgets: tracked,
  };
};

const getAffordability = async (userId, cost) => {
  const now = new Date();
  const { start, end } = monthRange(now.getFullYear(), now.getMonth());

  // Total spent this month so far.
  const currentMonthExpenses = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const spentSoFar = currentMonthExpenses.length ? currentMonthExpenses[0].total : 0;

  const summary = await getSummary(userId);
  const currentBalance = summary.remainingBalance;

  const daysInMonth = end.getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed + 1; // including today

  const dailyAverageSpent = daysPassed > 1 ? spentSoFar / daysPassed : spentSoFar;
  const projectedMonthlyExpense = spentSoFar + dailyAverageSpent * daysLeft;

  const canAfford = currentBalance - cost > 0;
  let message = '';

  if (!canAfford) {
    message = 'You cannot afford this right now based on your current balance.';
  } else if (currentBalance - cost < projectedMonthlyExpense * 0.2) {
    message =
      'You can afford this, but it will leave you with very little buffer for the rest of the month based on your spending habits.';
  } else {
    message = 'Yes, you can afford this comfortably.';
  }

  return {
    cost,
    currentBalance,
    spentSoFar,
    dailyAverageSpent,
    daysLeft,
    canAfford,
    message,
  };
};

module.exports = {
  getSummary,
  getFlowSeries,
  getBudgetStatus,
  getAffordability,
};
