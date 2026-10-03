const UserProfile = require('../models/UserProfile.js');
const Transaction = require('../models/Transaction.js');

const getStats = async (req, res, next) => {
  try {
    const [users, pro, transactions] = await Promise.all([
      UserProfile.countDocuments(),
      UserProfile.countDocuments({ plan: 'pro' }),
      Transaction.countDocuments(),
    ]);
    res.json({ users, proUsers: pro, freeUsers: users - pro, transactions, estimatedMonthlyRevenue: pro * 5 });
  } catch (error) { next(error); }
};

const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const search = String(req.query.search || '').trim();
    const filter = search ? { $or: [{ email: new RegExp(search, 'i') }, { displayName: new RegExp(search, 'i') }] } : {};
    const [items, total] = await Promise.all([
      UserProfile.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      UserProfile.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    const profile = await UserProfile.findByIdAndUpdate(req.params.id, {
      ...(req.body.plan ? { plan: req.body.plan } : {}),
      ...(typeof req.body.isAdmin === 'boolean' ? { isAdmin: req.body.isAdmin } : {}),
      ...(req.body.subscriptionStatus ? { subscriptionStatus: req.body.subscriptionStatus } : {}),
    }, { new: true, runValidators: true });
    if (!profile) return res.status(404).json({ message: 'User not found' });
    res.json(profile);
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try { await UserProfile.findByIdAndDelete(req.params.id); res.json({ message: 'User profile removed' }); } catch (error) { next(error); }
};

module.exports = { getStats, listUsers, updateUser, deleteUser };
