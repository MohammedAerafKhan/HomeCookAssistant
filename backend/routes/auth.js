const express = require('express');
const router = express.Router();

const { registerUser, loginUser, submitQuiz, logoutUser } = require('../controllers/authController');
const { getProfile, updateName, updateSubscription, updateQuizData } = require('../controllers/profileController');

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Logout route
router.post('/logout', logoutUser);

// Quiz route
router.post('/submit-quiz', submitQuiz);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile/name', updateName);
router.put('/profile/subscription', updateSubscription);
router.put('/profile/quiz', updateQuizData);

router.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ name: req.session.user.name });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
