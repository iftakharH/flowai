const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { requirePro } = require('../middlewares/profileMiddleware.js');
const { listGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController.js');

const router = express.Router();
router.use(protect, requirePro);
router.route('/').get(listGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);
module.exports = router;
