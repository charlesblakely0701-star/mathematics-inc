import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password — Mathematics Inc." };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Forgot password?</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
