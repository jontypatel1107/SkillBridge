import { env } from "../config/env";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendMail(options: MailOptions): Promise<void> {
  if (env.smtp.host) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
    await transporter.sendMail({
      from: env.smtp.from || env.smtp.user,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } else {
    console.log(`\n[EMAIL] To: ${options.to}`);
    console.log(`[EMAIL] Subject: ${options.subject}`);
    console.log(`[EMAIL] Body: ${options.html}\n`);
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, code: string, purpose: "forgot-password" | "verify-email") {
  const subject = purpose === "forgot-password"
    ? "SkillBridge — Reset Your Password"
    : "SkillBridge — Verify Your Email";

  const heading = purpose === "forgot-password"
    ? "Password Reset Request"
    : "Email Verification";

  const body = purpose === "forgot-password"
    ? "We received a request to reset your password. Use the code below to proceed."
    : "Use the code below to verify your email address.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 12px; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">SkillBridge</h1>
      </div>
      <div style="padding: 32px 0;">
        <h2 style="color: #161522; font-size: 18px;">${heading}</h2>
        <p style="color: #6B6B7B; font-size: 14px; line-height: 1.6;">${body}</p>
        <div style="background: #F8F9FC; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4F46E5;">${code}</span>
        </div>
        <p style="color: #6B6B7B; font-size: 13px;">This code expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div style="border-top: 1px solid #E7E6F0; padding-top: 16px; text-align: center;">
        <p style="color: #9C9AB5; font-size: 12px;">SkillBridge — Learn. Teach. Earn.</p>
      </div>
    </div>
  `;

  await sendMail({ to: email, subject, html });
}
