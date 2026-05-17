# Mathematics, Inc.

A virtual employee directory for the mathematicians of Mathematics, Inc. Any employee can register, manage their profile, and browse their colleagues — across departments, theorems, and open conjectures.

## Live app

**https://mathematics-inc.vercel.app**

The directory is pre-seeded with 8 fictional mathematicians. You can sign in as any of them:

| Name | Email | Password |
|---|---|---|
| Emmy Noether | emmy.noether@math-inc.example | theorem1234 |
| Srinivasa Ramanujan | srinivasa.ramanujan@math-inc.example | theorem1234 |
| Carl Friedrich Gauss | carl.gauss@math-inc.example | theorem1234 |
| Maryam Mirzakhani | maryam.mirzakhani@math-inc.example | theorem1234 |
| Alan Turing | alan.turing@math-inc.example | theorem1234 |
| Sofya Kovalevskaya | sofya.kovalevskaya@math-inc.example | theorem1234 |
| Paul Erdős | paul.erdos@math-inc.example | theorem1234 |
| Katherine Johnson | katherine.johnson@math-inc.example | theorem1234 |

Or register a new account — no email verification required.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, React Server Components, Server Actions |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (no component library — keeps the dep graph lean) |
| Auth | [Auth.js v5 (NextAuth)](https://authjs.dev) — Credentials provider, JWT sessions |
| ORM | [Prisma 6](https://prisma.io) |
| Database | [Neon](https://neon.tech) serverless Postgres (free tier) |
| Hosting | [Vercel](https://vercel.com) |
| Password hashing | `bcryptjs` (cost 10) |
| Validation | [Zod 4](https://zod.dev) |

## Setup (local dev)

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9
- A [Neon](https://neon.tech) project (free; takes ~30 s to create)

### Steps

```bash
# 1. Clone & install
git clone https://github.com/charlesblakely0701-star/mathematics-inc.git
cd mathematics-inc
pnpm install          # also runs prisma generate via postinstall

# 2. Configure env
cp .env.example .env.local
# Fill in DATABASE_URL and AUTH_SECRET (see below)

# 3. Push schema to your database
pnpm db:push

# 4. (Optional) Seed demo mathematicians
pnpm db:seed

# 5. Start dev server
pnpm dev
# → http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres connection string. Copy from the Neon dashboard → Connection details → **Pooled connection**. Must include `?sslmode=require`. |
| `AUTH_SECRET` | ✅ | Random 32-byte secret for signing JWT session tokens. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | Only if not on Vercel | Full URL of the deployment, e.g. `http://localhost:3000`. Auth.js auto-detects this on Vercel. |

These go in `.env.local` for local dev and as **Vercel project environment variables** in production. `.env*` is gitignored (only `.env.example` is committed).

## Database / schema notes

```
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  passwordHash      String
  name              String
  title             String?
  department        String?
  bio               String?
  researchInterests String[]
  websiteUrl        String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

- **Single table.** Auth.js v5 with the Credentials provider and JWT sessions requires no `Account`, `Session`, or `VerificationToken` tables. This keeps the schema minimal and the deploy surface small.
- **`department` is `String?`**, not an enum. An enum would require a migration every time someone adds a new department. Free-text is flexible for an MVP; we can promote to an enum + filter later (see "Future improvements").
- **`researchInterests` is a Postgres array.** Stored as `String[]`, comma-delimited in the edit form, rendered as tags in the directory.
- **`passwordHash` is never returned** by any query outside of Auth.js's `authorize` callback. All other queries use an explicit `select` allow-list (`PUBLIC_USER_SELECT` in `src/lib/users.ts`).
- Schema changes are applied with `pnpm db:push` (Prisma's push command, suitable for a DB you own). In a production setting with a shared database you'd use `prisma migrate deploy`.

## Product assumptions

1. **Open registration.** Any employee can sign up with their email — there's no admin approval or invitation flow. Edsger's team is small and trusted.
2. **All registered users can see all profiles.** The directory is auth-gated but not role-gated. There are no private fields.
3. **Email is the identity.** There's no email verification step (that would require an email provider). Employees are expected to register with their work email.
4. **No password reset.** Without an email provider, password reset would require a separate admin flow. Noted as a future improvement.
5. **department is free-text.** Employees can type whatever they want. This avoids a schema migration and a predefined list that might not match how the team thinks about itself.
6. **Profiles are always editable by the owner.** There's no "publish" concept — a profile is visible to the directory as soon as registration is complete.

## Tradeoffs

| Decision | Why |
|---|---|
| Credentials auth over OAuth | No external app registration required. Zero configuration for the evaluator to run locally or deploy. |
| JWT sessions, no Session table | One fewer table, fewer database round trips on every request, works well with Neon's connection-pool limits on the free tier. |
| In-memory search | The directory is small. A DB full-text search would be premature — we'd add `pg_trgm` or Algolia if the employee count grew to thousands. |
| Tailwind primitives over shadcn/ui | Keeps the dependency tree lean and avoids a slow one-time CLI dance on a machine with TLS restrictions. The components are simple enough to build by hand. |
| Free-text department | See assumption 5 above. |

## Future improvements

In rough priority order:

1. **Profile detail pages** (`/directory/[id]`) — read-only view of any employee's full profile.
2. **Department filter** — promote `department` to an enum, add multi-select filter chips to the directory.
3. **Seed script** — seed a handful of fictional mathematicians so the directory isn't empty on first deploy.
4. **Password reset** — requires an email provider (e.g. [Resend](https://resend.com)); straightforward to add once that's in place.
5. **Email verification** — same dependency as password reset.
6. **Avatar upload** via [Vercel Blob](https://vercel.com/docs/storage/vercel-blob); show initials fallback until uploaded.
7. **KaTeX rendering** for a "Favorite theorem" field — the one mathy delight.
8. **Rate limiting** on register/login via `@upstash/ratelimit`.
9. **Admin role** — invite-only registration, ability to remove users.
10. **Tests** — unit tests for Zod schemas (Vitest), integration tests for server actions, E2E with Playwright.
