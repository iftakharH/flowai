const express = require('express');
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware.js');
const { previewCsv, importCsv } = require('../controllers/csvController.js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(protect);

router.post('/preview', upload.single('file'), previewCsv);
router.post('/import', importCsv);

module.exports = router;
