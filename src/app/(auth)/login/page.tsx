import Link from "next/link";
import type { Metadata } from "next";

import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { isGoogleAuthConfigured } from "@/lib/google-auth";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · Mathematics, Inc.",
};

export default function LoginPage() {
  const showGoogle = isGoogleAuthConfigured();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-foreground/60">
          Sign in to browse the directory.
        </p>
      </header>

      {showGoogle && (
        <>
          <GoogleSignIn />
          <AuthDivider />
        </>
      )}

      <LoginForm />

      <p className="text-center text-sm text-foreground/60">
        New to Mathematics, Inc.?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
