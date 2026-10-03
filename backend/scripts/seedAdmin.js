require('dotenv').config();
const mongoose = require('mongoose');
const { initializeFirebaseAdmin } = require('../config/firebaseAdmin.js');
const UserProfile = require('../models/UserProfile.js');

const email = process.env.ADMIN_EMAIL || (process.env.ADMIN_EMAILS || '').split(',')[0].trim() || 'admin@flowai.app';
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 8) {
  throw new Error('Set ADMIN_PASSWORD to an 8+ character password before running the seed script.');
}

(async () => {
  const firebaseAuth = initializeFirebaseAdmin();
  let firebaseUser;
  try {
    firebaseUser = await firebaseAuth.getUserByEmail(email);
    firebaseUser = await firebaseAuth.updateUser(firebaseUser.uid, { password, displayName: 'FlowAI Admin' });
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    firebaseUser = await firebaseAuth.createUser({ email, password, displayName: 'FlowAI Admin', emailVerified: true });
  }

  await mongoose.connect(process.env.MONGO_URI);
  await UserProfile.findOneAndUpdate(
    { firebaseUid: firebaseUser.uid },
    { firebaseUid: firebaseUser.uid, email, displayName: 'FlowAI Admin', isAdmin: true, plan: 'pro', subscriptionStatus: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await mongoose.disconnect();
  console.log(`Admin ready: ${email}`);
  console.log('Use the ADMIN_PASSWORD value from your environment to sign in.');
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
