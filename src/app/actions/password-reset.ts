"use server";

import { headers } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, evictExpired } from "@/lib/rate-limit";
import { generateToken, hashToken, addMinutes } from "@/lib/tokens";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------
export type ForgotState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export type ResetState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; field?: "password" | "confirmPassword" };

// ---------------------------------------------------------------------------
// requestPasswordReset — sends a reset email if the account exists.
// Always returns success to prevent account enumeration.
// ---------------------------------------------------------------------------
const forgotSchema = z.object({ email: z.email() });

async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return (
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ??
    hdrs.get("x-real-ip") ??
    "unknown"
  );
}

export async function requestPasswordReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  evictExpired();
  const ip = await getClientIp();
  if (!checkRateLimit(`forgot:${ip}`, 5)) {
    return { status: "error", message: "Too many requests. Please wait a minute." };
  }

  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    const { token, hash } = generateToken();

    // Replace any existing token for this user.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt: addMinutes(60),
      },
    });

    const sendResult = await sendPasswordResetEmail(email, token);
    if (!sendResult.ok) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      console.error(
        "requestPasswordReset: email send failed (token rolled back):",
        sendResult.message,
      );
    }
  }

  // Always return success to avoid leaking whether the email exists.
  return { status: "success" };
}

// ---------------------------------------------------------------------------
// resetPassword — validates token, updates password, deletes token.
// ---------------------------------------------------------------------------
const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path[0] as "password" | "confirmPassword" | undefined;
    return { status: "error", message: issue.message, field };
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true } } },
  });

  if (!record || record.expiresAt < new Date()) {
    return {
      status: "error",
      message: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user.id },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { tokenHash } }),
  ]);

  return { status: "success" };
}
