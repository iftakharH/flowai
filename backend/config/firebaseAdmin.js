const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// The Firebase project id is a public identifier (it ships in the browser
// bundle), so it is a safe fallback when the deployment is missing env vars.
const DEFAULT_PROJECT_ID = 'flowai-purple';

const normalizeKey = (value) => value.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

const getProjectId = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId && !/your[_-]?project/i.test(projectId)) {
    return projectId;
  }
  return DEFAULT_PROJECT_ID;
};

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON.replace(/\\n/g, '\n'));
      if (parsed.private_key) {
        parsed.private_key = normalizeKey(parsed.private_key);
      }
      return parsed;
    } catch (error) {
      console.error(
        '[firebase] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON; continuing with public-key token verification only.'
      );
    }
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: normalizeKey(FIREBASE_PRIVATE_KEY),
    };
  }

  return null;
};

let firebaseAuth = null;

const initializeFirebaseAdmin = () => {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const projectId = getProjectId();
  const options = { projectId };
  const serviceAccount = getServiceAccount();

  // Verify-only deployments do not need admin credentials: ID token
  // verification uses Google's public keys and the project id for the
  // audience check. A malformed service account must not break sign-in.
  if (serviceAccount) {
    try {
      options.credential = cert(serviceAccount);
    } catch (error) {
      console.error(
        `[firebase] service account rejected (${error.message}); continuing with public-key token verification only.`
      );
    }
  }

  const app = getApps().length ? getApps()[0] : initializeApp(options);
  firebaseAuth = getAuth(app);

  console.log(
    `[firebase] admin initialized (project=${projectId}, credentials=${
      options.credential ? 'service-account' : 'verify-only'
    })`
  );

  return firebaseAuth;
};

module.exports = {
  initializeFirebaseAdmin,
};
