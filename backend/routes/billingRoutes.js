const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { attachProfile } = require('../middlewares/profileMiddleware.js');
const { startCheckout, openPortal, getSubscription } = require('../controllers/billingController.js');

const router = express.Router();
router.use(protect, attachProfile);
router.get('/subscription', getSubscription);
router.post('/checkout', startCheckout);
router.post('/portal', openPortal);

module.exports = router;
