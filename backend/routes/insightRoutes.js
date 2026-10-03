const express = require('express');
const {
  fetchSummary,
  fetchFlowSeries,
  fetchBudgetStatus,
  checkAffordability,
} = require('../controllers/insightController.js');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(protect);

router.get('/summary', fetchSummary);
router.get('/flow', fetchFlowSeries);
router.get('/budget-status', fetchBudgetStatus);
router.post('/affordability', checkAffordability);

module.exports = router;
