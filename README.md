# Puebla ’26

Trip site for Alec, Sullivan, Jack and Patrick, Oct 19–28, 2026.

- **Itinerary** (`/`): the week grid, day-by-day plan, notes and booking links.
- **Journal** (`/journal`): four sections, one per person. Post daily entries with photos, comment on each other's. Behind a shared trip passcode.

Next.js on Vercel. Posts and photos are stored in a **private Vercel Blob store**, so there's no separate database account.

## Setup

### 1. Push to GitHub

The folder is already a git repo with one commit. Create an empty repo on GitHub (no README), then:

```bash
cd puebla-trip
git remote add origin https://github.com/<you>/puebla-trip.git
git push -u origin main
```

### 2. Import into Vercel

1. In Vercel: **Add New → Project**, pick the repo. Leave the build settings as they are.
2. Open **Environment Variables** and add `TRIP_PASSCODE` with the password you'll give the group.
3. Click **Deploy**.

### 3. Add the Blob store

1. In the project, open the **Storage** tab → **Create** → **Blob**.
2. Set access to **Private**. The app expects a private store and uploads fail on a public one.
3. Connect it to the project for all environments. Vercel adds the Blob credentials to the project on its own.
4. Go to **Deployments**, open the ⋯ menu on the latest one and click **Redeploy**, so the new credentials take effect.

### 4. Test it

Open `your-site.vercel.app/journal`, pick your name, enter the passcode, and post something with a photo. Then send the link and passcode to the group.

## Free plan limits (Hobby)

Vercel Blob is free on Hobby within these monthly limits. If you go over, Vercel doesn't charge you. It locks Blob for 30 days instead, so the journal would stop working.

| Limit | Included | What uses it |
|---|---|---|
| Storage | 1 GB | Photos are shrunk to ~1600 px on the phone, roughly 200–400 KB each |
| Writes ("advanced operations") | 2,000 | 1 per photo, 1 per post, comment, edit or delete |
| Uncached reads ("simple operations") | 10,000 | 1 per post, comment, edit or delete, plus the first view of each photo |

Rough budget for the whole group: about 1,000 photos plus a few hundred posts and comments. Check usage in Vercel under **Observability → Blob**. Avoid clicking around the store in the Vercel dashboard, because dashboard browsing counts as operations too.

## How the journal works

- First visit: pick your name and enter the passcode. A cookie keeps you signed in on that phone for 90 days.
- Pick a day at the top (it defaults to today while you're in Puebla) and write in your own section.
- You can edit or delete your own entries and comments. Anyone can comment on anything.
- New posts from others show up within about a minute. The page refreshes every 30 seconds and whenever you come back to the tab.
- All posts live in one file, `journal/data.json`, and photos sit under `photos/<name>/`. Both are private, and photos only load for signed-in people.
- The passcode is shared, so anyone who has it can post as any of the four names. Don't post it anywhere public. Changing `TRIP_PASSCODE` signs everyone out.

## Run it locally (optional)

```bash
npm install
npm i -g vercel
vercel link              # connect to the Vercel project
vercel env pull .env.local
npm run dev              # http://localhost:3000
```

Local dev uses the same Blob store as the live site.

## Editing the trip

- Schedule and day cards: `lib/itinerary.ts`
- Notes, booking table, sources: `lib/content.ts`
- People and journal dates: `lib/people.ts`

Push to `main` and Vercel redeploys automatically.
