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

Or register a new account — you must verify your email before signing in (see **Environment variables** if mail does not arrive).

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
| `RESEND_API_KEY` | ✅ | API key from [Resend](https://resend.com). Used for sign-up verification and password-reset emails. |
| `RESEND_FROM_EMAIL` | In production | Sender address on a **domain you verify in Resend** (e.g. `hello@yourdomain.com`). Without this, Resend uses `onboarding@resend.dev`, which only delivers to the email tied to your Resend account — not to arbitrary Gmail addresses. |
| `AUTH_GOOGLE_ID` | For Google login | OAuth client ID from Google Cloud Console. |
| `AUTH_GOOGLE_SECRET` | For Google login | OAuth client secret. Enables **Continue with Google** on login/register. |
| `AUTH_URL` | Only if not on Vercel | Full URL of the deployment, e.g. `http://localhost:3000`. Auth.js auto-detects this on Vercel. |

**Personal Gmail / any inbox:** Transactional email APIs do not let you send from a free shared address to every recipient (spam prevention). You need either a **verified domain** in Resend (a domain is often about $10/year) or **OAuth sign-in** (e.g. Google) so users prove email ownership without you sending mail.

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
3. **Email verification.** New accounts receive a verification link via Resend. Login is blocked until the link is used. **Delivering to arbitrary personal addresses requires a verified sending domain** (set `RESEND_FROM_EMAIL` after DNS setup in Resend); the default test sender only reaches the Resend account email.
4. **Password reset** is implemented (forgot-password flow) and uses the same Resend configuration constraints as verification.
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

## MVP scope (already shipped)

Core directory experience is in place:

- Auth: register, login, logout, JWT sessions, route protection
- Profiles: view/edit own profile; read-only `/directory/[id]` detail pages
- Directory: server-rendered grid, client search, department filter chips
- Polish: colorized initials avatars, KaTeX “favorite theorem” on detail pages
- Ops: seed script (8 demo users), in-memory rate limits on auth actions, Vitest unit tests (schemas + utilities)
- Email: verification on register, forgot/reset password, honest errors when Resend rejects a send, **resend verification** on login for unverified accounts
- **Google sign-in** (when `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` are set): any Gmail without Resend domain setup

**To enable personal Gmail today:** set Google OAuth env vars (see `.env.example`). **Alternatively:** verify a domain in Resend and set `RESEND_FROM_EMAIL`. Until then, demo seed accounts and the Resend account email work with the test sender.

## Future improvements

Grouped by **user impact**, not build order.

### Must-have (remaining setup — not more app code)

| Item | What you do |
|---|---|
| **Google OAuth in production** | Create OAuth client in Google Cloud Console; add redirect URI `https://mathematics-inc.vercel.app/api/auth/callback/google`; set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` on Vercel |
| **Or verified Resend domain** | Add domain at resend.com/domains, DNS records, `RESEND_FROM_EMAIL` on Vercel |

### Nice-to-have (better UX, MVP works without them)

| Item | User experience |
|---|---|
| **GitHub OAuth** | Same pattern as Google for developers who prefer GitHub |
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
| **DMARC / deliverability tuning** | After domain verify; marginal until volume grows |

### Explicitly out of scope for now

- Role-based private fields or per-department visibility
- Real-time chat, org chart, HRIS sync
- Mobile native apps
