/**
 * lib/mail.ts
 * 
 * Canonical mail adapter for the event system.
 * Architecture: events.ts → mail.ts → email.ts (nodemailer)
 * 
 * This module provides a generic sendEmail interface used by lib/events.ts.
 * The underlying SMTP transport is provided by lib/email.ts.
 */

import { transporter } from './email';

const SMTP_FROM = process.env.SMTP_FROM || '"Lunavia Team" <no-reply@lunavia.vn>';

interface SendEmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

/**
 * Generic email sender used by the event system.
 * Delegates to the nodemailer transporter from lib/email.ts.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP configuration is missing. Cannot send email.');
    }

    await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        text,
        html,
    });

    console.log(`[SMTP] Email sent to ${to}: ${subject}`);
}
