"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { TRIP_DAYS } from "./people";

export type Photo = { path: string; url: string };
export type Entry = { id: string; author: string; day: string; body: string; photos: Photo[]; created_at: string; updated_at: string };
export type Comment = { id: string; entry_id: string; author: string; body: string; created_at: string };
export type Session = { user: string; pass: string };

const KEY = "puebla-journal-session";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && typeof s.user === "string" && typeof s.pass === "string" ? s : null;
  } catch {
    return null;
  }
}
export function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the session just won't persist */
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, s: Session, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? "GET",
      cache: "no-store",
      headers: { "content-type": "application/json", "x-trip-pass": s.pass, "x-trip-user": encodeURIComponent(s.user) },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError("No connection. Check your signal and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Try again.", res.status);
  return data as T;
}

let browserClient: SupabaseClient | null = null;
function storage() {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new ApiError("Photo uploads aren’t set up yet (missing Supabase env vars).", 500);
    browserClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return browserClient.storage;
}

/** Shrink phone photos to ~2000px JPEGs before upload. Falls back to the original file. */
export async function compressImage(file: File, max = 2000, quality = 0.85): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob) return blob;
  } catch {
    /* fall through */
  }
  return file;
}

export async function uploadPhoto(file: File, s: Session): Promise<Photo> {
  const blob = await compressImage(file);
  const { path, token, url } = await api<{ path: string; token: string; url: string }>("/api/upload-url", s, { method: "POST", body: {} });
  const { error } = await storage().from("trip-photos").uploadToSignedUrl(path, token, blob, { contentType: blob.type || "image/jpeg" });
  if (error) throw new ApiError(`Couldn’t upload ${file.name}. Try a JPG or PNG.`, 500);
  return { path, url };
}

/** Today's date in Puebla if it's a trip day, otherwise null. */
export function tripToday(): string | null {
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
  return TRIP_DAYS.some((d) => d.iso === iso) ? iso : null;
}

export const postedAt = (ts: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" }).format(new Date(ts));
