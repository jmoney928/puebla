// Shared by the server (validation) and the client (picker). Order here is the order they show in.
export const REACTIONS = [
  { key: "like", emoji: "👍", label: "Like" },
  { key: "love", emoji: "❤️", label: "Love" },
  { key: "laugh", emoji: "😂", label: "Laugh" },
  { key: "skull", emoji: "💀", label: "Skull" },
  { key: "cry", emoji: "😭", label: "Cry" },
  { key: "omg", emoji: "😮", label: "OMG" },
  { key: "cool", emoji: "😎", label: "Cool" },
  { key: "taco", emoji: "🌮", label: "Taco" },
  { key: "mexico", emoji: "🇲🇽", label: "Mexico" },
] as const;

export type ReactionKey = (typeof REACTIONS)[number]["key"];
export const isReactionKey = (k: unknown): k is ReactionKey => REACTIONS.some((r) => r.key === k);

/** Who reacted: a random per-phone id (so you can un-react) and the name they comment with, if any. */
export type Reactor = { d: string; n: string };
/** target id (post or comment) → reaction key → who */
export type ReactionMap = Record<string, Partial<Record<ReactionKey, Reactor[]>>>;
