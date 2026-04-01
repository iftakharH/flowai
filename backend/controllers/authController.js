const { registerUser, loginUser } = require('../services/authService.js');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userData = await registerUser({ name, email, password });
    res.status(201).json(userData);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userData = await loginUser({ email, password });
    res.json(userData);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
