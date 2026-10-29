import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Folder, Plus, FileText, Loader2, Sparkles, PenLine, X } from "lucide-react";
import { toast } from "sonner";
import { usePersisted, enrich, type Doc } from "@/lib/store";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Compile — Intelligent Notes Hub" },
      { name: "description", content: "Subject folders and a markdown editor that auto-adds key formulas." },
      { property: "og:title", content: "Compile — Intelligent Notes Hub" },
      { property: "og:description", content: "Subject folders and a smart markdown notepad." },
    ],
  }),
  component: Notes,
});

const seed: Doc[] = [
  { id: "a", title: "Wave Optics", body: "# Wave Optics\nInterference, diffraction…", folder: "Physics", date: "Oct 21" },
  { id: "b", title: "Organic Reactions", body: "# Organic\nSN1 vs SN2…", folder: "Chemistry", date: "Oct 24" },
  { id: "c", title: "Matrices", body: "# Matrices\nDeterminants…", folder: "Maths", date: "Oct 26" },
];

function Notes() {
  const [folders, setFolders] = usePersisted("compile.folders", ["Physics", "Chemistry", "Maths"]);
  const [docs, setDocs] = usePersisted<Doc[]>("compile.docs", seed);
  const [view, setView] = useState<string | null>(null); // null = editor
  const [open, setOpen] = useState<Doc | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const addFolder = () => {
    const name = prompt("New subject folder name")?.trim();
    if (name && !folders.includes(name)) { setFolders([...folders, name]); setView(name); }
  };

  const save = () => {
    if (!title.trim()) { toast.error("Give your note a title first"); return; }
    setBusy(true);
    setTimeout(() => {
      const { table, folder } = enrich(title, folders, view ?? folders[0] ?? "Physics");
      const finalBody = body + table;
      setBody(finalBody);
      setTimeout(() => {
        setDocs((d) => [{ id: crypto.randomUUID(), title, body: finalBody, folder, date: new Date().toLocaleDateString("en", { month: "short", day: "numeric" }) }, ...d]);
        setTitle(""); setBody(""); setBusy(false);
        toast.success(`Saved to ${folder}`, { description: table ? "Key formulas appended ✨" : "Filed and ready." });
      }, 500);
    }, 1500);
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[240px_1fr]">
      <aside className="panel fade-up h-fit p-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Subjects</span>
          <button onClick={addFolder} className="rounded-lg p-1 text-primary hover:bg-muted" aria-label="Add folder"><Plus size={18} /></button>
        </div>
        <button onClick={() => setView(null)} className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${view === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
          <PenLine size={16} /> New note
        </button>
        {folders.map((f) => (
          <button key={f} onClick={() => setView(f)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${view === f ? "bg-secondary text-primary" : "hover:bg-muted"}`}>
            <Folder size={16} /> <span className="flex-1">{f}</span>
            <span className="text-xs text-muted-foreground">{docs.filter((d) => d.folder === f).length}</span>
          </button>
        ))}
      </aside>

      {view === null ? (
        <section key="editor" className="panel fade-up flex min-h-[70vh] flex-col p-6">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title — e.g. Thermodynamics"
            className="bg-transparent text-3xl font-semibold outline-none placeholder:text-muted-foreground/50" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} disabled={busy}
            placeholder={"# Heading\n- bullet points\n**bold** ideas…"}
            className="mt-4 flex-1 resize-none rounded-xl border border-input bg-background/50 p-4 font-mono text-sm leading-relaxed outline-none focus:border-primary" />
          <div className="mt-4 flex justify-end">
            <button onClick={save} disabled={busy} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:scale-[1.03] disabled:opacity-70">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {busy ? "Sorting…" : "Auto Sort & Save"}
            </button>
          </div>
        </section>
      ) : (
        <section key={view} className="fade-up">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold">{view}</h1>
            <button onClick={addFolder} className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/10 px-4 py-2.5 font-medium text-primary transition hover:bg-primary hover:text-primary-foreground">
              <Plus size={18} /> Create New Subject
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button onClick={() => setView(null)} className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary">
              <PenLine /> Write a note
            </button>
            {docs.filter((d) => d.folder === view).map((d) => (
              <button key={d.id} onClick={() => setOpen(d)} className="panel fade-up min-h-36 p-5 text-left transition hover:-translate-y-1 hover:border-primary/50">
                <FileText className="text-primary" size={20} />
                <h3 className="mt-3 font-semibold">{d.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.body.replace(/[#|*`-]/g, "").slice(0, 90)}</p>
                <p className="mt-3 text-xs text-muted-foreground">{d.date}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={() => setOpen(null)}>
          <div className="panel fade-up max-h-[80vh] w-full max-w-2xl overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">{open.title}</h2><button onClick={() => setOpen(null)}><X /></button></div>
            <div className="md-table mt-4"><Markdown text={open.body} /></div>
          </div>
        </div>
      )}
    </main>
  );
}

function Markdown({ text }: { text: string }) {
  const lines: string[] = text.split("\n");
  const out: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i] ?? "";
    if (l.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("|")) {
        const row = lines[i] ?? "";
        if (!/^\|[-| ]+\|$/.test(row)) rows.push(row.split("|").slice(1, -1).map((c) => c.trim().replace(/`/g, "")));
        i++;
      }
      i--;
      out.push(<table key={i} className="my-3"><thead><tr>{rows[0]?.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.slice(1).map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k} className={k ? "font-mono" : ""}>{c}</td>)}</tr>)}</tbody></table>);
    } else if (l.startsWith("## ")) out.push(<h3 key={i} className="mt-4 text-lg font-semibold text-primary">{l.slice(3)}</h3>);
    else if (l.startsWith("# ")) out.push(<h2 key={i} className="mt-2 text-xl font-semibold">{l.slice(2)}</h2>);
    else if (l.startsWith("- ")) out.push(<li key={i} className="ml-5 list-disc">{l.slice(2)}</li>);
    else if (l.trim()) out.push(<p key={i} className="my-1 text-muted-foreground">{l}</p>);
  }
  return <>{out}</>;
}
