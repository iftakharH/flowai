const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');

const registerUser = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid user data');
  }
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

module.exports = {
  registerUser,
  loginUser,
};
