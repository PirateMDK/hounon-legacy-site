import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";

export const Route = createFileRoute("/evenements")({
  head: () => ({ meta: [{ title: "Événements — Hounon Propre" }] }),
  component: () => {
    const [tab, setTab] = useState<"a_venir" | "passes">("a_venir");
    const { data: events } = useQuery({
      queryKey: ["events"],
      queryFn: async () => (await supabase.from("events").select("*").order("event_date", { ascending: false })).data ?? [],
    });
    const today = new Date().toISOString().slice(0, 10);
    const filtered = (events ?? []).filter((e) => tab === "a_venir" ? e.event_date >= today : e.event_date < today);
    return (
      <Page>
        <section className="px-6 py-20 mx-auto max-w-6xl">
          <h1 className="section-title">Événements</h1>
          <div className="flex justify-center gap-3 mt-10">
            <button onClick={() => setTab("a_venir")} className={tab === "a_venir" ? "btn-primary" : "btn-outline"}>À venir</button>
            <button onClick={() => setTab("passes")} className={tab === "passes" ? "btn-primary" : "btn-outline"}>Passés</button>
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-sand mt-12 font-italic-serif text-lg">
              {tab === "a_venir" ? "Aucun événement prévu pour le moment. Revenez bientôt." : "Aucun événement passé à afficher."}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {filtered.map((e) => (
                <div key={e.id} className="sacred-card">
                  {e.cover_image_url && <img src={e.cover_image_url} alt="" className="w-full h-40 object-cover rounded-sm mb-4" />}
                  <h3 className="font-display text-xl text-gold">{e.title}</h3>
                  <p className="text-sand text-sm mt-2">{new Date(e.event_date).toLocaleDateString("fr-FR")} {e.event_time && `· ${e.event_time}`}</p>
                  <p className="text-sand text-sm">{e.location}</p>
                  <p className="text-ivory/90 mt-3 text-sm">{e.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </Page>
    );
  },
});
