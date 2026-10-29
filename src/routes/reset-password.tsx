import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export const Route = createFileRoute("/reset-password")({ head: () => ({ meta: [{ title: "Comπle — Reset password" }, { name: "description", content: "Securely reset your Comπle study account password." }, { property: "og:title", content: "Comπle — Reset password" }, { property: "og:description", content: "Recover access to your private study library." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: ResetPassword });
function ResetPassword() {
  const [password, setPassword] = useState(""); const [done, setDone] = useState(false);
  return <main className="mx-auto max-w-sm px-4 py-10"><h1 className="mb-5 text-2xl">Reset password</h1>{done ? <Link to="/">Return to your study space</Link> : <form onSubmit={async e => { e.preventDefault(); const { error } = await supabase.auth.updateUser({ password }); if (error) toast.error(error.message); else { toast.success("Password updated"); setDone(true); } }} className="grid gap-4"><input type="password" aria-label="New password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="rounded-md border border-input bg-background p-3" placeholder="New password" /><Button>Save password</Button></form>}</main>;
}