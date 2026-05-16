const nodemailer = require('nodemailer');
console.log('=== EMAIL SERVICE CARGADO ===');
console.log('SMTP BREVO:', 'smtp-relay.brevo.com');
console.log('BREVO_USER:', process.env.BREVO_USER);
console.log('BREVO_KEY:', process.env.BREVO_SMTP_KEY ? 'EXISTE' : 'NO EXISTE');
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY
  }
});

async function enviarCorreo(para, asunto, html, attachments = []) {

  return await transporter.sendMail({
    from: `"Sistema de Pasajes" <${process.env.BREVO_USER}>`,
    to: para,
    subject: asunto,
    html,
    attachments
  });

}

module.exports = { enviarCorreo };