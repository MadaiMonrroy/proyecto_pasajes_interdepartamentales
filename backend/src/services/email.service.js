const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function enviarCorreo(para, asunto, html, attachments = []) {
  await transporter.sendMail({
    from: `"Sistema de Pasajes" <${process.env.GMAIL_USER}>`,
    to: para,
    subject: asunto,
    html,
    attachments
  });
}

module.exports = { enviarCorreo };