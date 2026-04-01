import nodemailer from "nodemailer";

// Replace with your SMTP credentials
const smtpOptions = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

export const sendEmail = async (data, pool = false) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
    pool: pool,
  });

  return await transporter.sendMail({
    from: `tox - HSG Solling <${process.env.SMTP_FROM_EMAIL}>`,
    ...data,
  });
};
