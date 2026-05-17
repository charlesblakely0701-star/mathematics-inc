import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  className,
}: {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <form action={signOutAction} className="inline-flex">
      <Button type="submit" variant={variant} size={size} className={className}>
        Sign out
      </Button>
    </form>
  );
}
