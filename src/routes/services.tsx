import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import PromoBanner from "@/components/PromoBanner";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Hounon Propre" },
      {
        name: "description",
        content:
          "Consultation du Fâ, rituels d'amour, protection, guérison, prospérité. Disponible dans le monde entier.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("visible", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <Page>
      <section className="px-6 py-20 mx-auto max-w-6xl">
        <h1 className="section-title">Services Spirituels</h1>
        <p className="text-center font-italic-serif text-xl text-gold mt-8">
          🌍 Disponible dans le monde entier — Livraison & Envoi à Distance
        </p>

        <PromoBanner />

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          {(services ?? []).map((s) => (
            <div key={s.id} className="sacred-card">
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="font-display text-2xl text-gold mb-3">{s.title}</h3>
              <p className="text-ivory/90 mb-6">{s.description}</p>
              <Link to="/contact" className="btn-outline">
                Prendre Rendez-vous
              </Link>
            </div>
          ))}
        </div>

        <div className="sacred-card text-center mt-12 border-gold">
          <p className="font-italic-serif text-xl text-ivory">
            📦 Vous êtes à l'étranger ? Nous livrons nos préparations dans tous les pays du monde.
            Consultations par WhatsApp, suivi personnalisé, discrétion garantie.
          </p>
        </div>
      </section>
    </Page>
  );
}
