import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/temoignages")({
  component: TestimonialsAdmin,
});

const TABS = [
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvés" },
  { key: "rejected", label: "Rejetés" },
] as const;

function TestimonialsAdmin() {
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("pending");
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-testimonials", tab],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("status", tab).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Mis à jour");
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  };
  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-6">Témoignages</h1>
      <div className="flex gap-2 border-b border-border mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-display ${tab === t.key ? "text-gold border-b-2 border-gold" : "text-sand"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {(data ?? []).map((t) => (
          <div key={t.id} className="sacred-card">
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <p className="text-gold">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</p>
                <p className="text-sand text-xs">{t.first_name} · {t.country} · {t.service || "—"}</p>
              </div>
              <div className="flex gap-2">
                {tab !== "approved" && <button onClick={() => setStatus(t.id, "approved")} className="text-xs px-3 py-1 bg-gold/20 text-gold rounded hover:bg-gold/40">Approuver</button>}
                {tab !== "rejected" && <button onClick={() => setStatus(t.id, "rejected")} className="text-xs px-3 py-1 bg-secondary text-sand rounded hover:bg-destructive/40">Rejeter</button>}
                <button onClick={() => remove(t.id)} className="text-destructive p-1"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="font-italic-serif text-ivory mt-3">« {t.text} »</p>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="text-sand italic">Aucun témoignage dans cette catégorie.</p>}
      </div>
    </div>
  );
}
