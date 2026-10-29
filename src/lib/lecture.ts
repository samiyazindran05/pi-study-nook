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