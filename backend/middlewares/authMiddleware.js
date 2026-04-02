const { initializeFirebaseAdmin } = require('../config/firebaseAdmin.js');

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
    };
    next();
  } catch (error) {
    const statusCode = error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error'
      ? 401
      : 500;

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 401
        ? 'Unauthorized - invalid Firebase ID token'
        : 'Auth verification exception',
    });
  }
};

module.exports = { protect };
