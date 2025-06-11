const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendLoginEmail = require('../mailer');

router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ username, email, password });
    }

    await sendLoginEmail(email, username);
    res.status(200).json({ message: "Login successful and email sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;

