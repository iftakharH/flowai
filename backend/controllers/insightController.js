const {
  getSummary,
  getWeeklyRecap,
  getFlowSeries,
  getBudgetStatus,
  getAffordability,
} = require('../services/insightService.js');
const { detectRecurring, detectAnomalies, forecast } = require('../services/smartService.js');
const { getTransactions } = require('../services/transactionService.js');
const cache = require('../utils/cache.js');

const OVERVIEW_TTL_MS = 30000;

const fetchOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cacheKey = `user:${userId}:overview`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [summary, weekly, flow, recent] = await Promise.all([
      getSummary(userId),
      getWeeklyRecap(userId),
      getFlowSeries(userId),
      getTransactions(userId, { limit: 5, page: 1 }),
    ]);

    let smart = { recurring: [], anomalies: [], forecast: null };
    if (req.profile?.plan === 'pro') {
      const [recurring, anomalies, forecastData] = await Promise.all([
        detectRecurring(userId, req.profile?.ignoredRecurring || []),
        detectAnomalies(userId),
        forecast(userId, summary),
      ]);
      smart = { recurring, anomalies, forecast: forecastData };
    }

    const payload = {
      summary,
      weekly,
      flow,
      recentTransactions: recent.transactions,
      smart,
    };

    cache.set(cacheKey, payload, OVERVIEW_TTL_MS);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

const fetchSummary = async (req, res, next) => {
  try {
    const summary = await getSummary(req.user._id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

const fetchFlowSeries = async (req, res, next) => {
  try {
    const series = await getFlowSeries(req.user._id);
    res.json(series);
  } catch (error) {
    next(error);
  }
};

const fetchBudgetStatus = async (req, res, next) => {
  try {
    const status = await getBudgetStatus(req.user._id);
    res.json(status);
  } catch (error) {
    next(error);
  }
};

const checkAffordability = async (req, res, next) => {
  try {
    const { cost } = req.body;
    if (!cost || cost <= 0) {
      res.status(400);
      throw new Error('Please enter a valid cost');
    }

    const insight = await getAffordability(req.user._id, cost);
    res.json(insight);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchOverview,
  fetchSummary,
  fetchFlowSeries,
  fetchBudgetStatus,
  checkAffordability,
};
