import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, Sparkles, Briefcase, GraduationCap, Award,
  Image as ImageIcon, Calendar, MessageSquare, Inbox, Users, Settings, LogOut, Menu, X,
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
  { to: "/admin/messages", label: "Messages", icon: Inbox },
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
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static z-40 inset-y-0 left-0 w-64 bg-card border-r border-border transition-transform`}>
        <div className="p-5 border-b border-border">
          <Link to="/admin" className="block">
            <h2 className="font-display text-gold text-lg">HOUNON PROPRE</h2>
            <p className="font-italic-serif text-xs text-sand">Espace Administrateur</p>
          </Link>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition ${active ? "bg-secondary text-gold" : "text-sand hover:bg-secondary/50 hover:text-ivory"}`}>
                <Icon size={16} /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border absolute bottom-0 left-0 right-0 bg-card">
          <p className="text-xs text-sand truncate mb-2">{email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-sand hover:bg-destructive/20 hover:text-ivory">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 lg:ml-0">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <button onClick={() => setOpen((o) => !o)} className="text-gold">{open ? <X /> : <Menu />}</button>
          <span className="font-display text-gold text-sm">ADMIN</span>
          <div />
        </header>
        <main className="p-6 lg:p-10 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
