import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 font-serif text-lg">
            &Sigma;
          </span>
          Mathematics, Inc.
        </Link>
        <div className="rounded-xl border border-foreground/10 bg-background p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
