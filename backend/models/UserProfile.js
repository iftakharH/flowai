const mongoose = require('mongoose');

const defaultCategories = [
  'Housing',
  'Food',
  'Transport',
  'Health',
  'Shopping',
  'Entertainment',
  'Bills',
  'Other',
];

const userProfileSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: '' },
    displayName: { type: String, default: '' },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    locale: { type: String, default: 'en-US', trim: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    accent: { type: String, enum: ['sage', 'amber', 'blue', 'plum'], default: 'sage' },
    categories: { type: [String], default: defaultCategories },
    dashboardPrefs: {
      type: [String],
      default: ['balance', 'metrics', 'flow', 'signals', 'purchase', 'activity', 'health'],
    },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    isAdmin: { type: Boolean, default: false },
    subscriptionStatus: { type: String, default: 'inactive' },
    stripeCustomerId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
    trialEndsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
module.exports.defaultCategories = defaultCategories;
