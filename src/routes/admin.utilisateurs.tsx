import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/utilisateurs")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
      }));
    },
  });

  const setRole = async (userId: string, role: "super_admin" | "editor" | "user", checked: boolean) => {
    if (checked) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) toast.error(error.message); else toast.success("Rôle ajouté");
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) toast.error(error.message); else toast.success("Rôle retiré");
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Utilisateurs</h1>
      <p className="text-sand mb-6">Gérez les rôles d'accès à l'espace administrateur.</p>
      <div className="space-y-3">
        {(data ?? []).map((u) => (
          <div key={u.id} className="sacred-card">
            <p className="text-ivory">{u.full_name || "Sans nom"} <span className="text-sand text-sm">— {u.email}</span></p>
            <div className="flex gap-4 mt-3 text-sm">
              {(["super_admin", "editor", "user"] as const).map((r) => (
                <label key={r} className="inline-flex items-center gap-2 text-sand">
                  <input type="checkbox" checked={u.roles.includes(r)} onChange={(e) => setRole(u.id, r, e.target.checked)} />
                  {r}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
