"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginState } from "@/app/actions/auth";
import { DemoLoginHint } from "@/components/auth/demo-login-hint";
import { Button } from "@/components/ui/button";
import { Field, FieldError, Input, Label } from "@/components/ui/field";

const initialState: LoginState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const formError = state.status === "error" ? state.formError : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <DemoLoginHint
        onUseDemo={(demoEmail, demoPassword) => {
          setEmail(demoEmail);
          setPassword(demoPassword);
        }}
      />

      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={!!fieldErrors.password}
        />
        <FieldError>{fieldErrors.password}</FieldError>
      </Field>

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
