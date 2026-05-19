# Mathematics, Inc.

A virtual employee directory for the mathematicians of Mathematics, Inc. Any employee can register, manage their profile, and browse their colleagues — across departments, theorems, and open conjectures.

## Live app

**https://mathematics-inc.vercel.app**

## Reviewer quickstart

If you only have a few minutes, this path hits the main product surface:

### ~30 seconds

1. Open the [live app](https://mathematics-inc.vercel.app) → **Sign in**
2. Expand **Try a demo account** → choose **Carl Friedrich Gauss** (password `theorem1234` is filled in)
3. Open Gauss’s card → scroll to **Favorite theorem** (Euler’s identity, rendered with KaTeX)
4. Search the directory for `prime` or tap a **department** chip

### ~2 minutes

1. **Register** a new account (email/password) → you land in the directory
2. **My profile** → add bio, interests, and a LaTeX favorite theorem → save
3. Find yourself in the directory; open your public profile at `/directory/[id]`
4. **User menu** → sign out; optional: delete account on `/profile`

### What this demonstrates

| Area | Where to look |
|---|---|
| Auth + sessions | Register, login, logout, optional Google OAuth |
| Data model | Prisma `User`, seed script, Neon Postgres on Vercel |
| Directory UX | Server-rendered grid, client search, department chips |
| Polish | Colorized avatars, KaTeX on detail pages |
| Security | `passwordHash` never in public selects; rate limits on auth actions |
| Engineering | `pnpm test` (Vitest), incremental PR history |

**Re-seed production** (updates demo theorems after deploy): set `DATABASE_URL` locally to the Neon URL, then `pnpm db:seed`.

---

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

Or register a new account with email/password, or use **Continue with Google** (optional; see environment variables).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, React Server Components, Server Actions |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (no component library — keeps the dep graph lean) |
| Auth | [Auth.js v5 (NextAuth)](https://authjs.dev) — Credentials + optional Google OAuth, JWT sessions |
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
| `AUTH_GOOGLE_ID` | Optional | Google OAuth client ID — enables **Continue with Google** on login/register. |
| `AUTH_GOOGLE_SECRET` | Optional | Google OAuth client secret. |
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
3. **No email verification or password reset in MVP.** Register with email/password signs you in immediately. Optional Google OAuth for users who prefer it. Transactional email (Resend) deferred to post-MVP.
4. **department is free-text.** Employees can type whatever they want. This avoids a schema migration and a predefined list that might not match how the team thinks about itself.
5. **Profiles are always editable by the owner.** There's no "publish" concept — a profile is visible to the directory as soon as registration is complete. Users can delete their own account from `/profile`.

## Tradeoffs & decisions (for reviewers)

| Decision | Why |
|---|---|
| Credentials + optional Google | Email/password works out of the box; Google OAuth optional for personal Gmail without email infrastructure. |
| JWT sessions, no Session table | One fewer table, fewer database round trips on every request, works well with Neon's connection-pool limits on the free tier. |
| No email in MVP | Resend without a verified domain only delivers to the account owner — half-working email is worse than deferring it. Register signs you in immediately; Google is the low-friction alternative. |
| In-memory rate limits | Good enough for a single-instance MVP; swap to Upstash when horizontally scaled. |
| In-memory search | The directory is small. A DB full-text search would be premature — we'd add `pg_trgm` or Algolia if the employee count grew to thousands. |
| `PUBLIC_USER_SELECT` allow-list | `passwordHash` is only read in Auth.js `authorize`; every directory/profile query uses an explicit `select`. |
| Tailwind primitives over shadcn/ui | Keeps the dependency tree lean and avoids a slow one-time CLI dance on a machine with TLS restrictions. The components are simple enough to build by hand. |
| Free-text department | See assumption 5 above. |
| Demo accounts on `/login` | Reviewers often skip the README; one-click fill makes the hosted demo frictionless. |

### Tests

```bash
pnpm test    # Vitest — validation schemas, utilities, rate limiting
```

## MVP scope (already shipped)

Core directory experience is in place:

- Auth: register, login, logout, JWT sessions, route protection
- Profiles: view/edit own profile; read-only `/directory/[id]` detail pages
- Directory: server-rendered grid, client search, department filter chips
- Polish: colorized initials avatars, KaTeX “favorite theorem” on detail pages
- Ops: seed script (8 demo users), in-memory rate limits on auth actions, Vitest unit tests (schemas + utilities)
- Auth: optional **Google sign-in**; delete own account on `/profile`; user menu in nav
- No transactional email in MVP (register → immediate sign-in)

## Future improvements

Grouped by **user impact**, not build order.

### Nice-to-have (better UX)

| Item | User experience |
|---|---|
| **Transactional email (Resend)** | Email verification on register, forgot/reset password |
| **GitHub OAuth** | Same pattern as Google |
| **Avatar photos** | Upload a photo; keep initials + color as fallback ([Vercel Blob](https://vercel.com/docs/storage/vercel-blob)) |
| **Profile completeness** | Gentle prompts on `/profile` (“add a bio”, “add interests”) so directory cards are richer |
| **Department consistency** | Optional enum or suggested list so filter chips stay tidy (chips already work with free-text) |
| **Admin basics** | Invite-only registration or ability to remove users — only if the org stops being “open registration” |

### Low-impact (engineering / scale; users rarely notice)

| Item | Why it’s low-impact for this MVP |
|---|---|
| **Distributed rate limiting** (`@upstash/ratelimit`) | In-memory limits already protect auth; matters at multi-instance scale |
| **E2E tests** (Playwright) | Vitest covers validation/utilities; E2E is confidence for refactors, not a user feature |
| **Integration tests** for server actions | Same — quality gate, not product surface |
| **DB full-text search** (`pg_trgm` / Algolia) | Client-side search is fine for tens of employees |
| **Prisma Migrate** in CI | `db:push` is acceptable for a single-owner DB; migrate matters for shared prod |
### Explicitly out of scope for now

- Password reset / email verification (removed from MVP; add back with Resend + domain)

- Role-based private fields or per-department visibility
- Real-time chat, org chart, HRIS sync
- Mobile native apps
