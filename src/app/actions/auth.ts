"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { isGoogleAuthConfigured } from "@/lib/google-auth";
import { checkRateLimit, evictExpired } from "@/lib/rate-limit";
import { generateToken, addMinutes } from "@/lib/tokens";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

const RATE_LIMIT_REGISTER = 5;
const RATE_LIMIT_LOGIN = 10;
const RATE_LIMIT_RESEND_VERIFY = 3;

async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return (
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ??
    hdrs.get("x-real-ip") ??
    "unknown"
  );
}

const RATE_LIMITED: RegisterState = {
  status: "error",
  formError: "Too many attempts. Please wait a minute and try again.",
};

export type RegisterFieldErrors = Partial<
  Record<
    "email" | "password" | "confirmPassword" | "name" | "title" | "department",
    string
  >
>;

export type RegisterState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | { status: "error"; formError?: string; fieldErrors?: RegisterFieldErrors };

const POSTGRES_UNIQUE_VIOLATION = "P2002";

function isPrismaKnownError(
  err: unknown,
): err is { code: string; meta?: { target?: string[] } } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string"
  );
}

export async function googleSignInAction() {
  if (!isGoogleAuthConfigured()) {
    throw new Error("Google sign-in is not configured.");
  }
  await signIn("google", { redirectTo: "/directory" });
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  evictExpired();
  const ip = await getClientIp();
  if (!checkRateLimit(`register:${ip}`, RATE_LIMIT_REGISTER)) {
    return RATE_LIMITED;
  }

  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    name: String(formData.get("name") ?? ""),
    title: String(formData.get("title") ?? ""),
    department: String(formData.get("department") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: RegisterFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        typeof key === "string" &&
        (key === "email" ||
          key === "password" ||
          key === "confirmPassword" ||
          key === "name" ||
          key === "title" ||
          key === "department") &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password, name } = parsed.data;
  const title = parsed.data.title?.trim() || null;
  const department = parsed.data.department?.trim() || null;

  let userId: string;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, title, department },
      select: { id: true },
    });
    userId = user.id;
  } catch (err) {
    if (isPrismaKnownError(err) && err.code === POSTGRES_UNIQUE_VIOLATION) {
      return {
        status: "error",
        fieldErrors: { email: "An account with this email already exists." },
      };
    }
    console.error("registerAction: failed to create user", err);
    return {
      status: "error",
      formError: "Something went wrong creating your account. Please try again.",
    };
  }

  const { token, hash } = generateToken();
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: hash, expiresAt: addMinutes(60 * 24) },
  });

  const sendResult = await sendVerificationEmail(email, token);
  if (!sendResult.ok) {
    await prisma.user.delete({ where: { id: userId } });
    return {
      status: "error",
      formError: sendResult.message,
    };
  }

  return { status: "success", email };
}

export type LoginFieldErrors = Partial<Record<"email" | "password", string>>;

export type LoginState =
  | { status: "idle" }
  | {
      status: "error";
      formError?: string;
      fieldErrors?: LoginFieldErrors;
      unverifiedEmail?: string;
    };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  evictExpired();
  const ip = await getClientIp();
  if (!checkRateLimit(`login:${ip}`, RATE_LIMIT_LOGIN)) {
    return {
      status: "error",
      formError: "Too many attempts. Please wait a minute and try again.",
    };
  }

  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: LoginFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        typeof key === "string" &&
        (key === "email" || key === "password") &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const email = parsed.data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  if (existing && !existing.emailVerified) {
    return {
      status: "error",
      formError:
        "Please verify your email before signing in. Use the button below to resend the link, or continue with Google if available.",
      unverifiedEmail: email,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/directory",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        status: "error",
        formError: "Invalid email or password.",
      };
    }
    throw err;
  }

  return { status: "idle" };
}

export type ResendVerificationState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const resendSchema = z.object({ email: z.email() });

export async function resendVerificationAction(
  _prev: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  evictExpired();
  const ip = await getClientIp();
  if (!checkRateLimit(`resend-verify:${ip}`, RATE_LIMIT_RESEND_VERIFY)) {
    return {
      status: "error",
      message: "Too many requests. Please wait a minute.",
    };
  }

  const parsed = resendSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    const { token, hash } = generateToken();
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt: addMinutes(60 * 24),
      },
    });

    const sendResult = await sendVerificationEmail(email, token);
    if (!sendResult.ok) {
      return { status: "error", message: sendResult.message };
    }
  }

  return {
    status: "success",
  };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
