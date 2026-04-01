const { getSummary, getAffordability } = require('../services/insightService.js');

const fetchSummary = async (req, res, next) => {
  try {
    const summary = await getSummary(req.user._id);
    res.json(summary);
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
  checkAffordability,
};
