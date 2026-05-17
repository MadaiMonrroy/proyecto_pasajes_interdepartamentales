const axios = require('axios');
async function enviarCorreo(para, asunto, html) {
  console.log('BREVO_API_KEY existe:', !!process.env.BREVO_API_KEY);
  console.log('BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL);
  return await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        name: 'Sistema de Pasajes',
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [
        {
          email: para
        }
      ],
      subject: asunto,
      htmlContent: html
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
}

module.exports = { enviarCorreo };