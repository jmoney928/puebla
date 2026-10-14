import { adminCookie, checkPassword, clearCookie, fail, hasPassword, isAdmin, json } from "@/lib/server";

export const dynamic = "force-dynamic";

// Is Jack logged in on this device?
export async function GET(req: Request) {
  return json({ admin: isAdmin(req) }, 200, { "Cache-Control": "private, no-store" });
}

// Jack logs in: { password }
export async function POST(req: Request) {
  if (!hasPassword()) return fail("JACK_PASSWORD isn't set on the server.", 500);
  const { password } = await req.json().catch(() => ({}));
  if (!checkPassword(password)) return fail("Wrong password.", 401);
  return json({ admin: true }, 200, { "Set-Cookie": adminCookie() });
}

// Log out
export async function DELETE() {
  return json({ admin: false }, 200, { "Set-Cookie": clearCookie });
}
