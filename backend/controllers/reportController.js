const { monthlyReport } = require('../services/reportService.js');
const getMonthlyReport = async (req, res, next) => {
  try { res.json(await monthlyReport(req.user._id, req.query.month)); } catch (error) { next(error); }
};
module.exports = { getMonthlyReport };
