const User = require('../models/User');

const getProfile = async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const user = await User.findOne({ email: sessionUser.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      subscription: user.subscription || 'free',
      quizData: user.quizData || null,
    });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateName = async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) return res.status(401).json({ message: 'Unauthorized' });

  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });

  try {
    const user = await User.findOneAndUpdate(
      { email: sessionUser.email },
      { name },
      { new: true }
    );
    req.session.user.name = name;
    res.json({ name: user.name });
  } catch (err) {
    console.error('Update name error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSubscription = async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) return res.status(401).json({ message: 'Unauthorized' });

  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ message: 'Subscription required' });

  try {
    const user = await User.findOneAndUpdate(
      { email: sessionUser.email },
      { subscription },
      { new: true }
    );
    res.json({ subscription: user.subscription });
  } catch (err) {
    console.error('Update subscription error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuizData = async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) return res.status(401).json({ message: 'Unauthorized' });

  const { quizData } = req.body;
  if (!quizData) return res.status(400).json({ message: 'quizData required' });

  try {
    const user = await User.findOneAndUpdate(
      { email: sessionUser.email },
      { quizData },
      { new: true }
    );
    res.json({ quizData: user.quizData });
  } catch (err) {
    console.error('Update quiz data error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateName,
  updateSubscription,
  updateQuizData,
};
