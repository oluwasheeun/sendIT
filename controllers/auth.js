const User = require('../models/Users');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc      Register user
// @route     POST /auth/register
exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    if (!firstName) {
      return res.status(400).json({ message: 'Please enter first name' });
    }
    if (!lastName) {
      return res.status(400).json({ message: 'Please enter last name' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Please enter email' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Please enter password' });
    }
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.log(err.message.red);
    const error = err.message.split(':');
    console.log(error);
    let Error;
    if (error.length == 4) {
      Error =
        'Please add a valid email & password. Password is shorter than the minimum allowed length (8)';
    } else if (error.includes(' password')) {
      Error = 'Password is shorter than the minimum allowed length (8)';
    } else if (error.includes(' email')) {
      Error = 'Please add a valid email';
    } else {
      Error = err.message;
    }

    res.status(400).json({
      success: false,
      message: Error,
    });
  }
};

// @desc      Login user
// @route     POST /auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide an email and password',
      });
    }

    //Check for user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    //check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.log(err.message.red);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc      Get current logged in user
// @route     POST /auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.log(err.message.red);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
