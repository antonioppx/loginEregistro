import nodemailer from 'nodemailer';

// Transporter de teste (Ethereal)
export const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'kristy.dibbert80@ethereal.email',
    pass: 'TDWWJagSCacUxCgeQq'
  }
});

export async function sendConfirmationEmail(to, code) {
  const info = await transporter.sendMail({
    from: 'noreply@seudominio.com',
    to,
    subject: 'Confirmação de Cadastro',
    text: `Seu código de confirmação é: ${code}`
  });
  console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
} 