import nodemailer from 'nodemailer';

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_MODE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || EMAIL_MODE === 'dev') return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    // Dev mode or missing SMTP config: return the composed message so caller can return the link in response
    return { devMode: true, to, subject, text, html };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  });

  return { devMode: false, info };
};

export default sendEmail;
