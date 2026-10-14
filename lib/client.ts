"use client";
import { TRIP_DAYS } from "./people";

export type Photo = { path: string; url: string };
export type Entry = { id: string; author: string; day: string; title: string; body: string; photos: Photo[]; created_at: string; updated_at: string };
export type Comment = { id: string; entry_id: string; parent_id?: string; name: string; body: string; created_at: string };
export type JournalData = { version: number; entries: Entry[]; comments: Comment[] };

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { cache: "no-store", credentials: "same-origin", ...init });
  } catch {
    throw new ApiError("No connection. Check your signal and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Try again.", res.status);
  return data as T;
}

export const api = <T>(path: string, init: { method?: string; body?: unknown } = {}) =>
  send<T>(path, {
    method: init.method ?? "GET",
    headers: init.body === undefined ? undefined : { "content-type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

/** Shrink phone photos to ~1600px JPEGs before upload. Falls back to the original file. */
export async function compressImage(file: File, max = 1600, quality = 0.82): Promise<Blob> {
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

export async function uploadPhoto(file: File): Promise<Photo> {
  const blob = await compressImage(file);
  const form = new FormData();
  form.append("file", blob, blob === file ? file.name : "photo.jpg");
  return send<Photo>("/api/photos", { method: "POST", body: form });
}

/** Today's date in Puebla if it's a trip day, otherwise null. */
export function tripToday(): string | null {
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
  return TRIP_DAYS.some((d) => d.iso === iso) ? iso : null;
}

export const postedAt = (ts: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" }).format(new Date(ts));

const NAME_KEY = "puebla-blog-name";
export const loadName = () => { try { return localStorage.getItem(NAME_KEY) ?? ""; } catch { return ""; } };
export const saveName = (n: string) => { try { localStorage.setItem(NAME_KEY, n); } catch { /* ignore */ } };
