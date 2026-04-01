const { createTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../services/transactionService.js');

const addTransaction = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401);
      throw new Error('Identity injection failed in controller');
    }
    const transaction = await createTransaction(userId, req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const data = await getTransactions(req.user._id, req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const updateSingleTransaction = async (req, res, next) => {
  try {
    const transaction = await updateTransaction(req.user._id, req.params.id, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(404);
    next(error);
  }
};

const deleteSingleTransaction = async (req, res, next) => {
  try {
    await deleteTransaction(req.user._id, req.params.id);
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(404);
    next(error);
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
  updateSingleTransaction,
  deleteSingleTransaction
};
