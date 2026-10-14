import { clean, fail, json, mutate, present } from "@/lib/server";
import { isReactionKey } from "@/lib/reactions";

// Public: anyone can react to a post or comment. Tapping the same one again takes it back.
export async function POST(req: Request) {
  const input = await req.json().catch(() => ({}));
  const target = typeof input.target === "string" ? input.target : "";
  const key = input.key;
  const device = typeof input.device === "string" && /^[A-Za-z0-9-]{8,64}$/.test(input.device) ? input.device : "";
  const name = clean(input.name, 40);
  if (!target || !isReactionKey(key)) return fail("That reaction doesn’t exist.");
  if (!device) return fail("Refresh the page and try again.");
  const out = await mutate((j) => {
    if (!j.entries.some((e) => e.id === target) && !j.comments.some((c) => c.id === target)) {
      return fail("That post or comment doesn’t exist anymore.", 404);
    }
    const forTarget = (j.reactions[target] ??= {});
    const who = forTarget[key] ?? [];
    const mine = who.some((r) => r.d === device);
    const next = mine ? who.filter((r) => r.d !== device) : [...who, { d: device, n: name }];
    if (next.length) forTarget[key] = next;
    else delete forTarget[key];
    if (Object.keys(forTarget).length === 0) delete j.reactions[target];
  });
  if (out instanceof Response) return out;
  return json(present(out.data));
}
