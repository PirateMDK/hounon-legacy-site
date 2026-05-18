import { createFileRoute } from "@tanstack/react-router";
import { CrudPanel } from "@/components/admin/CrudPanel";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/formations")({
  component: FormationsAdmin,
});

function FormationsAdmin() {
  const [tab, setTab] = useState<"formations" | "inscriptions">("formations");
  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-6">Formations</h1>
      <div className="flex gap-2 border-b border-border mb-6">
        <button onClick={() => setTab("formations")} className={`px-4 py-2 text-sm font-display ${tab === "formations" ? "text-gold border-b-2 border-gold" : "text-sand"}`}>Catalogue</button>
        <button onClick={() => setTab("inscriptions")} className={`px-4 py-2 text-sm font-display ${tab === "inscriptions" ? "text-gold border-b-2 border-gold" : "text-sand"}`}>Inscriptions</button>
      </div>
      {tab === "formations" ? (
        <CrudPanel title="Catalogue des formations" table="formations" fields={[
          { key: "title", label: "Titre" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "duration", label: "Durée" },
          { key: "price", label: "Tarif" },
          { key: "icon", label: "Icône" },
          { key: "sort_order", label: "Ordre", type: "number" },
          { key: "visible", label: "Visible", type: "boolean" },
        ]} />
      ) : <Inscriptions />}
    </div>
  );
}

function Inscriptions() {
  const { data } = useQuery({
    queryKey: ["admin-inscriptions"],
    queryFn: async () => {
      const { data } = await supabase.from("formation_inscriptions").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div className="space-y-3">
      {(data ?? []).map((i) => (
        <div key={i.id} className="sacred-card">
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <p className="text-ivory font-medium">{i.full_name} — <span className="text-sand">{i.country}</span></p>
              <p className="text-sand text-xs">{i.email} · {i.phone} · {new Date(i.created_at).toLocaleString("fr-FR")}</p>
              <p className="text-gold text-sm mt-1">Formation : {i.formation_title}</p>
            </div>
            <span className="text-xs px-2 py-1 bg-secondary text-sand rounded">{i.status}</span>
          </div>
          {i.message && <p className="text-ivory text-sm mt-3 italic border-l-2 border-gold/40 pl-3">{i.message}</p>}
        </div>
      ))}
      {(data ?? []).length === 0 && <p className="text-sand italic">Aucune inscription.</p>}
    </div>
  );
}
