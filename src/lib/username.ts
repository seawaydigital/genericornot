import { randomInt } from "node:crypto";

// Public handles are deliberately NOT derived from a person's real name.
// OAuth providers hand us legal names; publishing those next to every vote,
// evidence post and profile URL would disclose personal information without
// meaningful consent (PIPEDA). A friendly random handle keeps contributors
// pseudonymous by default.

const ADJECTIVES = [
  "thrifty", "frugal", "savvy", "canny", "prudent", "clever", "keen", "sharp",
  "wise", "curious", "careful", "honest", "nimble", "steady", "sunny", "brave",
  "calm", "bright", "quick", "humble", "witty", "jolly", "plucky", "cozy",
] as const;

const NOUNS = [
  "beaver", "moose", "loon", "otter", "lynx", "caribou", "puffin", "orca",
  "heron", "marmot", "bison", "chickadee", "walrus", "narwhal", "raven", "fox",
  "owl", "maple", "toque", "canoe", "muskox", "whisky-jack", "sturgeon", "elk",
] as const;

export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

export function generateUsername(): string {
  const adjective = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const noun = NOUNS[randomInt(NOUNS.length)];
  const suffix = randomInt(1000, 10000);
  return `${adjective}-${noun}-${suffix}`;
}
