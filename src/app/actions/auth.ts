"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";

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
