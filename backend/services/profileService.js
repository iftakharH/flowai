const UserProfile = require('../models/UserProfile.js');
const Transaction = require('../models/Transaction.js');
const Budget = require('../models/Budget.js');

const adminEmails = () => (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const getOrCreateProfile = async (user) => {
  // Upsert is atomic. A new user can fire settings and dashboard requests at
  // the same time; the old find-then-create flow hit the unique UID index.
  let profile;
  try {
    profile = await UserProfile.findOneAndUpdate(
      { firebaseUid: user._id },
      {
        $setOnInsert: {
          firebaseUid: user._id,
          email: user.email || '',
          displayName: user.name || '',
          onboardingCompleted: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    profile = await UserProfile.findOne({ firebaseUid: user._id });
  }

  let changed = false;
  if (user.email && profile.email !== user.email) {
    profile.email = user.email;
    changed = true;
  }
  if (user.name && profile.displayName !== user.name) {
    profile.displayName = user.name;
    changed = true;
  }
  if (changed) await profile.save();
  if (user.email && adminEmails().includes(user.email.toLowerCase()) && !profile.isAdmin) {
    profile.isAdmin = true;
    profile.plan = 'pro';
    await profile.save();
  }
  return profile;
};

const publicProfile = (profile) => ({
  firebaseUid: profile.firebaseUid,
  email: profile.email,
  displayName: profile.displayName,
  currency: profile.currency,
  locale: profile.locale,
  theme: profile.theme,
  accent: profile.accent,
  categories: profile.categories,
  dashboardPrefs: profile.dashboardPrefs,
  plan: profile.plan,
  isAdmin: profile.isAdmin,
  // Existing profiles predate this field. Treat them as already onboarded so
  // the upgrade does not force long-time users through a setup flow.
  onboardingCompleted: profile.onboardingCompleted !== false,
  onboardingGoal: profile.onboardingGoal || '',
  subscriptionStatus: profile.subscriptionStatus,
  trialEndsAt: profile.trialEndsAt,
});

const updateProfile = async (profile, data) => {
  Object.assign(profile, data);
  await profile.save();
  return profile;
};

const addCategory = async (profile, name) => {
  const normalized = name.trim();
  if (!normalized) throw new Error('Category name is required');
  if (!profile.categories.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
    profile.categories.push(normalized);
    await profile.save();
  }
  return profile;
};

const removeCategory = async (profile, name) => {
  profile.categories = profile.categories.filter((item) => item !== name);
  await profile.save();
  return profile;
};

const exportUserData = async (userId) => {
  const [transactions, budgets] = await Promise.all([
    Transaction.find({ user: userId }).sort({ date: -1 }).lean(),
    Budget.find({ user: userId }).sort({ createdAt: -1 }).lean(),
  ]);
  return { transactions, budgets };
};

const deleteUserData = async (userId) => {
  await Promise.all([
    Transaction.deleteMany({ user: userId }),
    Budget.deleteMany({ user: userId }),
  ]);
};

module.exports = {
  getOrCreateProfile,
  publicProfile,
  updateProfile,
  addCategory,
  removeCategory,
  exportUserData,
  deleteUserData,
};
