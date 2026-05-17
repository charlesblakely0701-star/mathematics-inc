"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { resetPassword, type ResetState } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Field, FieldError, Input, Label } from "@/components/ui/field";

const INITIAL: ResetState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Set new password"}
    </Button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, INITIAL);

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Your password has been updated successfully.
        </div>
        <Link href="/login">
          <Button variant="primary" size="md" className="w-full">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      {state.status === "error" && !state.field && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}{" "}
          {state.message.includes("invalid") && (
            <Link href="/forgot-password" className="underline">
              Request a new link.
            </Link>
          )}
        </div>
      )}

      <Field>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          invalid={state.status === "error" && state.field === "password"}
        />
        {state.status === "error" && state.field === "password" && (
          <FieldError>{state.message}</FieldError>
        )}
      </Field>

      <Field>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          invalid={state.status === "error" && state.field === "confirmPassword"}
        />
        {state.status === "error" && state.field === "confirmPassword" && (
          <FieldError>{state.message}</FieldError>
        )}
      </Field>

      <SubmitButton />
    </form>
  );
}
