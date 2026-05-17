"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteAccountAction,
  type DeleteAccountState,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Field, FieldHelp, Input, Label } from "@/components/ui/field";

const INITIAL: DeleteAccountState = { status: "idle" };

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" size="md" disabled={pending}>
      {pending ? "Deleting…" : "Delete my account"}
    </Button>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field>
        <Label htmlFor="confirm">Type DELETE to confirm</Label>
        <Input
          id="confirm"
          name="confirm"
          autoComplete="off"
          placeholder="DELETE"
          required
        />
        <FieldHelp>
          This permanently removes your profile from the directory. You can
          register again with the same email afterward.
        </FieldHelp>
      </Field>

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {state.message}
        </p>
      )}

      <DeleteButton />
    </form>
  );
}
