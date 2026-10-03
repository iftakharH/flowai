const { createTransaction } = require('../services/transactionService.js');
const { parseQuickAdd, detectRecurring, detectAnomalies, forecast } = require('../services/smartService.js');

const quickAdd = async (req, res, next) => {
  try {
    const parsed = parseQuickAdd(req.body.text);
    const transaction = await createTransaction(req.user._id, parsed);
    res.status(201).json({ transaction, parsed });
  } catch (error) { next(error); }
};

const recurring = async (req, res, next) => {
  try { res.json({ items: await detectRecurring(req.user._id) }); } catch (error) { next(error); }
};
const anomalies = async (req, res, next) => {
  try { res.json({ items: await detectAnomalies(req.user._id) }); } catch (error) { next(error); }
};
const forecastSpend = async (req, res, next) => {
  try { res.json(await forecast(req.user._id)); } catch (error) { next(error); }
};

module.exports = { quickAdd, recurring, anomalies, forecastSpend };
