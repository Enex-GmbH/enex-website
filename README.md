# ENEX Fahrzeugpflege — Website

Marketing site and booking flow for **ENEX Fahrzeugpflege**: mobile vehicle detailing and interior cleaning in Baden-Württemberg, with online appointment booking, account area, and admin tools.

Built with [Next.js](https://nextjs.org) (App Router), TypeScript, and Tailwind CSS.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 15, React 19 |
| Styling | Tailwind CSS 4, Radix UI |
| Data | PostgreSQL ([Neon](https://neon.tech)) via [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [NextAuth.js](https://authjs.dev) v5 (credentials + Drizzle adapter) |
| Email | [Resend](https://resend.com) |
| Tests | [Vitest](https://vitest.dev) |

## Requirements

- Node.js 20+ (matching `@types/node` in the project)
- A Neon (or compatible) PostgreSQL `DATABASE_URL`

## Setup

```bash
npm install
```

Copy and configure environment variables (see below), then apply the database schema:

```bash
npm run db:migrate
# or during early development, if you prefer:
# npm run db:push
```

Start the dev server (Turbopack):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` / `npm run test:watch` | Vitest |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:generate` | Generate migrations from schema |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema (dev-friendly; use with care in shared DBs) |

## Environment variables

Create a `.env.local` (or use your host’s env UI). Commonly used variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `NEXTAUTH_SECRET` | Secret for NextAuth session/JWT signing |
| `NEXTAUTH_URL` | Public site URL (e.g. `http://localhost:3000` locally, production URL in prod) — used in emails and calendar links |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL for metadata, sitemap, JSON-LD; falls back to `VERCEL_URL` on Vercel |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Places autocomplete on booking address step |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Google Search Console verification |
| `CALENDAR_ICS_SECRET` | Optional; signed calendar feed tokens (falls back to `NEXTAUTH_SECRET`) |
| `DEFAULT_FRANCHISE_ID` | Default franchise context where applicable |
| `MIGRATION_SECRET` | Protects one-off migration API routes (non-production) |

## Project layout (overview)

- `src/app/` — Routes: marketing home, booking flow, login/register, account, admin, legal pages (`impressum`, `datenschutz`)
- `src/components/` — UI and feature components
- `src/lib/` — Auth, DB, server actions, emails, pricing, validations
- `drizzle/` — SQL migrations
- `scripts/` — Maintenance/migration helpers

## Deployment

The app is a standard Next.js deployment. On [Vercel](https://vercel.com), set `NEXT_PUBLIC_SITE_URL` to your production domain so Open Graph, sitemap, and structured data use the correct origin.

## License

Private — not licensed for public reuse unless explicitly granted by the copyright holder.
