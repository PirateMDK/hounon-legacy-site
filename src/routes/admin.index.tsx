import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function useCount(table: string, filter?: { col: string; val: string }) {
  return useQuery({
    queryKey: ["count", table, filter?.val],
    queryFn: async () => {
      let q = supabase.from(table as never).select("id", { count: "exact", head: true });
      if (filter) q = q.eq(filter.col as never, filter.val as never);
      const { count } = await q;
      return count ?? 0;
    },
  });
}

function Dashboard() {
  const messages = useCount("messages", { col: "status", val: "nouveau" });
  const inscriptions = useCount("formation_inscriptions", { col: "status", val: "nouveau" });
  const pendingT = useCount("testimonials", { col: "status", val: "pending" });
  const events = useCount("events");
  const vodouns = useCount("vodouns");
  const services = useCount("services");
  const formations = useCount("formations");
  const graduates = useCount("graduates");

  const cards = [
    { label: "Nouveaux messages", n: messages.data, color: "text-gold" },
    { label: "Nouvelles inscriptions", n: inscriptions.data, color: "text-gold" },
    { label: "Témoignages en attente", n: pendingT.data, color: "text-gold" },
    { label: "Événements", n: events.data, color: "text-sand" },
    { label: "Vodouns", n: vodouns.data, color: "text-sand" },
    { label: "Services", n: services.data, color: "text-sand" },
    { label: "Formations", n: formations.data, color: "text-sand" },
    { label: "Diplômés", n: graduates.data, color: "text-sand" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Tableau de bord</h1>
      <p className="text-sand mb-8">Vue d'ensemble de l'activité du site.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="sacred-card text-center">
            <p className={`font-display text-4xl ${c.color}`}>{c.n ?? "—"}</p>
            <p className="text-xs text-sand mt-2">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
