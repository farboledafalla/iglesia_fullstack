const nodemailer = require('nodemailer');

// Configuración para Gmail (solo para pruebas/desarrollo)
// El tls es para que no de error de certificado en este caso es para ignorar certificados autofirmados (Solo para pruebas)
const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: 'frankdevsendmail@gmail.com',
      pass: 'opgp tziy wdxx oemu',
   },
   tls: {
      rejectUnauthorized: false, // <--- Agrega esto
   },
});

// Función para enviar email
async function sendMail({ to, subject, text, html }) {
   const mailOptions = {
      from: '"App Iglesia Jailer" <frankdevsendmail@gmail.com>',
      to,
      subject,
      text,
      html,
   };
   return transporter.sendMail(mailOptions);
}

module.exports = sendMail;
