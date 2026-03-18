
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"Lunavia Team" <no-reply@lunavia.com>';

// Validate SMTP config
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  // We throw an error here to fail fast if SMTP is not configured, as per requirements.
  // "If SMTP not configured → throw error (no mock, no silent fail)"
  console.error("CRITICAL: SMTP configuration missing.");
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface SendInvitationParams {
  to: string;
  operatorName: string;
  inviteLink: string;
}

export async function sendTeamInvitationEmail({ to, operatorName, inviteLink }: SendInvitationParams) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration is missing. Cannot send email.");
  }

  const subject = `You're invited to join ${operatorName} on Lunavia`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Join ${operatorName} on Lunavia</h2>
      <p style="color: #555; font-size: 16px;">
        Hello,
      </p>
      <p style="color: #555; font-size: 16px;">
        You have been invited to join <strong>${operatorName}</strong> as an <strong>In-House Tour Guide</strong> on Lunavia.
      </p>
      <p style="color: #555; font-size: 16px;">
        As an in-house guide, you will be able to receive direct tour assignments from ${operatorName}.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
      </div>
      <p style="color: #888; font-size: 14px; margin-top: 30px;">
        This invitation link will expire in 7 days. If you did not expect this invitation, you can safely ignore this email.
      </p>
      <p style="color: #aaa; font-size: 12px; margin-top: 20px; text-align: center;">
        Sent via Lunavia Platform
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
  });

  console.log(`[SMTP] Invitation sent to ${to}`);
}

interface SendStaffInviteParams {
  to: string;
  role: string;
  tempPass: string;
}

export async function sendStaffInviteEmail({ to, role, tempPass }: SendStaffInviteParams) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration is missing. Cannot send email.");
  }

  const dashboardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;

  const subject = 'Welcome to Lunavia - Your Staff Account';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4F46E5;">Welcome to Lunavia</h2>
      <p style="color: #555; font-size: 16px;">
        Hello,
      </p>
      <p style="color: #555; font-size: 16px;">
        You have been added as a <strong>${role}</strong> on the Lunavia platform.
      </p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Temporary Password:</p>
        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #111827;">${tempPass}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
        For security, please change your password immediately after logging in.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
  });

  console.log(`[SMTP] Staff invite sent to ${to}`);
}
