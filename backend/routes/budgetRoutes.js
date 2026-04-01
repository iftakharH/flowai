const express = require('express');
const {
  addOrUpdateBudget,
  getAllBudgets,
  deleteSingleBudget,
} = require('../controllers/budgetController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const validate = require('../middlewares/validateMiddleware.js');
const { budgetSchema } = require('../utils/validators.js');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllBudgets)
  .post(validate(budgetSchema), addOrUpdateBudget);

router.route('/:id').delete(deleteSingleBudget);

module.exports = router;
