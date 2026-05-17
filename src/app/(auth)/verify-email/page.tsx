import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export const metadata: Metadata = { title: "Verify email — Mathematics Inc." };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <Result ok={false} message="No verification token found." />;
  }

  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, emailVerified: true } } },
  });

  if (!record) {
    return (
      <Result
        ok={false}
        message="This verification link is invalid or has already been used."
      />
    );
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { tokenHash } });
    return (
      <Result
        ok={false}
        message="This verification link has expired. Please register again or contact an admin."
      />
    );
  }

  // Mark verified and delete the token in one transaction.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.delete({ where: { tokenHash } }),
  ]);

  return (
    <Result ok message="Your email is verified! You can now sign in." />
  );
}

function Result({ ok, message }: { ok: boolean; message: string }) {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">
        {ok ? "Email verified" : "Verification failed"}
      </h1>
      <p className="mb-6 text-sm text-foreground/60">{message}</p>
      {ok ? (
        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
      ) : (
        <p className="text-sm text-foreground/60">
          <Link href="/register" className="underline underline-offset-2 hover:text-foreground">
            Back to register
          </Link>
        </p>
      )}
    </>
  );
}
