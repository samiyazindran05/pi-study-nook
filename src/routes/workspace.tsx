import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MonitorPlay as Youtube, FileText, BookOpen, Search, Play, Maximize2, Minimize2, CheckCircle2, RotateCcw, ArrowLeft } from "lucide-react";
import { usePersisted } from "@/lib/store";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Compile — Focused Split Workspace" },
      { name: "description", content: "Watch lectures or read textbooks side by side with a persistent notepad." },
      { property: "og:title", content: "Compile — Focused Split Workspace" },
      { property: "og:description", content: "Distraction-free lectures and reading next to your notes." },
    ],
  }),
  component: Workspace,
});

const VIDEO_IDS = ["SOGnz9wOByc", "WH4xt8Sx3Zk", "WUvTyaaNkzM"];
const CHANNELS = ["Crash Course", "Khan Academy", "MIT OpenCourseWare"];

const FILES = [
  { name: "HC Verma — Thermodynamics.pdf", kind: "pdf", body: ["Chapter 26: Laws of Thermodynamics", "The first law of thermodynamics is a statement of conservation of energy. When heat Q is given to a system, part of it increases the internal energy U and the rest is used in doing work W: Q = ΔU + W.", "A process in which the temperature remains constant is called isothermal. For an ideal gas undergoing isothermal expansion, the work done equals nRT ln(V₂/V₁).", "In an adiabatic process no heat is exchanged; PV^γ remains constant."] },
  { name: "NCERT Chemistry — Equilibrium.pdf", kind: "pdf", body: ["Unit 7: Equilibrium", "Equilibrium is a dynamic state in which the rates of the forward and reverse reactions are equal.", "Le Chatelier's principle: if a system at equilibrium is disturbed, it adjusts itself to counteract the change.", "The pH of a solution is defined as the negative logarithm of hydrogen ion concentration."] },
  { name: "Calculus Cheat Sheet", kind: "notion", body: ["📘 Calculus — Notion Doc", "Limits describe behaviour as x approaches a value.", "Derivatives measure the instantaneous rate of change. Remember the chain rule for composite functions.", "Integration is the reverse of differentiation; always add + C for indefinite integrals."] },
  { name: "Exam Week Plan", kind: "notion", body: ["🗓️ Exam Week Plan — Notion Doc", "Mon: Physics mechanics revision + 2 past papers.", "Tue: Organic chemistry mechanisms.", "Wed: Maths — integration practice. Rest at 9pm."] },
];

type Tab = "yt" | "pdf" | "notion";

function Workspace() {
  const [tab, setTab] = useState<Tab>("yt");
  const [notes, setNotes] = usePersisted("compile.lecture", "");
  const [focus, setFocus] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; title: string; ch: string }[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [file, setFile] = useState<(typeof FILES)[number] | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!String(e.origin).includes("youtube")) return;
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d?.info?.playerState === 0 || (d?.event === "onStateChange" && d?.info === 0)) setEnded(true);
      } catch {}
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const listen = () => {
    const w = frame.current?.contentWindow;
    w?.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*");
    w?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }), "*");
  };

  const search = () => {
    const t = q.trim() || "Study";
    setResults(["Complete Lecture", "Explained Simply", "Exam Problem Walkthrough"].map((s, i) => ({ id: VIDEO_IDS[i]!, title: `${t}: ${s}`, ch: CHANNELS[i]! })));
    setVideo(null);
  };

  const tabs = [
    { id: "yt" as const, label: "YouTube", icon: Youtube },
    { id: "pdf" as const, label: "Files / PDF", icon: FileText },
    { id: "notion" as const, label: "Notion Doc", icon: BookOpen },
  ];

  return (
    <main className={`mx-auto grid h-[calc(100vh-64px)] max-w-[1600px] gap-4 p-4 transition-all duration-500 ${focus ? "grid-cols-1" : "md:grid-cols-2"}`}>
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center gap-1 border-b border-border p-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setFile(null); }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${tab === id ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
          {tab === "yt" && video && (
            <button onClick={() => setFocus(!focus)} className="ml-auto flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition hover:scale-105">
              {focus ? <Minimize2 size={15} /> : <Maximize2 size={15} />} ✨ Fullscreen Focus Mode
            </button>
          )}
        </div>

        <div key={tab} className="fade-up min-h-0 flex-1 overflow-auto p-5">
          {tab === "yt" && (
            <>
              <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex items-center gap-2 rounded-2xl border border-input bg-background/60 px-4 py-2 focus-within:border-primary">
                <Search size={18} className="text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="No-distraction search — e.g. Thermodynamics"
                  className="flex-1 bg-transparent py-1.5 outline-none" />
                <button className="rounded-xl bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">Search</button>
              </form>

              {video ? (
                <div className="fade-up mt-5">
                  <button onClick={() => { setVideo(null); setFocus(false); }} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} />Results</button>
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-background">
                    <iframe ref={frame} onLoad={listen} className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${video}?enablejsapi=1&rel=0&modestbranding=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                      allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen title="Lecture" />
                    {ended && (
                      <div className="fade-up absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background">
                        <CheckCircle2 size={56} className="text-primary" />
                        <h3 className="text-2xl font-semibold">Lesson Complete</h3>
                        <p className="text-sm text-muted-foreground">Great work. Take a breath, then review your notes.</p>
                        <button onClick={() => { setEnded(false); setVideo(null); setFocus(false); }} className="mt-2 flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted"><RotateCcw size={15} />Back to search</button>
                      </div>
                    )}
                  </div>
                  {!ended && <button onClick={() => setEnded(true)} className="mt-3 text-xs text-muted-foreground hover:text-foreground">Mark lesson as finished</button>}
                </div>
              ) : results.length ? (
                <div className="mt-5 space-y-3">
                  {results.map((r, i) => (
                    <div key={r.id} className="fade-up flex items-center gap-4 rounded-2xl border border-border bg-background/40 p-3" style={{ animationDelay: `${i * 70}ms` }}>
                      <img src={`https://i.ytimg.com/vi/${r.id}/mqdefault.jpg`} alt="" className="h-20 w-36 rounded-xl object-cover" />
                      <div className="flex-1"><p className="font-medium">{r.title}</p><p className="text-sm text-muted-foreground">{r.ch}</p></div>
                      <button onClick={() => { setVideo(r.id); setEnded(false); }} className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"><Play size={14} />Watch</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-16 text-center text-muted-foreground">Search a topic. Only 3 results — no rabbit holes.</p>
              )}
            </>
          )}

          {tab !== "yt" && (file ? (
            <article className="fade-up max-w-prose">
              <button onClick={() => setFile(null)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} />All files</button>
              <h2 className="text-2xl font-semibold text-primary">{file.body[0]}</h2>
              {file.body.slice(1).map((p, i) => <p key={i} className="mt-4 text-lg leading-relaxed">{p}</p>)}
            </article>
          ) : (
            <div className="space-y-2">
              {FILES.filter((f) => f.kind === tab).map((f) => (
                <button key={f.name} onClick={() => setFile(f)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background/40 p-4 text-left transition hover:border-primary/50 hover:translate-x-1">
                  {tab === "pdf" ? <FileText className="text-destructive" /> : <BookOpen className="text-accent" />}
                  <span className="flex-1 font-medium">{f.name}</span>
                  <span className="text-xs text-muted-foreground">Open</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {!focus && (
        <section className="panel fade-up flex min-h-0 flex-col p-5">
          <p className="text-xs uppercase tracking-widest text-accent">Lecture notes · autosaved</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Type as you learn…"
            className="mt-3 flex-1 resize-none rounded-xl border border-input bg-background/50 p-4 font-mono text-sm leading-relaxed outline-none focus:border-accent" />
        </section>
      )}
    </main>
  );
}
