import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MonitorPlay, FileText, BookOpen, Play, Maximize2, Minimize2, ArrowLeft, Upload, Trash2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePersisted } from "@/lib/store";
import { youtubeId } from "@/lib/lecture";
import { supabase } from "@/integrations/supabase/client";
import { useStudyLibrary } from "@/components/StudyLibrary";
import { Button } from "@/components/ui/button";
import { PdfReader } from "@/components/PdfReader";
import { LecturePlayer } from "@/components/LecturePlayer";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [
    { title: "Comπle — Lecture Workspace" }, { name: "description", content: "Watch YouTube lectures and read your uploaded PDFs beside notes saved to your subject folders." },
    { property: "og:title", content: "Comπle — Lecture Workspace" }, { property: "og:description", content: "Real lectures, private PDFs, and sorted study notes in one workspace." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Workspace,
});
type PdfFile = { name: string; path: string };
const notionDocs = [{ title: "Calculus Cheat Sheet", body: "Limits describe behaviour as x approaches a value.\n\nDerivatives measure the instantaneous rate of change. Remember the chain rule.\n\nIntegration is the reverse of differentiation; always add + C." }, { title: "Exam Week Plan", body: "Monday: Mechanics revision.\nTuesday: Organic chemistry.\nWednesday: Integration practice." }];
function Workspace() {
  const { user, folders, save, ready } = useStudyLibrary();
  const [tab, setTab] = useState<"yt" | "pdf" | "notion">("yt");
  const [notes, setNotes] = usePersisted("compile.lecture", "");
  const [title, setTitle] = usePersisted("compile.lectureTitle", "");
  const [focus, setFocus] = useState(false); const [link, setLink] = useState(""); const [video, setVideo] = useState<string | null>(null);
  const [files, setFiles] = useState<PdfFile[]>([]); const [file, setFile] = useState<PdfFile | null>(null); const [url, setUrl] = useState(""); const [fileLoading, setFileLoading] = useState(false);
  const [uploading, setUploading] = useState(false); const [saving, setSaving] = useState(false); const [loadingFiles, setLoadingFiles] = useState(false); const [fileError, setFileError] = useState("");
  const [doc, setDoc] = useState<(typeof notionDocs)[number] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const loadFiles = async () => {
    if (!user) return;
    setLoadingFiles(true); setFileError("");
    const { data, error } = await supabase.storage.from("study-pdfs").list(user.id, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) setFileError(error.message);
    else setFiles((data ?? []).filter(f => f.name.endsWith(".pdf")).map(f => ({ name: f.name.slice(f.name.indexOf("_") + 1), path: `${user.id}/${f.name}` })));
    setLoadingFiles(false);
  };
  useEffect(() => { setFiles([]); setFile(null); setUrl(""); void loadFiles(); }, [user?.id]);
  useEffect(() => {
    let active = true; setUrl("");
    if (!file) return;
    setFileLoading(true);
    supabase.storage.from("study-pdfs").createSignedUrl(file.path, 3600).then(({ data, error }) => {
      if (!active) return;
      if (error) toast.error(error.message); else setUrl(data?.signedUrl ?? "");
      setFileLoading(false);
    });
    return () => { active = false; };
  }, [file]);
  const upload = async (selected: File | undefined) => {
    if (!selected || !user) return;
    if (!selected.name.toLowerCase().endsWith(".pdf")) { toast.error("Choose a PDF file"); return; }
    if (selected.size > 50 * 1024 * 1024) { toast.error("Choose a PDF smaller than 50 MB"); return; }
    const header = await selected.slice(0, 5).text();
    if (header !== "%PDF-") { toast.error("This file is not a valid PDF"); return; }
    setUploading(true);
    const name = selected.name.replace(/[^a-zA-Z0-9.\-_ ]/g, "_").replace(/\.pdf$/i, ".pdf");
    const path = `${user.id}/${crypto.randomUUID()}_${name}`;
    const { error } = await supabase.storage.from("study-pdfs").upload(path, selected, { contentType: "application/pdf" });
    if (error) toast.error(error.message); else { await loadFiles(); setFile({ name, path }); toast.success("PDF uploaded to your library"); }
    setUploading(false); if (input.current) input.current.value = "";
  };
  const saveNotes = async () => {
    if (!title.trim() || !notes.trim()) { toast.error("Add a title and lecture notes first"); return; }
    setSaving(true);
    try { const saved = await save(title, notes); setNotes(""); setTitle(""); toast.success(saved.merged ? `Added as a new entry to "${saved.title}" in ${saved.folder}` : `Saved to ${saved.folder}`, { action: { label: "Open Notes Hub", onClick: () => { window.location.href = "/notes"; } } }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Could not save notes"); } finally { setSaving(false); }
  };
  return <main className={`mx-auto grid min-h-[calc(100dvh-120px)] max-w-[1600px] gap-4 p-4 ${focus ? "grid-cols-1" : "md:grid-cols-2"}`}>
    <section className="panel flex min-w-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        {([{ id: "yt", label: "YouTube", icon: MonitorPlay }, { id: "pdf", label: "Files / PDF", icon: FileText }, { id: "notion", label: "Notion Doc", icon: BookOpen }] as const).map(({ id, label, icon: Icon }) => <Button key={id} variant={tab === id ? "secondary" : "ghost"} onClick={() => { setTab(id); setFocus(false); }}><Icon />{label}</Button>)}
        {tab === "yt" && video && <Button variant="outline" className="ml-auto" title={focus ? "Exit focus mode" : "Fullscreen focus mode"} onClick={() => setFocus(!focus)}>{focus ? <Minimize2 /> : <Maximize2 />}{focus ? "Exit focus" : "Focus mode"}</Button>}
      </div>
      <div className="min-w-0 flex-1 p-4">
        {tab === "yt" && <>
          <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); const id = youtubeId(link); if (!id) { toast.error("Enter a valid YouTube video link"); return; } setVideo(id); }}>
            <input aria-label="YouTube video link" value={link} onChange={e => setLink(e.target.value)} placeholder="Paste a YouTube lecture link" className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
            <Button><Play />Watch</Button>
          </form>
          {video ? <div className="mt-5"><LecturePlayer id={video} /></div> : <div className="py-16 text-center text-muted-foreground"><MonitorPlay className="mx-auto mb-3" size={32} /><p>No lecture open</p></div>}
        </>}
        {tab === "pdf" && <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">{file ? <Button variant="ghost" onClick={() => setFile(null)}><ArrowLeft />All PDFs</Button> : <h2 className="text-lg font-semibold">Your PDFs</h2>}<input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => void upload(e.target.files?.[0])} /><Button disabled={!user || uploading} onClick={() => input.current?.click()}>{uploading ? <Loader2 className="animate-spin" /> : <Upload />}{uploading ? "Uploading…" : "Upload PDF"}</Button></div>
          {file ? <><h3 className="mb-3 break-words font-medium">{file.name}</h3>{url ? <div className="max-h-[65dvh] overflow-auto"><PdfReader url={url} /></div> : fileLoading ? <Loader2 className="animate-spin" aria-label="Opening PDF" /> : <p className="text-destructive">Unable to open PDF. Return to the list and retry.</p>}</> : !user ? <p className="py-12 text-center text-muted-foreground">Sign in to open your private PDF library.</p> : loadingFiles ? <Loader2 className="mx-auto animate-spin" /> : fileError ? <div role="alert"><p>{fileError}</p><Button onClick={() => void loadFiles()}>Retry</Button></div> : files.length ? <div className="space-y-2">{files.map(f => <div key={f.path} className="flex items-center gap-2 rounded-lg border border-border p-2"><Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start whitespace-normal text-left" onClick={() => setFile(f)}><FileText /><span className="break-all">{f.name}</span></Button><Button variant="ghost" size="icon" title="Delete PDF" aria-label={`Delete ${f.name}`} onClick={async () => { if (!confirm(`Delete ${f.name}?`)) return; const { error } = await supabase.storage.from("study-pdfs").remove([f.path]); if (error) toast.error(error.message); else { await loadFiles(); toast.success("PDF deleted"); } }}><Trash2 /></Button></div>)}</div> : <p className="py-12 text-center text-muted-foreground">No PDFs uploaded yet.</p>}
        </>}
        {tab === "notion" && (doc ? <article><Button variant="ghost" onClick={() => setDoc(null)}><ArrowLeft />All documents</Button><h2 className="mt-4 text-2xl font-semibold">{doc.title}</h2><p className="mt-4 whitespace-pre-wrap leading-relaxed">{doc.body}</p></article> : <div className="space-y-2"><p className="mb-4 text-xs text-muted-foreground">Sample documents</p>{notionDocs.map(d => <Button key={d.title} variant="outline" className="w-full justify-start" onClick={() => setDoc(d)}><BookOpen />{d.title}</Button>)}</div>)}
      </div>
    </section>
    {!focus && <section className="panel flex min-h-[420px] min-w-0 flex-col p-5">
      <div className="mb-3 flex items-center justify-between gap-2"><h1 className="text-lg font-semibold">Lecture notes</h1><Link to="/notes" className="text-sm text-primary">Notes Hub</Link></div>
      <input aria-label="Lecture note title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title — e.g. Thermodynamics" disabled={saving} className="w-full border-b border-input bg-transparent py-3 text-xl outline-none" />
      <textarea aria-label="Lecture notes" value={notes} onChange={e => setNotes(e.target.value)} disabled={saving} placeholder="Type as you learn…" className="mt-3 min-h-64 flex-1 resize-none rounded-lg border border-input bg-background/50 p-4 font-mono text-sm leading-relaxed outline-none focus:border-accent" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Draft saved on this device</span><Button disabled={saving || !user || !ready} onClick={() => void saveNotes()}>{saving ? <Loader2 className="animate-spin" /> : <Sparkles />}{saving ? "Saving…" : "Auto Sort & Save"}</Button></div>
      {!user && <p className="mt-3 text-sm text-muted-foreground">Sign in to save to your subject folders.</p>}
    </section>}
  </main>;
}
