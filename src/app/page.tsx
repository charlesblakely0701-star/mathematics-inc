export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-foreground/15 font-serif text-2xl">
          &Sigma;
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Mathematics, Inc.
        </h1>
        <p className="mt-4 text-balance text-base text-foreground/70 sm:text-lg">
          A virtual directory for the mathematicians of Mathematics, Inc. Find
          your future collaborators — across departments, theorems, and
          conjectures.
        </p>
        <p className="mt-10 text-sm text-foreground/50">
          Sign-in and the directory are on the way.
        </p>
      </div>
    </main>
  );
}
