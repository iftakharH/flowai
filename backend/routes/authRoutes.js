const express = require('express');
const { register, login, getProfile } = require('../controllers/authController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const validate = require('../middlewares/validateMiddleware.js');
const { registerSchema, loginSchema } = require('../utils/validators.js');
const { authLimiter } = require('../middlewares/rateLimitMiddleware.js');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/profile', protect, getProfile);

module.exports = router;
