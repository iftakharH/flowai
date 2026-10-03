const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const { attachProfile } = require('../middlewares/profileMiddleware.js');
const validate = require('../middlewares/validateMiddleware.js');
const { settingsSchema, categorySchema } = require('../utils/validators.js');
const {
  getSettings,
  saveSettings,
  createCategory,
  deleteCategory,
  downloadData,
  eraseData,
} = require('../controllers/settingsController.js');

const router = express.Router();
router.use(protect, attachProfile);
router.route('/').get(getSettings).put(validate(settingsSchema), saveSettings);
router.post('/categories', validate(categorySchema), createCategory);
router.delete('/categories/:name', deleteCategory);
router.get('/export', downloadData);
router.delete('/data', eraseData);

module.exports = router;
