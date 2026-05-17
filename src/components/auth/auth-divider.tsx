export function AuthDivider() {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-foreground/10" />
      <span className="text-xs text-foreground/40">or</span>
      <span className="h-px flex-1 bg-foreground/10" />
    </div>
  );
}
