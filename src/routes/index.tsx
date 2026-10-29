import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus, Trash2, Target, StickyNote, Eraser } from "lucide-react";
import { usePersisted } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compile — Daily Focus Dashboard" },
      { name: "description", content: "A calm, distraction-free study dashboard with a focus checklist and scratchpad." },
      { property: "og:title", content: "Compile — Daily Focus Dashboard" },
      { property: "og:description", content: "A calm, distraction-free study dashboard." },
    ],
  }),
  component: Dashboard,
});

type Todo = { id: string; text: string; done: boolean };

function Dashboard() {
  const [todos, setTodos] = usePersisted<Todo[]>("compile.todos", [
    { id: "1", text: "Review thermodynamics laws", done: false },
    { id: "2", text: "10 calculus practice problems", done: true },
  ]);
  const [pad, setPad] = usePersisted("compile.scratch", "");
  const [text, setText] = useState("");
  const done = todos.filter((t) => t.done).length;

  const add = () => {
    if (!text.trim()) return;
    setTodos([...todos, { id: crypto.randomUUID(), text: text.trim(), done: false }]);
    setText("");
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2">
      <section className="panel fade-up flex min-h-[70vh] flex-col p-6">
        <div className="mb-1 flex items-center gap-2 text-primary"><Target size={18} /><span className="text-xs uppercase tracking-widest">Today's focus</span></div>
        <h1 className="text-2xl font-semibold">One thing at a time.</h1>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${todos.length ? (done / todos.length) * 100 : 0}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{done} of {todos.length} done</p>
        <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mt-5 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a focus task…"
            className="flex-1 rounded-xl border border-input bg-background/60 px-4 py-2.5 outline-none transition focus:border-primary" />
          <button className="rounded-xl bg-primary px-4 text-primary-foreground transition hover:scale-105" aria-label="Add"><Plus size={18} /></button>
        </form>
        <ul className="mt-4 flex-1 space-y-2 overflow-auto">
          {todos.map((t) => (
            <li key={t.id} className="fade-up group flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5">
              <button onClick={() => setTodos(todos.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${t.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                {t.done && <Check size={14} strokeWidth={3} />}
              </button>
              <span className={`flex-1 transition ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.text}</span>
              <button onClick={() => setTodos(todos.filter((x) => x.id !== t.id))} className="text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"><Trash2 size={16} /></button>
            </li>
          ))}
          {!todos.length && <p className="py-10 text-center text-sm text-muted-foreground">Nothing yet — add a single, small task.</p>}
        </ul>
        <button onClick={() => setTodos(todos.filter((t) => !t.done))} className="mt-4 self-start text-sm text-muted-foreground hover:text-foreground">Clear completed</button>
      </section>

      <section className="panel fade-up flex min-h-[70vh] flex-col p-6 [animation-delay:80ms]">
        <div className="mb-1 flex items-center gap-2 text-accent"><StickyNote size={18} /><span className="text-xs uppercase tracking-widest">Quick scratchpad</span></div>
        <h2 className="text-2xl font-semibold">Dump it here, sort it later.</h2>
        <textarea value={pad} onChange={(e) => setPad(e.target.value)} placeholder="Random thought, a formula, a reminder…"
          className="mt-5 flex-1 resize-none rounded-xl border border-input bg-background/60 p-4 font-mono text-sm leading-relaxed outline-none transition focus:border-accent" />
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{pad.trim() ? pad.trim().split(/\s+/).length : 0} words · autosaved</span>
          <button onClick={() => setPad("")} className="flex items-center gap-1 hover:text-foreground"><Eraser size={15} />Clear</button>
        </div>
      </section>
    </main>
  );
}
