const { insertManyTransactions } = require('../services/transactionService.js');
const { getSummary } = require('../services/insightService.js');
const { publicProfile } = require('../services/profileService.js');

const monthStart = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const completeOnboarding = async (req, res, next) => {
  try {
    const profile = req.profile;
    if (profile.onboardingCompleted) {
      return res.json({ alreadyCompleted: true, summary: await getSummary(req.user._id) });
    }

    const { goal, monthlyIncome, firstExpense } = req.body;
    const rows = [{
      amount: monthlyIncome,
      type: 'income',
      category: 'Income',
      note: 'Income for this month',
      date: monthStart(),
    }];

    if (firstExpense) {
      rows.push({
        amount: firstExpense.amount,
        type: 'expense',
        category: firstExpense.category,
        note: firstExpense.note || 'First tracked expense',
        date: firstExpense.date ? new Date(firstExpense.date) : new Date(),
      });
    }

    await insertManyTransactions(req.user._id, rows);

    profile.onboardingCompleted = true;
    profile.onboardingGoal = goal;
    await profile.save();

    return res.status(201).json({
      profile: publicProfile(profile),
      summary: await getSummary(req.user._id),
    });
  } catch (error) {
    return next(error);
  }
};

const skipOnboarding = async (req, res, next) => {
  try {
    const profile = req.profile;
    if (!profile.onboardingCompleted) {
      profile.onboardingCompleted = true;
      await profile.save();
    }
    return res.json({ profile: publicProfile(profile) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { completeOnboarding, skipOnboarding };
