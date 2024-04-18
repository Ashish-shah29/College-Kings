const nodemailer = require('nodemailer')
require('dotenv').config();

// config transporter
exports.mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    })
    // send mail
    let info = transporter.sendMail({
      from: `Nodejs -Sending Your File`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`
    })
    return info;
  }

  catch (err) {
    res.status(500).json({
      success: false,
      message: "can't send mail"
    })
  }
}