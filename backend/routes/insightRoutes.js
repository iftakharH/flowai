const express = require('express');
const {
  fetchOverview,
  fetchSummary,
  fetchFlowSeries,
  fetchBudgetStatus,
  checkAffordability,
} = require('../controllers/insightController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const { attachProfile } = require('../middlewares/profileMiddleware.js');

const router = express.Router();

router.use(protect);

router.get('/overview', attachProfile, fetchOverview);
router.get('/summary', fetchSummary);
router.get('/flow', fetchFlowSeries);
router.get('/budget-status', fetchBudgetStatus);
router.post('/affordability', checkAffordability);

module.exports = router;
