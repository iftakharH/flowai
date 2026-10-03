const express = require('express');
const { getMe } = require('../controllers/authController.js');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Identity introspection. The client authenticates with Firebase directly and
// this endpoint simply echoes back the verified Firebase identity.
router.get('/me', protect, getMe);

module.exports = router;
