"use client";

import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  PRIMARY_DEMO_ACCOUNT,
} from "@/lib/demo-accounts";

type Props = {
  onUseDemo: (email: string, password: string) => void;
};

export function DemoLoginHint({ onUseDemo }: Props) {
  return (
    <details className="rounded-md border border-foreground/10 bg-foreground/[0.03] text-sm">
      <summary className="cursor-pointer select-none px-3 py-2 font-medium text-foreground/80 hover:text-foreground">
        Try a demo account
      </summary>
      <div className="flex flex-col gap-2 border-t border-foreground/10 px-3 py-3 text-foreground/70">
        <p>
          Pre-seeded mathematicians share password{" "}
          <code className="rounded bg-foreground/5 px-1 py-0.5 font-mono text-xs text-foreground">
            {DEMO_PASSWORD}
          </code>
          . Start with Gauss to see a rendered favorite theorem.
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() =>
              onUseDemo(
                PRIMARY_DEMO_ACCOUNT.email,
                DEMO_PASSWORD,
              )
            }
            className="rounded-md border border-foreground/15 bg-background px-3 py-2 text-left text-foreground transition hover:border-foreground/25 hover:bg-foreground/[0.02]"
          >
            <span className="font-medium">{PRIMARY_DEMO_ACCOUNT.name}</span>
            <span className="mt-0.5 block font-mono text-xs text-foreground/60">
              {PRIMARY_DEMO_ACCOUNT.email}
            </span>
          </button>
          {DEMO_ACCOUNTS.filter(
            (a) => a.email !== PRIMARY_DEMO_ACCOUNT.email,
          ).map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => onUseDemo(account.email, DEMO_PASSWORD)}
              className="rounded-md border border-foreground/10 px-3 py-2 text-left transition hover:border-foreground/20 hover:bg-foreground/[0.02]"
            >
              <span className="font-medium text-foreground/90">
                {account.name}
              </span>
              <span className="mt-0.5 block font-mono text-xs text-foreground/50">
                {account.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
