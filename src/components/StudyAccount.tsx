import { useState } from "react";
import { LogIn, LogOut, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { useStudyLibrary } from "./StudyLibrary";
import "@lovable.dev/cloud-auth-js/styles.css";

export function StudyAccount() {
  const { user } = useStudyLibrary();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  const social = async (provider: "google" | "lovable") => {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message); else if (!result.redirected) setOpen(false);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const { error } = mode === "signup" ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } }) : mode === "reset" ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }) : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (mode === "login") setOpen(false); else toast.success(mode === "signup" ? "Check your email to confirm your account" : "Check your email for a reset link");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Sign in failed"); } finally { setBusy(false); }
  };
  return <>
    <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-3 px-4 pt-3 text-sm">
      {user ? <><span className="max-w-56 truncate text-muted-foreground">{user.email}</span><Button variant="ghost" size="sm" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) toast.error(error.message); }}><LogOut />Sign out</Button></> : <Button variant="outline" size="sm" onClick={() => setOpen(true)}><LogIn />Sign in to save notes & PDFs</Button>}
    </div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4">
      <section role="dialog" aria-modal="true" aria-label="Study account" className="relative w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <Button variant="ghost" size="icon" aria-label="Close sign in" className="absolute right-2 top-2" onClick={() => setOpen(false)}><X /></Button>
        <h2 className="mb-5 text-2xl font-semibold">{mode === "signup" ? "Create your account" : mode === "reset" ? "Reset password" : "Your study library"}</h2>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" autoComplete="email" aria-label="Email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border border-input bg-background p-3" />
          {mode !== "reset" && <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} aria-label="Password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md border border-input bg-background p-3" />}
          <Button className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</Button>
        </form>
        <div className="mt-4 grid gap-2"><Button variant="outline" onClick={() => social("google")}>Continue with Google</Button><Button className="lovable-auth-button" variant="outline" onClick={() => social("lovable")}>Continue with Lovable</Button></div>
        <div className="mt-4 flex flex-wrap justify-between"><Button variant="link" size="sm" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Already have an account?" : "Create account"}</Button><Button variant="link" size="sm" onClick={() => setMode(mode === "reset" ? "login" : "reset")}>{mode === "reset" ? "Back to sign in" : "Forgot password?"}</Button></div>
      </section>
    </div>}
  </>;
}