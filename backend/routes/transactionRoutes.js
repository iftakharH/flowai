const express = require('express');
const {
  addTransaction,
  getAllTransactions,
  updateSingleTransaction,
  deleteSingleTransaction,
} = require('../controllers/transactionController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const validate = require('../middlewares/validateMiddleware.js');
const { transactionSchema } = require('../utils/validators.js');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllTransactions)
  .post(validate(transactionSchema), addTransaction);

router.route('/:id')
  .put(validate(transactionSchema), updateSingleTransaction)
  .delete(deleteSingleTransaction);

// Handled in a separate file (csvRoutes) or here, let's keep it modular.
module.exports = router;
