import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER
);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

/**
 * Sends an email if SMTP is configured, otherwise logs it safely to stdout for self-hosting dev/local mode.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<boolean> {
  const from = process.env.SMTP_FROM || "SecretWish <noreply@secretwish.local>";

  if (!transporter) {
    if (process.env.NODE_ENV !== "test") {
      console.log("-----------------------------------------");
      console.log(`[EMAIL DISPATCH - SMTP disabled or not configured]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text preview: ${text.slice(0, 200)}...`);
      console.log("-----------------------------------------");
    }
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[Email Error]: Failed to send email", err);
    return false;
  }
}

/**
 * Sends a password reset email.
 */
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const subject = "Passwort zurücksetzen – SecretWish";
  const text = `Hallo!\n\nDu hast angefordert, dein Passwort bei SecretWish zurückzusetzen.\nKlicke auf den folgenden Link, um ein neues Passwort festzulegen:\n\n${resetUrl}\n\nDieser Link ist 2 Stunden gültig. Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail einfach ignorieren.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6366f1;">SecretWish</h2>
      <p>Hallo,</p>
      <p>Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den folgenden Button, um ein neues Passwort festzulegen:</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Passwort jetzt zurücksetzen</a>
      </div>
      <p style="color: #64748b; font-size: 13px;">Dieser Link ist 2 Stunden gültig. Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">Link funktioniert nicht? Kopiere diese URL in deinen Browser:<br/>${resetUrl}</p>
    </div>
  `;

  return await sendEmail({ to, subject, text, html });
}
