import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20";

const variantClasses: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/90",
  secondary:
    "border border-foreground/15 bg-background hover:bg-foreground/[0.04]",
  ghost: "hover:bg-foreground/[0.06]",
  danger:
    "border border-red-500/30 bg-red-500/5 text-red-700 hover:bg-red-500/10 dark:text-red-400",
};

const sizeClasses: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-xs",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "primary", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      {...props}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    />
  );
});
