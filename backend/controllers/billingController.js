const {
  createCheckoutSession,
  createPortalSession,
  getStripe,
  updateSubscriptionFromEvent,
} = require('../services/billingService.js');

const startCheckout = async (req, res, next) => {
  try {
    const session = await createCheckoutSession(req.profile, req.body.interval || 'month', process.env.APP_URL || 'http://localhost:5174');
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

const openPortal = async (req, res, next) => {
  try {
    const session = await createPortalSession(req.profile, process.env.APP_URL || 'http://localhost:5174');
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

const getSubscription = async (req, res) => {
  res.json({
    plan: req.profile.plan,
    status: req.profile.subscriptionStatus,
    stripeCustomerId: req.profile.stripeCustomerId || null,
  });
};

const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ message: 'Stripe webhook is not configured' });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    await updateSubscriptionFromEvent(event);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: `Webhook error: ${error.message}` });
  }
};

module.exports = { startCheckout, openPortal, getSubscription, handleWebhook };
