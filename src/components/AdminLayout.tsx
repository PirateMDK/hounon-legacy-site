import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, Sparkles, Briefcase, GraduationCap, Award,
  Image as ImageIcon, Calendar, MessageSquare, Inbox, Users, Settings, LogOut, Menu, X,
  Heart, ListOrdered, ExternalLink,
} from "lucide-react";

const LINKS = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/contenu", label: "Contenu & Biographie", icon: FileText },
  { to: "/admin/vodouns", label: "Vodouns", icon: Sparkles },
  { to: "/admin/services", label: "Services", icon: Briefcase },
  { to: "/admin/formations", label: "Formations", icon: GraduationCap },
  { to: "/admin/diplomes", label: "Diplômés", icon: Award },
  { to: "/admin/medias", label: "Médias", icon: ImageIcon },
  { to: "/admin/evenements", label: "Événements", icon: Calendar },
  { to: "/admin/temoignages", label: "Témoignages", icon: MessageSquare },
  { to: "/admin/messages", label: "Messages & RDV", icon: Inbox },
  { to: "/admin/hommages", label: "Hommages", icon: Heart },
  { to: "/admin/navigation", label: "Navigation", icon: ListOrdered },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, userId, isStaff, email } = useAdminSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!userId || !isStaff) && pathname !== "/admin/login") {
      navigate({ to: "/admin/login" });
    }
  }, [loading, userId, isStaff, navigate, pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sand">Chargement…</div>;
  if (!userId || !isStaff) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky lg:top-0 z-40 lg:left-0 inset-y-0 left-0 w-64 bg-card border-r border-border transition-transform flex flex-col h-screen`}>
        {/* Header */}
        <div className="p-5 border-b border-border flex-shrink-0">
          <Link to="/admin" className="block mb-4">
            <h2 className="font-display text-gold text-lg">HOUNON PROPRE</h2>
            <p className="font-italic-serif text-xs text-sand">Espace Administrateur</p>
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-gold/60 rounded text-gold text-xs hover:bg-gold hover:text-background transition">
            🌐 Voir le site public <ExternalLink size={12} />
          </a>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition ${active ? "bg-secondary text-gold border-l-2 border-gold" : "text-sand hover:bg-secondary/50 hover:text-ivory"}`}>
                <Icon size={16} /> {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gold/40 flex-shrink-0 bg-card">
          <p className="text-xs text-sand truncate mb-2" title={email ?? ""}>{email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-sand hover:bg-destructive/20 hover:text-ivory">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-30">
          <button onClick={() => setOpen((o) => !o)} className="text-gold">{open ? <X /> : <Menu />}</button>
          <span className="font-display text-gold text-sm">ADMIN</span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-gold text-xs">🌐</a>
        </header>
        <main className="p-6 lg:p-10 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
