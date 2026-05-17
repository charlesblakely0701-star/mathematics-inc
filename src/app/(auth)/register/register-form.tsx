"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction, type RegisterState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldHelp,
  Input,
  Label,
} from "@/components/ui/field";

const initialState: RegisterState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function RegisterForm({ showGoogleHint = false }: { showGoogleHint?: boolean }) {
  const [state, formAction] = useActionState(registerAction, initialState);
  const fieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};
  const formError = state.status === "error" ? state.formError : undefined;

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-5 py-6 text-sm text-foreground/80 space-y-2">
        <p className="font-semibold text-foreground">Check your inbox!</p>
        <p>
          We sent a verification link to <strong>{state.email}</strong>.
          Click it to activate your account, then sign in.
        </p>
        <p className="text-foreground/50 text-xs">
          The link expires in 24 hours. Check your spam folder if it doesn&apos;t arrive.
        </p>
        {showGoogleHint && (
          <p className="text-foreground/50 text-xs">
            Email not arriving? Use <strong>Continue with Google</strong> on the sign-in page
            instead — no verification email needed.
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field>
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          invalid={!!fieldErrors.name}
        />
        <FieldError>{fieldErrors.name}</FieldError>
      </Field>

      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={!!fieldErrors.email}
        />
        <FieldError>{fieldErrors.email}</FieldError>
      </Field>

      <Field>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={!!fieldErrors.password}
        />
        {fieldErrors.password ? (
          <FieldError>{fieldErrors.password}</FieldError>
        ) : (
          <FieldHelp>At least 8 characters.</FieldHelp>
        )}
      </Field>

      <Field>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          invalid={!!fieldErrors.confirmPassword}
        />
        <FieldError>{fieldErrors.confirmPassword}</FieldError>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Number Theorist"
            invalid={!!fieldErrors.title}
          />
          <FieldError>{fieldErrors.title}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            placeholder="e.g. Algebra"
            invalid={!!fieldErrors.department}
          />
          <FieldError>{fieldErrors.department}</FieldError>
        </Field>
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {formError}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
