const { getOrCreateProfile } = require('../services/profileService.js');

const requireAdmin = async (req, res, next) => {
  try {
    req.profile = req.profile || await getOrCreateProfile(req.user);
    if (!req.profile.isAdmin) return res.status(403).json({ message: 'Admin access required.' });
    next();
  } catch (error) { next(error); }
};

module.exports = { requireAdmin };
