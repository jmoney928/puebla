# Puebla ’26

Trip site for Alec, Sullivan, Jack and Patrick, Oct 19–28, 2026.

- **Itinerary** (`/`): the week grid, day-by-day plan, notes and booking links.
- **Blog** (`/blog`): Jack's trip blog, newest post first. Anyone can read and comment. Only Jack can post, through the small "Jack's login" link at the bottom.

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
2. Open **Environment Variables** and add `JACK_PASSWORD` with the password Jack will use to post. (An existing `TRIP_PASSCODE` also works as a fallback.)
3. Click **Deploy**.

### 3. Add the Blob store

1. In the project, open the **Storage** tab → **Create** → **Blob**.
2. Set access to **Private**. The app expects a private store and uploads fail on a public one.
3. Connect it to the project for all environments. Vercel adds the Blob credentials to the project on its own.
4. Go to **Deployments**, open the ⋯ menu on the latest one and click **Redeploy**, so the new credentials take effect.

### 4. Test it

Open `your-site.vercel.app/blog`, scroll to the bottom, click **Jack’s login**, enter the password and post something with a photo. Then send the link to whoever you want reading it.

## Free plan limits (Hobby)

Vercel Blob is free on Hobby within these monthly limits. If you go over, Vercel doesn't charge you. It locks Blob for 30 days instead, so the blog would stop working.

| Limit | Included | What uses it |
|---|---|---|
| Storage | 1 GB | Photos are shrunk to ~1600 px on the phone, roughly 200–400 KB each. Videos aren’t shrunk: a 30-second phone clip is ~40–60 MB, so 1 GB fits about 15–20 clips plus photos |
| Writes ("advanced operations") | 2,000 | 1 per photo, 1 per post, comment, edit or delete |
| Uncached reads ("simple operations") | 10,000 | 1 per post, comment, edit or delete, plus the first view of each photo |

Rough budget for the whole group: about 1,000 photos plus a few hundred posts and comments. Check usage in Vercel under **Observability → Blob**. Avoid clicking around the store in the Vercel dashboard, because dashboard browsing counts as operations too.

## How the blog works

- **Posts are editorial:** a main story at the top, then "moments". Each moment is one photo, a group of photos, or a video, with what was going on written beside it. Sides alternate on computers; on phones the text sits under the pictures. Jack adds moments with "+ Add a moment" and can reorder or remove them. Old posts with a plain photo grid still show the same; editing one turns its photos into a single moment.
- **Videos:** up to 60 seconds and 100 MB each, 4 per post. They upload straight from Jack's phone to the Blob store (the site's own upload limit is 4.5 MB) and play in the post.

- Posts show newest first. Each has a day tag (Oct 19–28), an optional title, text and photos.
- Jack logs in once with the link at the bottom of the blog. A cookie keeps him logged in on that phone for 90 days. Once logged in, he gets a "New post" box at the top, edit and delete on every post, and an × to delete any comment.
- Anyone can comment with just a name; the name is remembered on their phone. A hidden spam trap blocks most bots, and Jack can delete anything that slips through.
- Photos are shrunk to ~1600 px on the phone before upload and served from the site with long caching.
- New posts show up for readers within about a minute.
- Everything lives in a private Blob store: posts and comments in `journal/data.json`, photos under `photos/`.

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
- Blog trip dates: `lib/people.ts`

Push to `main` and Vercel redeploys automatically.
