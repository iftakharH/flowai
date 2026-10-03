const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { requirePro } = require('../middlewares/profileMiddleware.js');
const { getMonthlyReport } = require('../controllers/reportController.js');
const router = express.Router();
router.get('/monthly', protect, requirePro, getMonthlyReport);
module.exports = router;
