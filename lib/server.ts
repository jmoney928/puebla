import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isPerson, type Person } from "./people";

export const BUCKET = "trip-photos";

let admin: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env vars are missing. See README.");
    admin = createClient(url, key, { auth: { persistSession: false } });
  }
  return admin;
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });
export const fail = (message: string, status = 400) => Response.json({ error: message }, { status });

/** Every journal request carries the shared trip passcode and the name of who's posting. */
export function guard(req: Request): { user: Person } | Response {
  const expected = process.env.TRIP_PASSCODE;
  if (!expected) return fail("TRIP_PASSCODE isn't set on the server.", 500);
  if (req.headers.get("x-trip-pass") !== expected) return fail("Wrong passcode.", 401);
  const user = decodeURIComponent(req.headers.get("x-trip-user") ?? "");
  if (!isPerson(user)) return fail("Pick who you are first.", 401);
  return { user };
}

export const publicUrl = (path: string) => db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
