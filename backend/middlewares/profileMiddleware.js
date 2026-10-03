const { getOrCreateProfile } = require('../services/profileService.js');

const attachProfile = async (req, res, next) => {
  try {
    req.profile = await getOrCreateProfile(req.user);
    next();
  } catch (error) {
    next(error);
  }
};

const requirePro = async (req, res, next) => {
  try {
    req.profile = req.profile || await getOrCreateProfile(req.user);
    if (req.profile.plan !== 'pro') {
      return res.status(402).json({
        success: false,
        code: 'PRO_REQUIRED',
        message: 'This feature is available on FlowAI Pro.',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { attachProfile, requirePro };
