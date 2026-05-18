import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const mark = async (id: string, status: string) => {
    await supabase.from("messages").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    await supabase.from("messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
    toast.success("Supprimé");
  };
  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Boîte de réception</h1>
      <p className="text-sand mb-6">Demandes et messages reçus depuis le site.</p>
      <div className="space-y-3">
        {(data ?? []).map((m) => (
          <div key={m.id} className={`sacred-card ${m.status === "nouveau" ? "border-gold/60" : ""}`}>
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <p className="text-ivory font-medium">{m.full_name} <span className="text-sand">— {m.country}</span></p>
                <p className="text-sand text-xs">{m.email} · {m.phone} · {new Date(m.created_at).toLocaleString("fr-FR")}</p>
                {m.service && <p className="text-gold text-sm mt-1">Service : {m.service}{m.preferred_date && ` · Date souhaitée : ${m.preferred_date}`}</p>}
              </div>
              <div className="flex gap-2 items-start">
                <span className={`text-xs px-2 py-1 rounded ${m.status === "nouveau" ? "bg-gold/30 text-gold" : "bg-secondary text-sand"}`}>{m.status}</span>
                {m.status === "nouveau" && <button onClick={() => mark(m.id, "traite")} className="text-xs px-3 py-1 text-gold border border-gold/40 rounded">Marquer traité</button>}
                <button onClick={() => remove(m.id)} className="text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-ivory mt-3 whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="text-sand italic">Aucun message.</p>}
      </div>
    </div>
  );
}
