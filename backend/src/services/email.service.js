const axios = require('axios');

async function enviarCorreo(para, asunto, html) {
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