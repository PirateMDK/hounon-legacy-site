import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import PromoBanner from "@/components/PromoBanner";
import djimaPortrait from "@/assets/djima-portrait.png";
import altarImg from "@/assets/altar.jpg";
import flagBenin from "@/assets/flag-benin.png";
import { WA_NUMBER } from "@/components/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hounon Propre — Maître Spirituel Vodoun & Guérisseur Traditionnel" },
      { name: "description", content: "KINWAHO HOUNGUEVI DJIMA. Consultations, rituels, guérison, formations. Bénin & monde entier." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: vodouns } = useQuery({
    queryKey: ["vodouns-preview"],
    queryFn: async () => {
      const { data } = await supabase.from("vodouns").select("*").eq("visible", true).order("sort_order").limit(3);
      return data ?? [];
    },
  });

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials-home"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("status", "approved").limit(4);
      return data ?? [];
    },
  });

  return (
    <Page>
      {/* HERO */}
      <section className="hero-glow relative min-h-[90vh] flex items-center px-6 overflow-hidden">
        <div className="float-orb" style={{ width: 300, height: 300, background: "oklch(0.45 0.18 25)", top: "10%", left: "5%" }} />
        <div className="float-orb" style={{ width: 400, height: 400, background: "oklch(0.78 0.13 80)", bottom: "5%", right: "8%", animationDelay: "3s" }} />
        <div className="relative z-10 mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center py-20">
          <div className="fade-up text-center md:text-left">
            <p className="font-italic-serif text-gold tracking-widest text-sm mb-4 inline-flex items-center gap-2 justify-center md:justify-start">— Bénin <img src={flagBenin} alt="Bénin" className="h-3 w-auto rounded-[1px] inline" style={{ width: 20 }} /> & Monde Entier —</p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl gold-text mb-3 leading-tight">HOUNON PROPRE</h1>
            <p className="font-italic-serif text-2xl text-sand mb-6">KINWAHO HOUNGUEVI DJIMA</p>
            <p className="font-italic-serif text-xl text-ivory mb-3 leading-snug">
              « Là où la médecine moderne s'arrête,<br />la sagesse des ancêtres commence. »
            </p>
            <p className="text-sand mb-8 text-sm uppercase tracking-widest">Maître Spirituel & Guérisseur Traditionnel Vodoun</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/contact" className="btn-primary">Prendre Rendez-vous</Link>
              <Link to="/services" className="btn-outline">Découvrir mes Services</Link>
            </div>
          </div>
          <div className="fade-up flex justify-center" style={{ animationDelay: "0.3s" }}>
            <div className="pulse-ring w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-2 border-gold/50" style={{ boxShadow: "var(--shadow-gold)" }}>
              <img src={djimaPortrait} alt="KINWAHO HOUNGUEVI DJIMA — Hounon Propre" className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="px-6 py-20 mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🔮", title: "Services Spirituels", text: "Rituels, consultations et guérisons disponibles dans le monde entier." },
            { icon: "📚", title: "Formations", text: "Apprenez les savoirs ancestraux et obtenez votre diplôme reconnu." },
            { icon: "🌍", title: "Livraison à Distance", text: "Vos préparations livrées dans n'importe quel pays du monde." },
          ].map((p) => (
            <div key={p.title} className="sacred-card text-center">
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="font-display text-xl text-gold mb-3">{p.title}</h3>
              <p className="text-sand text-sm">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6"><div className="gold-divider" /></div>

      {/* ABOUT PREVIEW */}
      <section className="px-6 py-16 mx-auto max-w-5xl text-center">
        <h2 className="section-title">L'Héritier d'une Tradition Sacrée</h2>
        <p className="text-ivory mt-8 max-w-3xl mx-auto leading-relaxed">
          Héritier d'une longue lignée de prêtres vodoun, Hounon Propre détient les attributs sacrés du Houn — cette entité invisible qui permet d'intercéder auprès des ancêtres divinisés pour sauver et guérir les êtres humains.
        </p>
        <Link to="/biographie" className="btn-outline mt-8">En savoir plus</Link>
      </section>

      <div className="mx-auto max-w-6xl px-6"><div className="gold-divider" /></div>

      {/* VODOUNS PREVIEW */}
      <section className="px-6 py-16 mx-auto max-w-6xl">
        <h2 className="section-title">Ses Vodouns Tutélaires</h2>
        <p className="text-sand text-center max-w-3xl mx-auto mt-6 font-italic-serif text-lg">
          Hounon Propre est consacré à plusieurs divinités vodoun dont les pouvoirs guident chacune de ses interventions. Parmi eux :
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {(vodouns ?? []).map((v) => (
            <div key={v.id} className="sacred-card">
              <div className="text-4xl mb-4">{v.symbol}</div>
              <h3 className="font-display text-xl text-gold mb-1">{v.name}</h3>
              {v.subtitle && <p className="font-italic-serif text-sand text-sm mb-3">{v.subtitle}</p>}
              <p className="text-ivory/80 text-sm line-clamp-4">{v.description}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sand font-italic-serif mt-8">et plusieurs autres divinités sacrées…</p>
        <div className="text-center mt-6">
          <Link to="/biographie" hash="vodouns" className="btn-outline">Voir tous les Vodouns</Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6"><div className="gold-divider" /></div>

      {/* TESTIMONIALS */}
      <section className="px-6 py-16 mx-auto max-w-6xl">
        <h2 className="section-title">Ils témoignent</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {(testimonials ?? []).map((t) => (
            <div key={t.id} className="sacred-card">
              <div className="text-gold mb-3">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
              <p className="font-italic-serif text-ivory text-lg leading-relaxed">« {t.text} »</p>
              <p className="mt-4 text-sand text-sm">— {t.first_name}, {t.country}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/temoignages" className="btn-outline">Tous les témoignages</Link>
        </div>
      </section>

      {/* REMOTE BANNER */}
      <section className="relative px-6 py-20 mt-16 overflow-hidden">
        <img src={altarImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-gold mb-4">
            Vous êtes en Europe, en Amérique, en Asie ou ailleurs en Afrique ?
          </h2>
          <p className="font-italic-serif text-xl text-ivory mb-8">
            Hounon Propre vous accompagne à distance. Livraison de préparations dans tous les pays. Consultations par WhatsApp.
          </p>
          <Link to="/contact" className="btn-primary">Prendre Rendez-vous</Link>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="btn-outline ml-3">WhatsApp Direct</a>
        </div>
      </section>
    </Page>
  );
}
