import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false, // STARTTLS on 587
  auth: { user: env.smtp.user, pass: env.smtp.pass },
});

export const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"JobLens" <${env.smtp.user}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    // FIXED: use shared logger instead of direct console output.
    logger.error('Email send failed:', err.message);
    return false;
  }
};
