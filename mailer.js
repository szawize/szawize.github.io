
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// This sends email to YOU when someone logs in
async function sendLoginEmailToAdmin(userEmail, username) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `🔐 New Login - ${username}`,
    html: `
      <h3>New Roblox-Themed Login Detected</h3>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Login alert sent to admin for ${username}`);
}

module.exports = { sendLoginEmailToAdmin };
