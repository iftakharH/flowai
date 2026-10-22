const { createTransaction } = require('../services/transactionService.js');
const { parseQuickAdd, detectRecurring, detectAnomalies, forecast } = require('../services/smartService.js');
const cache = require('../utils/cache.js');

const quickAdd = async (req, res, next) => {
  try {
    const parsed = parseQuickAdd(req.body.text);
    const transaction = await createTransaction(req.user._id, parsed);
    res.status(201).json({ transaction, parsed });
  } catch (error) { next(error); }
};

const recurring = async (req, res, next) => {
  try {
    res.json({ items: await detectRecurring(req.user._id, req.profile?.ignoredRecurring || []) });
  } catch (error) { next(error); }
};

const dismissRecurring = async (req, res, next) => {
  try {
    const key = String(req.params.key || '').trim();
    if (!key || key.length > 120) {
      res.status(400);
      throw new Error('Invalid recurring charge key');
    }
    const profile = req.profile;
    const ignored = new Set(profile.ignoredRecurring || []);
    ignored.add(key);
    profile.ignoredRecurring = [...ignored].slice(-200);
    await profile.save();
    cache.clearUser(req.user._id);
    res.json({ dismissed: key, ignoredRecurring: profile.ignoredRecurring });
  } catch (error) { next(error); }
};

const restoreRecurring = async (req, res, next) => {
  try {
    const key = String(req.params.key || '').trim();
    const profile = req.profile;
    profile.ignoredRecurring = (profile.ignoredRecurring || []).filter((item) => item !== key);
    await profile.save();
    cache.clearUser(req.user._id);
    res.json({ restored: key, ignoredRecurring: profile.ignoredRecurring });
  } catch (error) { next(error); }
};

const anomalies = async (req, res, next) => {
  try { res.json({ items: await detectAnomalies(req.user._id) }); } catch (error) { next(error); }
};
const forecastSpend = async (req, res, next) => {
  try { res.json(await forecast(req.user._id)); } catch (error) { next(error); }
};

module.exports = {
  quickAdd,
  recurring,
  dismissRecurring,
  restoreRecurring,
  anomalies,
  forecastSpend,
};
