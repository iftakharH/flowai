const { initializeFirebaseAdmin } = require('../config/firebaseAdmin.js');

// Errors caused by the caller's token -> 401. Anything else (network,
// misconfiguration, Google outage) is a server problem -> 503.
const TOKEN_ERROR_CODES = new Set([
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/argument-error',
  'auth/invalid-id-token',
  'auth/invalid-signature',
  'auth/invalid-issuer',
  'auth/invalid-audience',
  'auth/user-disabled',
  'auth/user-not-found',
]);

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - missing Firebase ID token',
      });
    }

    const idToken = match[1];
    const firebaseAuth = initializeFirebaseAdmin();
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    req.user = {
      _id: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || '',
    };
    next();
  } catch (error) {
    const code = error?.code || 'unknown';
    // Never log the token itself; the code is enough to diagnose config issues.
    console.error(`[auth] Firebase ID token verification failed (${code}): ${error?.message || error}`);

    if (TOKEN_ERROR_CODES.has(code)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - invalid or expired session. Please sign in again.',
      });
    }

    return res.status(503).json({
      success: false,
      message: 'Authentication is temporarily unavailable. Please try again.',
    });
  }
};

module.exports = { protect };
