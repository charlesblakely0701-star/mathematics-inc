import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// During development / before domain verification, Resend only delivers to the
// account-owner's email when using the sandbox address. Swap FROM_ADDRESS to a
// verified domain address (e.g. "no-reply@math-inc.com") in production.
const FROM_ADDRESS = "Mathematics Inc. <onboarding@resend.dev>";

function baseUrl(): string {
  // AUTH_URL is already set in Vercel env; falls back to localhost for dev.
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

// ---------------------------------------------------------------------------
// Password reset email
// ---------------------------------------------------------------------------
export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<void> {
  const url = `${baseUrl()}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your Mathematics Inc. password",
    html: passwordResetHtml(url),
    text: `Reset your password: ${url}\n\nThis link expires in 60 minutes.`,
  });
}

// ---------------------------------------------------------------------------
// Email verification email
// ---------------------------------------------------------------------------
export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<void> {
  const url = `${baseUrl()}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Verify your Mathematics Inc. email",
    html: verificationHtml(url),
    text: `Verify your email: ${url}\n\nThis link expires in 24 hours.`,
  });
}

// ---------------------------------------------------------------------------
// HTML templates
// ---------------------------------------------------------------------------
function wrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:40px 16px}
  .card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;max-width:480px;margin:0 auto;padding:40px}
  .brand{font-size:13px;font-weight:600;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:24px}
  h1{font-size:22px;font-weight:700;color:#111827;margin:0 0 12px}
  p{font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px}
  .btn{display:inline-block;background:#111827;color:#fff!important;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none}
  .note{font-size:13px;color:#9ca3af;margin-top:24px}
  .url{word-break:break-all;color:#6b7280;font-size:12px;margin-top:8px}
</style>
</head>
<body>
<div class="card">
  <p class="brand">Mathematics Inc.</p>
  ${body}
</div>
</body>
</html>`;
}

function passwordResetHtml(url: string): string {
  return wrapper(`
    <h1>Reset your password</h1>
    <p>We received a request to reset your password. Click the button below — the link is valid for <strong>60 minutes</strong>.</p>
    <a class="btn" href="${url}">Reset password</a>
    <p class="note">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    <p class="url">${url}</p>
  `);
}

function verificationHtml(url: string): string {
  return wrapper(`
    <h1>Verify your email</h1>
    <p>Welcome to Mathematics Inc.! Click the button below to verify your email address and activate your account.</p>
    <a class="btn" href="${url}">Verify email</a>
    <p class="note">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can ignore this email.</p>
    <p class="url">${url}</p>
  `);
}
