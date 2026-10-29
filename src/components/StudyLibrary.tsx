import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Doc } from "@/lib/store";
import { sortedNote } from "@/lib/lecture";
import { toast } from "sonner";

type Library = { user: User | null; ready: boolean; docs: Doc[]; folders: string[]; save: (title: string, body: string, fallback?: string) => Promise<Doc>; addFolder: (name: string) => Promise<void> };
const Context = createContext<Library | null>(null);
const defaults = ["Physics", "Chemistry", "Maths"];

export function StudyLibrary({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [folders, setFolders] = useState(defaults);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let active = true;
    setReady(false); setDocs([]); setFolders(defaults);
    if (!user) { setReady(true); return; }
    Promise.all([supabase.from("study_notes").select("id,title,body,folder,date").eq("user_id", user.id).order("created_at", { ascending: false }), supabase.from("study_folders").select("name").eq("user_id", user.id)]).then(([notes, subjects]) => {
      if (!active) return;
      if (notes.error || subjects.error) toast.error("Could not load your notes. Please refresh.");
      setDocs(notes.data ?? []);
      setFolders([...new Set([...defaults, ...(subjects.data ?? []).map(f => f.name)])]);
      setReady(true);
    });
    return () => { active = false; };
  }, [user?.id]);
  const save = async (title: string, body: string, fallback = folders[0] ?? "Physics") => {
    if (!user) throw new Error("Sign in to save your notes");
    const note = sortedNote(title, body, folders, fallback);
    const { error } = await supabase.from("study_notes").insert({ ...note, user_id: user.id });
    if (error) throw new Error(error.message);
    setDocs(current => [note, ...current]);
    return note;
  };
  const addFolder = async (name: string) => {
    if (!user) throw new Error("Sign in to create a subject");
    const { error } = await supabase.from("study_folders").upsert({ user_id: user.id, name }, { onConflict: "user_id,name" });
    if (error) throw new Error(error.message);
    setFolders(current => [...new Set([...current, name])]);
  };
  return <Context.Provider value={{ user, ready, docs, folders, save, addFolder }}>{children}</Context.Provider>;
}
export function useStudyLibrary() {
  const library = useContext(Context);
  if (!library) throw new Error("Study library is unavailable");
  return library;
}