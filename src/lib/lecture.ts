import { enrich, type Doc } from "./store";

export function youtubeId(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const id = host === "youtu.be" ? url.pathname.split("/")[1] : ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host) ? url.searchParams.get("v") ?? (/^\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split("/")[2] : null) : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function sortedNote(title: string, body: string, folders: string[], fallback: string): Doc {
  const result = enrich(`${title} ${body}`, folders, fallback);
  return { id: crypto.randomUUID(), title: title.trim(), body: body + result.table, folder: result.folder, date: new Date().toLocaleDateString("en", { month: "short", day: "numeric" }) };
}
const filler = new Set(["lecture", "lectures", "notes", "note", "part", "chapter", "lesson", "class", "the", "a", "an", "of", "and", "on", "to"]);
export function topicKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w && !filler.has(w) && !/^\d+$/.test(w)).join(" ");
}
export function findTopic<T extends { title: string }>(docs: T[], title: string): T | undefined {
  const key = topicKey(title);
  return key ? docs.find(d => topicKey(d.title) === key) : undefined;
}
export function appendEntry(existing: string, addition: string) {
  const count = (existing.match(/^## Entry \d+/gm) ?? []).length;
  const base = count ? existing : `## Entry 1\n\n${existing.trim()}`;
  return `${base.trimEnd()}\n\n## Entry ${Math.max(count, 1) + 1}\n\n${addition.trim()}\n`;
}
