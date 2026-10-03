const {
  getSummary,
  getFlowSeries,
  getBudgetStatus,
  getAffordability,
} = require('../services/insightService.js');

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
  fetchSummary,
  fetchFlowSeries,
  fetchBudgetStatus,
  checkAffordability,
};
