const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    req.session.user = {
      email: newUser.email,
      name: newUser.name,
      id: newUser._id
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: req.session.user
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: 'Server error', error });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ code: "USER_NOT_FOUND", message: "User not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: "INVALID_PASSWORD", message: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    req.session.user = {
      email: user.email,
      name: user.name,
      id: user._id
    };

    res.status(200).json({
      message: "Login successful",
      user: req.session.user
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ code: "SERVER_ERROR", message: "Something went wrong" });
  }
};

const submitQuiz = async (req, res) => {
  const userInSession = req.session.user;
  const { quizData } = req.body;

  if (!userInSession || !userInSession.email) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email: userInSession.email },
      { quizData },
      { new: true }
    );

    if (!user) {
      console.error("No user found with email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Quiz data saved successfully" });
  } catch (error) {
    console.error("Quiz Submission Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

module.exports = {
  registerUser,
  loginUser,
  submitQuiz,
  logoutUser,
};

