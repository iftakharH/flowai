const Account = require('../models/Account.js');
const Transaction = require('../models/Transaction.js');

const listAccounts = async (userId) => {
  const accounts = await Account.find({ user: userId }).lean();
  const totals = await Transaction.aggregate([
    { $match: { user: userId, accountId: { $exists: true, $ne: '' } } },
    { $group: { _id: '$accountId', income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } }, expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } } } },
  ]);
  const map = new Map(totals.map((item) => [item._id, item]));
  return accounts.map((account) => ({ ...account, balance: account.openingBalance + (map.get(String(account._id))?.income || 0) - (map.get(String(account._id))?.expense || 0) }));
};

module.exports = { listAccounts };
