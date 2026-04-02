const admin = require('firebase-admin');

let initialized = false;

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.replace(/\\n/g, '\n');
    return JSON.parse(json);
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return null;
};

const initializeFirebaseAdmin = () => {
  if (initialized) {
    return admin.auth();
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error('Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  return admin.auth();
};

module.exports = {
  initializeFirebaseAdmin,
};
