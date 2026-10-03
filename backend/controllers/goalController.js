const Goal = require('../models/Goal.js');

const listGoals = async (req, res, next) => {
  try { res.json(await Goal.find({ user: req.user._id }).sort({ deadline: 1 })); } catch (error) { next(error); }
};
const createGoal = async (req, res, next) => {
  try { res.status(201).json(await Goal.create({ ...req.body, user: req.user._id })); } catch (error) { next(error); }
};
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) { next(error); }
};
const deleteGoal = async (req, res, next) => {
  try { await Goal.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ message: 'Goal removed' }); } catch (error) { next(error); }
};

module.exports = { listGoals, createGoal, updateGoal, deleteGoal };
