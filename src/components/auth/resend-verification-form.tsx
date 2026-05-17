"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  resendVerificationAction,
  type ResendVerificationState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

const INITIAL: ResendVerificationState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? "Sending…" : "Resend verification email"}
    </Button>
  );
}

export function ResendVerificationForm({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [state, action] = useActionState(resendVerificationAction, INITIAL);

  if (state.status === "success") {
    return (
      <p className="text-sm text-foreground/70">
        If that account is unverified, we sent a new link. Check your inbox and
        spam folder.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-3">
      {state.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      <input type="hidden" name="email" value={defaultEmail} />
      {!defaultEmail && (
        <Input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      )}
      <SubmitButton />
    </form>
  );
}
