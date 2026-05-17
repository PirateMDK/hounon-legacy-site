import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";

export const Route = createFileRoute("/diplomes")({
  head: () => ({ meta: [{ title: "Diplômés — Hounon Propre" }] }),
  component: () => {
    const { data: graduates } = useQuery({
      queryKey: ["graduates"],
      queryFn: async () => {
        const { data } = await supabase.from("graduates").select("*").eq("visible", true).order("sort_order");
        return data ?? [];
      },
    });
    return (
      <Page>
        <section className="px-6 py-20 mx-auto max-w-6xl">
          <h1 className="section-title">Praticiens Formés & Diplômés</h1>
          <p className="text-center text-ivory mt-8 max-w-3xl mx-auto font-italic-serif text-lg">
            Ces praticiens ont été formés, initiés et diplômés par KINWAHO HOUNGUEVI DJIMA. Ils sont aujourd'hui actifs dans le domaine de la tradition vodoun.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {(graduates ?? []).map((g) => (
              <div key={g.id} className="sacred-card text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-secondary border-2 border-gold/40 flex items-center justify-center text-3xl text-gold font-display">
                  {g.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <h3 className="font-display text-lg text-gold">{g.full_name}</h3>
                <p className="font-italic-serif text-sand">{g.specialty}</p>
                <p className="text-ivory/70 text-sm mt-1">{g.location}</p>
                <p className="mt-4 text-xs uppercase tracking-widest text-gold border border-gold/40 rounded-sm py-1 px-2 inline-block">Diplômé par Hounon Propre ✓</p>
              </div>
            ))}
          </div>
        </section>
      </Page>
    );
  },
});
