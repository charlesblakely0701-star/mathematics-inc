"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit, evictExpired } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

const RATE_LIMIT_REGISTER = 5; // attempts per minute per IP
const RATE_LIMIT_LOGIN = 10;

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

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        title,
        department,
      },
      select: { id: true },
    });
  } catch (err) {
    if (isPrismaKnownError(err) && err.code === POSTGRES_UNIQUE_VIOLATION) {
      return {
        status: "error",
        fieldErrors: {
          email: "An account with this email already exists.",
        },
      };
    }
    console.error("registerAction: failed to create user", err);
    return {
      status: "error",
      formError: "Something went wrong creating your account. Please try again.",
    };
  }

  // Sign the new user in. `signIn` throws a redirect — we let it bubble.
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/directory",
    });
  } catch (err) {
    // Auth.js wraps the NEXT_REDIRECT in an AuthError only on genuine auth
    // failure; the redirect itself uses a separate error type that we must
    // re-throw for Next to handle.
    if (err instanceof AuthError) {
      return {
        status: "error",
        formError:
          "Your account was created, but we couldn't sign you in automatically. Please sign in.",
      };
    }
    throw err;
  }

  return { status: "idle" };
}

export type LoginFieldErrors = Partial<
  Record<"email" | "password", string>
>;

export type LoginState =
  | { status: "idle" }
  | { status: "error"; formError?: string; fieldErrors?: LoginFieldErrors };

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

  try {
    await signIn("credentials", {
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/directory",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      // CredentialsSignin is the only failure we expect to bubble.
      return {
        status: "error",
        formError: "Invalid email or password.",
      };
    }
    throw err;
  }

  return { status: "idle" };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

