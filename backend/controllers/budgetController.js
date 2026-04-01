const { setBudget, getBudgets, deleteBudget } = require('../services/budgetService.js');

const addOrUpdateBudget = async (req, res, next) => {
  try {
    const budget = await setBudget(req.user._id, req.body);
    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

const getAllBudgets = async (req, res, next) => {
  try {
    const data = await getBudgets(req.user._id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const deleteSingleBudget = async (req, res, next) => {
  try {
    await deleteBudget(req.user._id, req.params.id);
    res.json({ message: 'Budget removed' });
  } catch (error) {
    res.status(404);
    next(error);
  }
};

module.exports = {
  addOrUpdateBudget,
  getAllBudgets,
  deleteSingleBudget
};
