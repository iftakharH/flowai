const express = require('express');
const { fetchSummary, checkAffordability } = require('../controllers/insightController.js');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(protect);

router.get('/summary', fetchSummary);
router.post('/affordability', checkAffordability);

module.exports = router;
