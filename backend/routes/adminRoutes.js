const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { requireAdmin } = require('../middlewares/adminMiddleware.js');
const { getStats, listUsers, updateUser, deleteUser } = require('../controllers/adminController.js');

const router = express.Router();
router.use(protect, requireAdmin);
router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
module.exports = router;
