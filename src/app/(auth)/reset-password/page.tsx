import Link from "next/link";
import type { Metadata } from "next";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset password — Mathematics Inc." };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <h1 className="mb-1 text-2xl font-bold tracking-tight">Invalid link</h1>
        <p className="mb-6 text-sm text-foreground/60">
          This reset link is missing a token.{" "}
          <Link href="/forgot-password" className="underline underline-offset-2">
            Request a new one
          </Link>.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Set a new password</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Choose a password that&apos;s at least 8 characters.
      </p>
      <ResetPasswordForm token={token} />
    </>
  );
}
