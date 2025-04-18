import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add TLS configuration
    tls: {
      // Do not fail on invalid certs (useful for testing, but avoid in production)
      rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};