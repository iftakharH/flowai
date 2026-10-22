const Transaction = require('../models/Transaction.js');
const { getSummary } = require('./insightService.js');

const categoryFromText = (text) => {
  const value = text.toLowerCase();
  const rules = [
    ['Food', ['coffee', 'cafe', 'lunch', 'dinner', 'grocery', 'groceries', 'restaurant']],
    ['Transport', ['uber', 'lyft', 'fuel', 'gas', 'train', 'bus', 'taxi']],
    ['Bills', ['internet', 'electric', 'water', 'phone', 'subscription', 'netflix']],
    ['Shopping', ['amazon', 'clothes', 'shop', 'purchase']],
    ['Health', ['doctor', 'pharmacy', 'medicine', 'gym']],
  ];
  return rules.find(([, words]) => words.some((word) => value.includes(word)))?.[0] || 'Other';
};

const parseQuickAdd = (text) => {
  const amountMatch = text.match(/(?:\$|USD\s*)?(\d+(?:\.\d{1,2})?)/i);
  if (!amountMatch) throw new Error('Add an amount, for example: coffee 4.50 yesterday');
  const amount = Number(amountMatch[1]);
  const isIncome = /\b(income|salary|paycheck|received|earned)\b/i.test(text);
  const date = /\byesterday\b/i.test(text) ? new Date(Date.now() - 86400000) : new Date();
  return {
    amount,
    type: isIncome ? 'income' : 'expense',
    category: categoryFromText(text),
    note: text.trim(),
    date,
  };
};

const DAY_MS = 86400000;

const intervalLabel = (days) => {
  if (days <= 9) return 'Weekly';
  if (days <= 45) return 'Monthly';
  if (days <= 120) return 'Quarterly';
  if (days <= 220) return 'Every 6 months';
  if (days <= 420) return 'Yearly';
  return 'Irregular';
};

const recurringConfidence = (occurrences, interval, gaps) => {
  if (!gaps.length || interval <= 0) return 'low';
  const variance = gaps.reduce((sum, gap) => sum + ((gap - interval) ** 2), 0) / gaps.length;
  const coefficient = Math.sqrt(variance) / interval;
  if (occurrences >= 3 && coefficient <= 0.18) return 'high';
  if (occurrences >= 2 && coefficient <= 0.35) return 'medium';
  return 'low';
};

const recurringName = (items, fallback) => {
  const counts = new Map();
  items.forEach((item) => {
    const note = (item.note || '').trim();
    if (note) counts.set(note, (counts.get(note) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
};

const buildRecurring = (transactions) => {
  const groups = new Map();
  transactions.forEach((item) => {
    const key = `${item.category.toLowerCase()}-${Math.round(item.amount)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  return [...groups.values()].map((items) => {
    if (items.length < 2) return null;
    const gaps = items.slice(1).map((item, index) => (
      (new Date(item.date) - new Date(items[index].date)) / DAY_MS
    ));
    const interval = gaps.reduce((sum, value) => sum + value, 0) / gaps.length;
    if (interval < 6 || interval > 420) return null;

    const last = items[items.length - 1];
    const key = `${items[0].category.toLowerCase()}-${Math.round(last.amount)}`;
    return {
      key,
      name: recurringName(items, items[0].category),
      category: items[0].category,
      amount: last.amount,
      intervalDays: Math.round(interval),
      intervalLabel: intervalLabel(interval),
      monthlyCost: Math.round((last.amount * 30 / interval) * 100) / 100,
      annualCost: Math.round((last.amount * 365 / interval) * 100) / 100,
      occurrences: items.length,
      lastDate: last.date,
      nextExpectedDate: new Date(new Date(last.date).getTime() + interval * DAY_MS),
      confidence: recurringConfidence(items.length, interval, gaps),
    };
  }).filter(Boolean).sort((a, b) => b.monthlyCost - a.monthlyCost);
};

const detectRecurring = async (userId, ignoredKeys = []) => {
  const since = new Date();
  since.setDate(since.getDate() - 400);
  const transactions = await Transaction.find({ user: userId, type: 'expense', date: { $gte: since } }).sort({ date: 1 }).lean();
  const ignored = new Set(ignoredKeys);
  return buildRecurring(transactions).filter((item) => !ignored.has(item.key));
};

const detectAnomalies = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const transactions = await Transaction.find({ user: userId, type: 'expense', date: { $gte: since } }).lean();

  // Build category statistics once instead of recomputing mean and variance
  // for every transaction. The old version was O(n^2) per request.
  const stats = new Map();
  transactions.forEach((item) => {
    const entry = stats.get(item.category) || { count: 0, total: 0, sumSquares: 0 };
    entry.count += 1;
    entry.total += item.amount;
    entry.sumSquares += item.amount ** 2;
    stats.set(item.category, entry);
  });

  const deviations = new Map();
  stats.forEach((entry, category) => {
    if (entry.count < 3) return;
    const mean = entry.total / entry.count;
    const variance = Math.max(0, (entry.sumSquares / entry.count) - (mean ** 2));
    deviations.set(category, { mean, deviation: Math.sqrt(variance) });
  });

  const anomalies = transactions
    .filter((item) => {
      const statsForCategory = deviations.get(item.category);
      if (!statsForCategory) return false;
      const { mean, deviation } = statsForCategory;
      return item.amount > mean + Math.max(deviation * 2, mean);
    })
    .map((item) => ({ ...item, reason: `This is much higher than your usual ${item.category} spend.` }));

  return anomalies.sort((a, b) => b.amount - a.amount).slice(0, 10);
};

const forecast = async (userId, summaryInput) => {
  const summary = summaryInput || await getSummary(userId);
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const expenses = await Transaction.aggregate([
    { $match: { user: userId, type: 'expense', date: { $gte: since } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const dailyAverage = (expenses[0]?.total || 0) / 90;
  return {
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    next30Days: Math.round(dailyAverage * 30 * 100) / 100,
    projectedBalance: Math.round((summary.remainingBalance - dailyAverage * 30) * 100) / 100,
    confidence: expenses[0] ? 'steady' : 'starting',
  };
};

module.exports = {
  parseQuickAdd,
  buildRecurring,
  detectRecurring,
  detectAnomalies,
  forecast,
};
