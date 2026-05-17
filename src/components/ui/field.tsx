import { forwardRef } from "react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={`text-sm font-medium text-foreground/80 ${className}`}
    />
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/20 ${
        invalid
          ? "border-red-500/70 focus-visible:ring-red-500/30"
          : "border-foreground/15"
      } ${className}`}
      {...props}
    />
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className = "", invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={`min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/20 ${
          invalid
            ? "border-red-500/70 focus-visible:ring-red-500/30"
            : "border-foreground/15"
        } ${className}`}
        {...props}
      />
    );
  },
);

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-red-600 dark:text-red-400">{children}</p>;
}

export function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-foreground/60">{children}</p>;
}

export function Field({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col gap-1.5 ${className}`}>{children}</div>;
}
