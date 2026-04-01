const { getAuth } = require('@clerk/express');

const protect = (req, res, next) => {
  try {
    const auth = getAuth(req);
    
    // Log the full auth object during debugging so we can see what Clerk returns
    if (!auth?.userId) {
      console.warn('[FLOWAI_AUTH] Failed to extract userId.');
      console.warn('[FLOWAI_AUTH] Auth object:', JSON.stringify(auth, null, 2));
      console.warn('[FLOWAI_AUTH] Authorization header present:', !!req.headers.authorization);
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized — FlowAI Identity Bridge failed. Ensure you are signed in.' 
      });
    }
    
    req.user = { _id: auth.userId };
    console.log(`[FLOWAI_AUTH] Identity verified: ${auth.userId} → ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.error('[FLOWAI_AUTH] Exception:', error.message);
    return res.status(500).json({ message: 'Auth bridge exception' });
  }
};

module.exports = { protect };
