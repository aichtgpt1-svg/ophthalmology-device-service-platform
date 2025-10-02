import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendMaintenanceAlert(recipient, jobs) {
  const list = jobs.map(j => `- ${j.title} on ${j.serial_number} (${j.model}) – due ${new Date(j.next_due).toLocaleDateString()}`).join('\n');
  const msg = {
    from: `"ODSP Notifier" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: 'ODSP Maintenance Due',
    text: `The following maintenance jobs are due or overdue:\n\n${list}\n\nPlease complete them at your earliest convenience.\n\nODSP Platform`
  };
  await transporter.sendMail(msg);
}