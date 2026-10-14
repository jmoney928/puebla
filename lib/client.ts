"use client";
import { TRIP_DAYS } from "./people";
import type { ReactionMap } from "./reactions";
import { upload } from "@vercel/blob/client";
import { VIDEO_TYPES } from "./media";

/** A photo or a video (video: true). */
export type Photo = { path: string; url: string; video?: boolean };
/** A "moment": photos/videos with what was going on beside them. */
export type Section = { id: string; text: string; media: Photo[] };
export type Entry = { id: string; author: string; day: string; title: string; body: string; photos: Photo[]; sections: Section[]; created_at: string; updated_at: string };
export type Comment = { id: string; entry_id: string; parent_id?: string; name: string; body: string; created_at: string };
export type JournalData = { version: number; entries: Entry[]; comments: Comment[]; reactions: ReactionMap };

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

/** A random id for this phone/browser, so a reaction can be taken back. Not tied to anything else. */
const DEVICE_KEY = "pj_device";
let memDevice = "";
export function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
    return id;
  } catch {
    return (memDevice ||= `m${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`);
  }
}

/** The video's file type, falling back to its name (some phones leave the type blank). */
export function videoType(file: File): string | null {
  if (VIDEO_TYPES[file.type]) return file.type;
  if (/\.mov$/i.test(file.name)) return "video/quicktime";
  if (/\.mp4$/i.test(file.name) || /\.m4v$/i.test(file.name)) return "video/mp4";
  if (/\.webm$/i.test(file.name)) return "video/webm";
  return null;
}

/** Length in seconds, or null if this browser can't read it (we then let the upload through). */
export function videoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (d: number | null) => { URL.revokeObjectURL(url); resolve(d); };
    v.preload = "metadata";
    v.onloadedmetadata = () => done(Number.isFinite(v.duration) ? v.duration : null);
    v.onerror = () => done(null);
    window.setTimeout(() => done(null), 8000);
    v.src = url;
  });
}

/** Videos go straight from the phone to storage (they're too big to pass through the site). */
export async function uploadVideo(file: File, onProgress: (pct: number) => void): Promise<Photo> {
  const type = videoType(file);
  if (!type) throw new ApiError("That video format isn’t supported. Try an MP4 or MOV.", 400);
  const path = `videos/${crypto.randomUUID()}.${VIDEO_TYPES[type]}`;
  try {
    await upload(path, file, {
      access: "private",
      handleUploadUrl: "/api/videos",
      contentType: type,
      multipart: file.size > 15 * 1024 * 1024,
      onUploadProgress: (e) => onProgress(Math.round(e.percentage)),
    });
  } catch (e) {
    throw new ApiError(e instanceof Error && e.message ? `Video upload failed: ${e.message}` : "Video upload failed. Try again.", 0);
  }
  return { path, url: `/api/video?p=${encodeURIComponent(path)}`, video: true };
}
