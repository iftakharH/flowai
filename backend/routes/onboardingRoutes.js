const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { attachProfile } = require('../middlewares/profileMiddleware.js');
const validate = require('../middlewares/validateMiddleware.js');
const { onboardingSchema } = require('../utils/validators.js');
const { completeOnboarding, skipOnboarding } = require('../controllers/onboardingController.js');

const router = express.Router();

router.use(protect, attachProfile);

router.post('/', validate(onboardingSchema), completeOnboarding);
router.post('/skip', skipOnboarding);

module.exports = router;
