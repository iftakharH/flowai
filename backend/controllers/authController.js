const { publicProfile, getOrCreateProfile } = require('../services/profileService.js');

const getMe = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user);

    res.json({ uid: req.user._id, ...publicProfile(profile) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
};
