import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account · Mathematics, Inc.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Create your profile
        </h1>
        <p className="text-sm text-foreground/60">
          You can fill in the rest later from the directory.
        </p>
      </header>
      <RegisterForm />
      <p className="text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
