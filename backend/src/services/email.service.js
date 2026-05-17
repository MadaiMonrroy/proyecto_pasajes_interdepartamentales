const axios = require('axios');

async function enviarCorreo(para, asunto, html, adjuntos = []) {
  const body = {
    sender: {
      name: 'Sistema de Pasajes',
      email: process.env.BREVO_SENDER_EMAIL
    },
    to: [{ email: para }],
    subject: asunto,
    htmlContent: html
  };

  // Agregar adjuntos si los hay
  if (adjuntos.length > 0) {
    body.attachment = adjuntos.map(adj => ({
      name: adj.filename,
      content: Buffer.isBuffer(adj.content)
        ? adj.content.toString('base64')
        : adj.content
    }));
  }

  return await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    body,
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
}

module.exports = { enviarCorreo };