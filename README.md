# Puebla ’26

Trip site for Alec, Sullivan, Jack and Patrick, Oct 19–28, 2026.

- **Itinerary** (`/`): the week grid, day-by-day plan, notes and booking links.
- **Journal** (`/journal`): four sections, one per person. Each person posts daily entries with photos, and everyone can comment. It's behind a shared trip passcode.

Built with Next.js (App Router) and Supabase (Postgres + Storage), deployed on Vercel.

## Setup (about 15 minutes)

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste in everything from `supabase/schema.sql` and run it. That creates the `entries` and `comments` tables and the `trip-photos` storage bucket.
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` / publishable key
   - `service_role` / secret key (keep this one private)

### 2. Run it locally (optional)

```bash
cp .env.example .env.local   # fill in the four values
npm install
npm run dev                  # http://localhost:3000
```

### 3. Push to GitHub

```bash
git init            # skip if the folder already has .git
git add .
git commit -m "Puebla trip site"
git branch -M main
git remote add origin https://github.com/<you>/puebla-trip.git
git push -u origin main
```

### 4. Deploy on Vercel

1. In Vercel, click **Add New → Project** and import the GitHub repo. The framework is detected as Next.js automatically.
2. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key |
   | `TRIP_PASSCODE` | the password the four of you will type once |

3. Deploy. Send the URL and the passcode to the group chat.

If you change an env var later, redeploy so it takes effect.

## How the journal works

- On first visit, each person picks their name and types the trip passcode. The phone remembers it.
- Pick a day at the top (it defaults to today while you're in Puebla), then write in your own section. Add as many photos as you want.
- Photos are shrunk to ~2000 px JPEGs on the phone before upload, then go straight to Supabase Storage.
- You can edit or delete your own entries and comments. Everyone can comment on anything.
- The page refreshes itself every 20 seconds and whenever you come back to the tab.

### Security, briefly

- Every journal read and write goes through the server and checks the passcode. The database tables have no public access.
- Photos sit in a public bucket under random file names, so a photo can only be opened by someone who already has its link.
- The passcode is shared, so anyone who has it can post as any of the four names. That's fine for four friends, but don't post the passcode anywhere public.

## Editing the trip

- Schedule and day cards: `lib/itinerary.ts`
- Notes, booking table, sources: `lib/content.ts`
- People and trip dates for the journal: `lib/people.ts` (if you add or rename someone, update the `check (author in (...))` lines in `supabase/schema.sql` too)

Push to `main` and Vercel redeploys automatically.
