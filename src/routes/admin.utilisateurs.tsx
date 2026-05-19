import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/utilisateurs")({
  component: UsersAdmin,
});

const ROLES = [
  { value: "super_admin", label: "Super Administrateur", icon: "👑", className: "bg-gold text-background" },
  { value: "admin", label: "Administrateur", icon: "🛡️", className: "bg-gold/70 text-background" },
  { value: "sub_admin", label: "Sous-Administrateur", icon: "⚙️", className: "bg-earth-red/60 text-ivory" },
  { value: "editor", label: "Éditeur", icon: "✏️", className: "bg-secondary text-sand" },
  { value: "graduate", label: "Diplômé", icon: "🎓", className: "bg-emerald-700/60 text-ivory" },
] as const;

function roleMeta(role: string | null) {
  return ROLES.find((r) => r.value === role) ?? { value: "custom", label: "Personnalisé", icon: "🔧", className: "bg-muted text-sand" };
}

function UsersAdmin() {
  const qc = useQueryClient();
  const { data: currentUserRole } = useQuery({
    queryKey: ["my-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      return data?.role ?? null;
    },
  });
  const iAmSuper = currentUserRole === "super_admin";

  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p) => {
        const r = (roles ?? []).find((rr) => rr.user_id === p.id);
        return { ...p, role: r?.role ?? null };
      });
    },
  });

  const changeRole = async (userId: string, currentRole: string | null, newRole: string) => {
    if (currentRole === "super_admin" && !iAmSuper) {
      toast.error("Seul un Super Administrateur peut modifier un Super Administrateur.");
      return;
    }
    if (currentRole) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (error) { toast.error(error.message); return; }
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as never });
    if (error) { toast.error(error.message); return; }
    toast.success("Rôle modifié");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const deleteUserRole = async (userId: string, role: string | null) => {
    if (role === "super_admin") {
      toast.error("Les Super Administrateurs ne peuvent pas être supprimés.");
      return;
    }
    if (!confirm("Retirer ce rôle ?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Rôle retiré");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Utilisateurs</h1>
      <p className="text-sand mb-6">Chaque utilisateur a un seul rôle. Les Super Administrateurs ne peuvent pas être supprimés.</p>
      <div className="space-y-3">
        {(data ?? []).map((u) => {
          const meta = roleMeta(u.role);
          const isSuper = u.role === "super_admin";
          return (
            <div key={u.id} className={`sacred-card flex items-center justify-between gap-4 flex-wrap ${isSuper ? "border-l-4 border-gold" : ""}`}>
              <div className="min-w-0 flex-1">
                <p className="text-ivory">{u.full_name || "Sans nom"} <span className="text-sand text-sm">— {u.email}</span></p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 mt-2 rounded text-xs font-medium ${meta.className}`}>
                  {meta.icon} {meta.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isSuper && !iAmSuper ? (
                  <span className="text-xs text-gold/70 inline-flex items-center gap-1" title="Les Super Administrateurs ne peuvent pas être modifiés">
                    <Lock size={14} /> Protégé
                  </span>
                ) : (
                  <select value={u.role ?? ""} onChange={(e) => changeRole(u.id, u.role, e.target.value)}
                    className="px-2 py-1 bg-input border border-border rounded text-ivory text-sm">
                    <option value="">— Aucun —</option>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
                  </select>
                )}
                {isSuper ? (
                  <span className="text-gold/60" title="Les Super Administrateurs ne peuvent pas être supprimés"><Lock size={16} /></span>
                ) : (
                  <button onClick={() => deleteUserRole(u.id, u.role)} className="text-destructive hover:text-earth-red"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
