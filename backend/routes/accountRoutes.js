const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { requirePro } = require('../middlewares/profileMiddleware.js');
const { getAccounts, createAccount, updateAccount, deleteAccount } = require('../controllers/accountController.js');
const router = express.Router();
router.use(protect, requirePro);
router.route('/').get(getAccounts).post(createAccount);
router.route('/:id').put(updateAccount).delete(deleteAccount);
module.exports = router;
