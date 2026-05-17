"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import {
  requestPasswordReset,
  type ForgotState,
} from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/field";

const INITIAL: ForgotState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, INITIAL);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-5 py-4 text-sm text-foreground/80">
        If that email is registered, you&apos;ll receive a reset link within a minute.
        Check your spam folder if it doesn&apos;t arrive.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <Field>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </Field>

      <SubmitButton />

      <p className="text-center text-sm text-foreground/60">
        <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
