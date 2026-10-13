import { checkPasscode, clearCookie, currentUser, fail, json, sessionCookie } from "@/lib/server";
import { isPerson } from "@/lib/people";

export const dynamic = "force-dynamic";

// Who am I? (used on page load)
export async function GET(req: Request) {
  if (!process.env.TRIP_PASSCODE) return fail("TRIP_PASSCODE isn't set on the server.", 500);
  return json({ user: currentUser(req) });
}

// Sign in: { user, pass }
export async function POST(req: Request) {
  if (!process.env.TRIP_PASSCODE) return fail("TRIP_PASSCODE isn't set on the server.", 500);
  const { user, pass } = await req.json().catch(() => ({}));
  if (!isPerson(user)) return fail("Pick who you are.");
  if (!checkPasscode(pass)) return fail("Wrong passcode.", 401);
  return json({ user }, 200, { "Set-Cookie": sessionCookie(user) });
}

// Sign out
export async function DELETE() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie });
}
