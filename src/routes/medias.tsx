import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import ceremonyImg from "@/assets/ceremony.jpg";
import plantsImg from "@/assets/plants.jpg";
import altarImg from "@/assets/altar.jpg";

export const Route = createFileRoute("/medias")({
  head: () => ({ meta: [{ title: "Médias — Hounon Propre" }] }),
  component: () => {
    const { data: videos } = useQuery({
      queryKey: ["videos"],
      queryFn: async () => (await supabase.from("media_videos").select("*").order("sort_order")).data ?? [],
    });
    const { data: photos } = useQuery({
      queryKey: ["photos"],
      queryFn: async () => (await supabase.from("media_photos").select("*").order("sort_order")).data ?? [],
    });
    const placeholders = [ceremonyImg, plantsImg, altarImg, ceremonyImg];
    return (
      <Page>
        <section className="px-6 py-20 mx-auto max-w-6xl">
          <h1 className="section-title">Vidéos & Médias</h1>
          <h2 className="font-display text-2xl text-gold mt-16 mb-6">Vidéos & Conférences</h2>
          {videos && videos.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {videos.map((v) => (
                <div key={v.id} className="sacred-card">
                  <div className="aspect-video bg-black rounded-sm overflow-hidden mb-3">
                    <iframe src={v.youtube_url} className="w-full h-full" allowFullScreen title={v.title} />
                  </div>
                  <h3 className="font-display text-gold">{v.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {placeholders.map((src, i) => (
                <div key={i} className="sacred-card p-0 overflow-hidden">
                  <div className="aspect-video relative">
                    <img src={src} alt="" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gold/80 flex items-center justify-center text-background text-3xl">▶</div>
                    </div>
                  </div>
                  <p className="p-3 font-italic-serif text-sand text-center">Vidéo à venir</p>
                </div>
              ))}
            </div>
          )}

          <div className="gold-divider" />

          <h2 className="font-display text-2xl text-gold mb-6">Galerie</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(photos && photos.length > 0 ? photos.map((p) => p.image_url) : [ceremonyImg, plantsImg, altarImg, ceremonyImg, plantsImg, altarImg]).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-sm border border-border hover:border-gold transition">
                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      </Page>
    );
  },
});
