const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { requireAdmin } = require('../middlewares/adminMiddleware.js');
const { listQuotes, createQuote, updateQuote, deleteQuote } = require('../controllers/quoteController.js');

const router = express.Router();
router.get('/', listQuotes);
router.post('/', protect, requireAdmin, createQuote);
router.put('/:id', protect, requireAdmin, updateQuote);
router.delete('/:id', protect, requireAdmin, deleteQuote);
module.exports = router;
