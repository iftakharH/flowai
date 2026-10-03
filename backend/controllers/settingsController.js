const {
  publicProfile,
  updateProfile,
  addCategory,
  removeCategory,
  exportUserData,
  deleteUserData,
} = require('../services/profileService.js');

const getSettings = async (req, res) => {
  res.json(publicProfile(req.profile));
};

const saveSettings = async (req, res, next) => {
  try {
    const profile = await updateProfile(req.profile, req.body);
    res.json(publicProfile(profile));
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const profile = await addCategory(req.profile, req.body.name);
    res.status(201).json({ categories: profile.categories });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const profile = await removeCategory(req.profile, req.params.name);
    res.json({ categories: profile.categories });
  } catch (error) {
    next(error);
  }
};

const downloadData = async (req, res, next) => {
  try {
    const data = await exportUserData(req.user._id);
    if (req.query.format === 'csv') {
      const rows = data.transactions.map((item) => [item.date?.toISOString(), item.type, item.category, item.amount, item.note || '']);
      const csv = [['date', 'type', 'category', 'amount', 'note'], ...rows]
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      res.type('text/csv').set('Content-Disposition', 'attachment; filename="flowai-transactions.csv"').send(csv);
      return;
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const eraseData = async (req, res, next) => {
  try {
    await deleteUserData(req.user._id);
    res.json({ message: 'Your transaction and budget data has been removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, saveSettings, createCategory, deleteCategory, downloadData, eraseData };
