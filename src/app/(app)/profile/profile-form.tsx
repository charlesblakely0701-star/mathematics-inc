"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  updateProfileAction,
  type ProfileState,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldHelp,
  Input,
  Label,
  Textarea,
} from "@/components/ui/field";
import type { DirectoryUser } from "@/lib/users";

const initialState: ProfileState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function ProfileForm({ user }: { user: DirectoryUser }) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const successRef = useRef<HTMLParagraphElement>(null);
  const fieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};
  const formError = state.status === "error" ? state.formError : undefined;

  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
    }
  }, [state.status]);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.status === "success" && (
        <p
          ref={successRef}
          role="status"
          tabIndex={-1}
          className="rounded-md border border-green-500/30 bg-green-500/5 px-3 py-2 text-sm text-green-700 dark:text-green-400 outline-none"
        >
          Profile saved.
        </p>
      )}

      {formError && (
        <p
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {formError}
        </p>
      )}

      <Field>
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={user.name}
          required
          invalid={!!fieldErrors.name}
        />
        <FieldError>{fieldErrors.name}</FieldError>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={user.title ?? ""}
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
            defaultValue={user.department ?? ""}
            placeholder="e.g. Algebra"
            invalid={!!fieldErrors.department}
          />
          <FieldError>{fieldErrors.department}</FieldError>
        </Field>
      </div>

      <Field>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={user.bio ?? ""}
          placeholder="A short introduction — what do you work on? What are you curious about?"
          invalid={!!fieldErrors.bio}
        />
        {fieldErrors.bio ? (
          <FieldError>{fieldErrors.bio}</FieldError>
        ) : (
          <FieldHelp>Max 1,000 characters.</FieldHelp>
        )}
      </Field>

      <Field>
        <Label htmlFor="researchInterests">Research interests</Label>
        <Input
          id="researchInterests"
          name="researchInterests"
          defaultValue={user.researchInterests.join(", ")}
          placeholder="e.g. Riemann hypothesis, elliptic curves, modular forms"
          invalid={!!fieldErrors.researchInterests}
        />
        {fieldErrors.researchInterests ? (
          <FieldError>{fieldErrors.researchInterests}</FieldError>
        ) : (
          <FieldHelp>Comma-separated. Shown as tags in the directory.</FieldHelp>
        )}
      </Field>

      <Field>
        <Label htmlFor="websiteUrl">Website</Label>
        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          defaultValue={user.websiteUrl ?? ""}
          placeholder="https://example.com"
          invalid={!!fieldErrors.websiteUrl}
        />
        <FieldError>{fieldErrors.websiteUrl}</FieldError>
      </Field>

      <div className="flex items-center justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  );
}
