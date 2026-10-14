import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";

/* ---------- responses ---------- */

export const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });
export const fail = (message: string, status = 400) => Response.json({ error: message }, { status });
export const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* ---------- auth: only Jack signs in (to write posts and moderate comments) ---------- */

const COOKIE = "pj_admin";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days
export const AUTHOR = "Jack";

function password() {
  const p = process.env.JACK_PASSWORD || process.env.TRIP_PASSCODE;
  if (!p) throw new Error("JACK_PASSWORD isn't set.");
  return p;
}
export const hasPassword = () => Boolean(process.env.JACK_PASSWORD || process.env.TRIP_PASSCODE);
const sign = () => createHmac("sha256", password()).update(`admin:${AUTHOR}`).digest("base64url");

export function checkPassword(input: unknown) {
  if (typeof input !== "string") return false;
  const a = Buffer.from(input), b = Buffer.from(password());
  return a.length === b.length && timingSafeEqual(a, b);
}

export const adminCookie = () => `${COOKIE}=${sign()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
export const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export function isAdmin(req: Request): boolean {
  if (!hasPassword()) return false;
  const raw = req.headers.get("cookie")?.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const a = Buffer.from(raw), b = Buffer.from(sign());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Use at the top of every write route that only Jack may call. */
export function guardAdmin(req: Request): Response | null {
  if (!hasPassword()) return fail("JACK_PASSWORD isn't set on the server.", 500);
  return isAdmin(req) ? null : fail("Only Jack can do that. Log in at the bottom of the blog.", 401);
}

/* ---------- storage: one private JSON file + private photos in Vercel Blob ---------- */

export type StoredEntry = { id: string; author: string; day: string; title?: string; body: string; photos: string[]; created_at: string; updated_at: string };
export type StoredComment = { id: string; entry_id: string; name: string; body: string; created_at: string };
export type Journal = { version: number; entries: StoredEntry[]; comments: StoredComment[] };

const DATA = "journal/data.json";
const empty = (): Journal => ({ version: 0, entries: [], comments: [] });

async function readJournal(fresh: boolean): Promise<{ data: Journal; etag: string | null }> {
  const res = await get(DATA, { access: "private", useCache: !fresh });
  if (!res || res.statusCode !== 200) return { data: empty(), etag: null };
  const text = await new Response(res.stream).text();
  return { data: { ...empty(), ...JSON.parse(text) }, etag: res.blob.etag };
}

/** Cached read for polling. It can lag a write by up to ~60 s, so clients keep the highest `version` they've seen. */
export const loadJournal = async () => (await readJournal(false)).data;

/**
 * Read-modify-write with an ETag check, so two people posting at the same moment
 * can't overwrite each other. Retries a few times on conflict.
 */
export async function mutate<T>(fn: (j: Journal) => T | Response): Promise<{ data: Journal; result: T } | Response> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, etag } = await readJournal(true);
    const result = fn(data);
    if (result instanceof Response) return result;
    data.version += 1;
    try {
      await put(DATA, JSON.stringify(data), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
      });
      return { data, result };
    } catch (e) {
      const conflict = e instanceof BlobPreconditionFailedError || (!etag && e instanceof Error && /exist/i.test(e.message));
      if (!conflict) throw e;
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 300));
    }
  }
  return fail("Someone else was saving at the same moment. Try again.", 409);
}

export const photoUrl = (path: string) => `/api/photo?p=${encodeURIComponent(path)}`;

/** What the browser gets: photo paths swapped for URLs on our own photo route. */
export const present = (j: Journal) => ({
  version: j.version,
  entries: [...j.entries]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((e) => ({ ...e, title: e.title ?? "", photos: e.photos.map((p) => ({ path: p, url: photoUrl(p) })) })),
  comments: j.comments.map((c) => ({ ...c, name: c.name ?? (c as { author?: string }).author ?? "Someone" })),
});
