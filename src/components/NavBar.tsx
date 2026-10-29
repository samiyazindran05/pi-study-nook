import { Link } from "@tanstack/react-router";
import { LayoutDashboard, FolderOpen, Columns2 } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notes", label: "Notes Hub", icon: FolderOpen },
  { to: "/workspace", label: "Workspace", icon: Columns2 },
] as const;

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-0.5 text-xl font-semibold tracking-tight">
          <span>Com</span>
          <span className="text-2xl text-primary">π</span>
          <span>le</span>
        </Link>
        <div className="flex gap-1 rounded-full border border-border bg-card/60 p-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-all hover:text-foreground"
              activeProps={{ className: "bg-primary !text-primary-foreground shadow-lg" }}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
