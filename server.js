require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { sendLoginEmailToAdmin } = require('./mailer'); // ✅ fixed import
const User = require('./models/User');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
console.log('🧪 Mongo URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Test route
app.get('/', (req, res) => {
  res.send('✅ Hello from the backend!');
});

// ✅ POST /api/login - Register new user
app.post('/api/login', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already used' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    console.log(`✅ New user registered: ${username} (${email})`);
    res.status(200).json({ message: 'User registered successfully!' });

  } catch (err) {
    console.error('❌ Error during registration:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST /api/signin - Authenticate user login + send Gmail alert
app.post('/api/signin', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // ❌ User doesn't exist, redirect to signup
      await sendLoginEmailToAdmin(email, username); // still notify you
      return res.status(404).json({
        error: 'Account not found. Redirecting to signup...',
        redirect: '/signup.html'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await sendLoginEmailToAdmin(email, username); // notify for wrong password
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // ✅ Successful login
    await sendLoginEmailToAdmin(email, username); // notify for successful login
    console.log(`✅ User logged in: ${username} (${email})`);
    res.status(200).json({ message: 'Login successful!' });

  } catch (err) {
    console.error('❌ Error during signin:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
