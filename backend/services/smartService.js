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

const detectRecurring = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 180);
  const transactions = await Transaction.find({ user: userId, type: 'expense', date: { $gte: since } }).sort({ date: 1 }).lean();
  const groups = new Map();
  transactions.forEach((item) => {
    const key = `${item.category.toLowerCase()}-${Math.round(item.amount)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return [...groups.values()].map((items) => {
    if (items.length < 2) return null;
    const gaps = items.slice(1).map((item, index) => (new Date(item.date) - new Date(items[index].date)) / 86400000);
    const interval = gaps.reduce((sum, value) => sum + value, 0) / gaps.length;
    if (interval < 6 || interval > 35) return null;
    return {
      category: items[0].category,
      amount: items[items.length - 1].amount,
      intervalDays: Math.round(interval),
      monthlyCost: Math.round((items[items.length - 1].amount * 30 / interval) * 100) / 100,
      occurrences: items.length,
    };
  }).filter(Boolean).sort((a, b) => b.monthlyCost - a.monthlyCost);
};

const detectAnomalies = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const transactions = await Transaction.find({ user: userId, type: 'expense', date: { $gte: since } }).lean();
  const groups = new Map();
  transactions.forEach((item) => {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item.amount);
  });
  const anomalies = [];
  transactions.forEach((item) => {
    const values = groups.get(item.category) || [];
    if (values.length < 3) return;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
    const deviation = Math.sqrt(variance);
    if (item.amount > mean + Math.max(deviation * 2, mean)) anomalies.push({ ...item, reason: `This is much higher than your usual ${item.category} spend.` });
  });
  return anomalies.sort((a, b) => b.amount - a.amount).slice(0, 10);
};

const forecast = async (userId) => {
  const summary = await getSummary(userId);
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

module.exports = { parseQuickAdd, detectRecurring, detectAnomalies, forecast };
