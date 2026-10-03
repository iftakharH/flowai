const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { requirePro } = require('../middlewares/profileMiddleware.js');
const { quickAdd, recurring, anomalies, forecastSpend } = require('../controllers/smartController.js');

const router = express.Router();
router.use(protect);
router.post('/quick-add', quickAdd);
router.get('/recurring', requirePro, recurring);
router.get('/anomalies', requirePro, anomalies);
router.get('/forecast', requirePro, forecastSpend);

module.exports = router;
