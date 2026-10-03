const UserProfile = require('../models/UserProfile.js');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

const requireStripe = () => {
  const stripe = getStripe();
  if (!stripe) {
    const error = new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to enable billing.');
    error.status = 503;
    throw error;
  }
  return stripe;
};

const getPriceId = (interval) => {
  const priceId = interval === 'year'
    ? process.env.STRIPE_PRICE_PRO_YEARLY
    : process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) {
    const error = new Error('The selected Pro price is not configured.');
    error.status = 503;
    throw error;
  }
  return priceId;
};

const ensureCustomer = async (profile) => {
  if (profile.stripeCustomerId) return profile.stripeCustomerId;
  const stripe = requireStripe();
  const customer = await stripe.customers.create({
    email: profile.email || undefined,
    name: profile.displayName || undefined,
    metadata: { firebaseUid: profile.firebaseUid },
  });
  profile.stripeCustomerId = customer.id;
  await profile.save();
  return customer.id;
};

const createCheckoutSession = async (profile, interval, appUrl) => {
  const stripe = requireStripe();
  const customer = await ensureCustomer(profile);
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price: getPriceId(interval), quantity: 1 }],
    success_url: `${appUrl}/settings?billing=success`,
    cancel_url: `${appUrl}/settings?billing=cancelled`,
    allow_promotion_codes: true,
    metadata: { firebaseUid: profile.firebaseUid },
  });
};

const createPortalSession = async (profile, appUrl) => {
  const stripe = requireStripe();
  const customer = await ensureCustomer(profile);
  return stripe.billingPortal.sessions.create({ customer, return_url: `${appUrl}/settings` });
};

const updateSubscriptionFromEvent = async (event) => {
  const object = event.data.object;
  const customerId = object.customer || object.id;
  const profile = await UserProfile.findOne({ stripeCustomerId: customerId });
  if (!profile) return;

  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
    profile.plan = 'pro';
    profile.subscriptionStatus = object.status || 'active';
    profile.stripeSubscriptionId = object.subscription || object.id || profile.stripeSubscriptionId;
  }
  if (event.type === 'customer.subscription.deleted') {
    profile.plan = 'free';
    profile.subscriptionStatus = 'cancelled';
    profile.stripeSubscriptionId = '';
  }
  await profile.save();
};

module.exports = {
  getStripe,
  requireStripe,
  createCheckoutSession,
  createPortalSession,
  updateSubscriptionFromEvent,
};
