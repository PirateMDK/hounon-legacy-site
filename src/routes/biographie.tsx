import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import djimaPortrait from "@/assets/djima-portrait.png";
import aditiFather from "@/assets/aditi-father.png";
import flagBenin from "@/assets/flag-benin.png";
import logoCncvb from "@/assets/logo-cncvb.png";
import logoMinistere from "@/assets/logo-ministere.png";
import philosophyImg from "@/assets/philosophy.webp";
import { MapPin, Plus } from "lucide-react";

export const Route = createFileRoute("/biographie")({
  head: () => ({
    meta: [
      { title: "Biographie — Hounon Propre" },
      {
        name: "description",
        content: "Parcours et lignée du maître spirituel KINWAHO HOUNGUEVI DJIMA.",
      },
    ],
  }),
  component: BiographyPage,
});

function BiographyPage() {
  const { data: bio } = useQuery({
    queryKey: ["bio"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "biography")
        .maybeSingle();
      return (data?.value as { text?: string })?.text ?? "";
    },
  });
  const { data: tribute } = useQuery({
    queryKey: ["tribute"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "tribute")
        .maybeSingle();
      return (data?.value as Record<string, string | boolean>) ?? null;
    },
  });
  const { data: timeline } = useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      const { data } = await supabase.from("timeline_milestones").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const { data: vodouns } = useQuery({
    queryKey: ["vodouns-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vodouns")
        .select("*")
        .eq("visible", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const fatherPhoto = (tribute?.photo_url as string) || aditiFather;
  const tributeText = (tribute?.text as string) || "";
  const tributeVisible = tribute?.visible !== false;

  return (
    <Page>
      <section className="px-6 py-20 mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <div className="pulse-ring w-64 h-64 rounded-full overflow-hidden border-2 border-gold/50 mb-8">
            <img
              src={djimaPortrait}
              alt="KINWAHO HOUNGUEVI DJIMA — Hounon Propre"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-4xl md:text-5xl gold-text">KINWAHO HOUNGUEVI DJIMA</h1>
          <p className="font-italic-serif text-2xl text-sand mt-2">dit Hounon Propre</p>
          <p className="text-gold mt-2 uppercase tracking-widest text-sm">
            Maître Spirituel · Prêtre Vodoun · Guérisseur Traditionnel
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sand">
            <MapPin size={16} className="text-gold" /> Pahou Founoucodji, Bénin
            <img
              src={flagBenin}
              alt="Drapeau du Bénin"
              className="h-4.5 rounded-sm"
              style={{ width: 28 }}
            />
          </p>
        </div>

        <div className="gold-divider" />

        <div className="prose prose-invert max-w-3xl mx-auto font-body text-ivory text-lg leading-relaxed text-justify">
          {(bio ?? "").split("\n\n").map((p, i) => (
            <p key={i} className="mb-4">
              {p}
            </p>
          ))}
        </div>

        {/* === PHILOSOPHY === */}
        <div className="gold-divider" />
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl text-gold mb-6">Sa Philosophie</h2>
          <div
            className="inline-block p-2 border-2 border-gold/60 rounded-sm bg-black"
            style={{ boxShadow: "var(--shadow-gold)" }}
          >
            <img
              src={philosophyImg}
              alt="Philosophie spirituelle de Honnongan Propre"
              className="w-full max-w-100 mx-auto"
              loading="lazy"
            />
          </div>
          <p className="font-italic-serif text-xl text-ivory mt-6 leading-relaxed">
            « Avec une forte concentration, on arrive à être en communication avec les éléments de
            la nature. »
          </p>
          <p className="font-display text-gold mt-3 tracking-wider">— Honnongan Propre</p>
        </div>

        {/* === TRIBUTE TO FATHER === */}
        {tributeVisible && (
          <>
            <div className="gold-divider" />
            <article className="tribute-card max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl md:text-4xl gold-text">
                  {(tribute?.title as string) || "Héritage Sacré"}
                </h2>
                <p className="font-italic-serif text-lg text-sand mt-2">
                  {(tribute?.subtitle as string) ||
                    "À KINWAHO HOUNGUEVI ADITI, celui qui a tout transmis"}
                </p>
              </div>
              <div className="grid md:grid-cols-[auto,1fr] gap-10 items-center">
                <div className="flex flex-col items-center">
                  <div className="father-frame">
                    <img
                      src={fatherPhoto}
                      alt="KINWAHO HOUNGUEVI ADITI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-display text-gold mt-5 text-lg tracking-wider text-center">
                    {(tribute?.caption_name as string) || "KINWAHO HOUNGUEVI ADITI"}
                  </p>
                  <p className="font-italic-serif text-sand text-center">
                    {(tribute?.caption_subtitle as string) || "Père, Maître & Prédécesseur"}
                  </p>
                </div>
                <div className="font-body text-ivory text-lg leading-relaxed">
                  {tributeText.split("\n\n").map((p, i) => (
                    <p key={i} className="mb-4">
                      {p}
                    </p>
                  ))}
                  <p className="font-italic-serif text-gold text-center mt-6 text-base">
                    {(tribute?.closing as string) ||
                      "— À KINWAHO HOUNGUEVI ADITI, en mémoire et en hommage éternel —"}
                  </p>
                </div>
              </div>
            </article>
          </>
        )}

        {/* === INSTITUTIONAL === */}
        <div className="gold-divider" />
        <div className="sacred-card max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl text-gold mb-4">Engagement Institutionnel</h2>
          <p className="text-ivory mb-6">
            Hounon Propre est reconnu et membre du Conseil National de la Culture Vodoun du Bénin
            (CNCVB-Racine — Atlantique), sous l'égide du Ministère du Tourisme, de la Culture et des
            Arts de la République du Bénin.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <img src={logoCncvb} alt="CNCVB-Racine" className="h-20 w-auto" />
            <img
              src={logoMinistere}
              alt="Ministère du Tourisme, de la Culture et des Arts"
              className="h-16 w-auto"
            />
            <img src={flagBenin} alt="République du Bénin" className="h-12 w-auto rounded-sm" />
          </div>
        </div>

        <div className="gold-divider" />

        <h2 className="section-title">Parcours</h2>
        <div className="max-w-2xl mx-auto mt-12 space-y-6">
          {(timeline ?? []).map((m) => (
            <div key={m.id} className="flex gap-6 items-start">
              <div className="font-display text-gold text-xl min-w-20">{m.year}</div>
              <div className="text-ivory border-l border-gold/40 pl-6">{m.description}</div>
            </div>
          ))}
        </div>

        <div className="gold-divider" />

        <div id="vodouns">
          <h2 className="section-title">Ses Vodouns Tutélaires</h2>
          <p className="font-italic-serif text-sand text-center max-w-3xl mx-auto mt-6">
            Hounon Propre est consacré à plusieurs divinités vodoun. Voici celles dont la présence
            guide son travail.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {(vodouns ?? []).map((v) => (
              <div
                key={v.id}
                className="sacred-card overflow-hidden p-0 flex flex-col"
                style={v.accent_color ? { borderColor: v.accent_color } : undefined}
              >
                {v.photo_url ? (
                  <div className="aspect-4/3 overflow-hidden bg-black">
                    <img
                      src={v.photo_url}
                      alt={v.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-700"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-4/3 flex items-center justify-center bg-black/60 text-6xl">
                    {v.symbol}
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{v.symbol}</span>
                    <h3 className="font-display text-xl text-gold leading-tight">{v.name}</h3>
                  </div>
                  {v.subtitle && (
                    <p className="font-italic-serif text-sand text-sm mb-3">{v.subtitle}</p>
                  )}
                  <p className="text-ivory/90 text-sm">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link to="/contact" className="btn-primary">
            Prendre Rendez-vous
          </Link>
        </div>
      </section>
    </Page>
  );
}
