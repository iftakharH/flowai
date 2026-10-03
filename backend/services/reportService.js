const Transaction = require('../models/Transaction.js');

const monthlyReport = async (userId, month) => {
  const [year, monthNumber] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 1);
  const [totals, categories] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ]);
  return { month: `${year}-${String(monthNumber).padStart(2, '0')}`, totals, categories };
};

module.exports = { monthlyReport };
