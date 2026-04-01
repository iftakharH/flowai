const Transaction = require('../models/Transaction.js');

const createTransaction = async (userId, data) => {
  return await Transaction.create({ ...data, user: userId });
};

const getTransactions = async (userId, query) => {
  const filter = { user: userId };
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  
  // Date range filter
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Transaction.countDocuments(filter);
  
  return { transactions, total, page, pages: Math.ceil(total / limit) };
};

const updateTransaction = async (userId, transactionId, data) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) throw new Error('Transaction not found');
  
  return await Transaction.findByIdAndUpdate(transactionId, data, { new: true });
};

const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) throw new Error('Transaction not found');
  
  await Transaction.deleteOne({ _id: transactionId });
  return true;
};

const insertManyTransactions = async (userId, transactions) => {
  const data = transactions.map(t => ({ ...t, user: userId }));
  return await Transaction.insertMany(data);
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  insertManyTransactions
};
