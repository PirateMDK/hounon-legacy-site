import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import ceremonyImg from "@/assets/ceremony.jpg";
import plantsImg from "@/assets/plants.jpg";
import altarImg from "@/assets/altar.jpg";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Film, Image as ImageIcon, Grid3X3 } from "lucide-react";

const PAGE_SIZE = 9;

export const Route = createFileRoute("/medias")({
  head: () => ({ meta: [{ title: "Médias — Hounon Propre" }] }),
  component: MediasPage,
});

function MediasPage() {
  const { data: videos } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => (await supabase.from("media_videos").select("*").order("sort_order")).data ?? [],
  });
  const { data: photos } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => (await supabase.from("media_photos").select("*").order("sort_order")).data ?? [],
  });

  const fallback = [ceremonyImg, plantsImg, altarImg, ceremonyImg, plantsImg, altarImg];
  const allPhotos = (photos && photos.length > 0)
    ? photos.map((p) => ({ src: p.image_url, title: p.title as string | null, description: p.description as string | null }))
    : fallback.map((src) => ({ src, title: null, description: null }));

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "videos" | "photos">("all");

  const handleFilterChange = (f: "all" | "videos" | "photos") => {
    setFilter(f);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(allPhotos.length / PAGE_SIZE));
  const visible = allPhotos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => i === null ? null : (i - 1 + allPhotos.length) % allPhotos.length), [allPhotos.length]);
  const next = useCallback(() => setLightbox((i) => i === null ? null : (i + 1) % allPhotos.length), [allPhotos.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, close, prev, next]);

  const placeholders = [ceremonyImg, plantsImg, altarImg, ceremonyImg];

  return (
    <Page>
      <section className="px-6 py-20 mx-auto max-w-6xl">
        <h1 className="section-title">Vidéos & Médias</h1>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10 mb-6">
          {[
            { key: "all" as const, label: "Tout", icon: Grid3X3 },
            { key: "videos" as const, label: "Vidéos", icon: Film },
            { key: "photos" as const, label: "Photos", icon: ImageIcon },
          ].map((btn) => {
            const active = filter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => handleFilterChange(btn.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border font-display text-sm tracking-wide transition cursor-pointer ${
                  active
                    ? "bg-gold text-background border-gold shadow-[0_0_20px_oklch(0.78_0.13_80/0.25)]"
                    : "border-border text-sand hover:border-gold hover:text-gold"
                }`}
              >
                <btn.icon size={16} />
                {btn.label}
              </button>
            );
          })}
        </div>

        {filter !== "photos" && (
          <>
            <h2 className="font-display text-2xl text-gold mt-10 mb-6">Vidéos & Conférences</h2>
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
          </>
        )}

        {filter === "all" && <div className="gold-divider" />}

        {filter !== "videos" && (
          <>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-2xl text-gold">Galerie</h2>
              <p className="text-sand text-sm">{allPhotos.length} photo{allPhotos.length > 1 ? "s" : ""} — page {page}/{totalPages}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((p, i) => {
                const idx = (page - 1) * PAGE_SIZE + i;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightbox(idx)}
                    className="aspect-square overflow-hidden rounded-sm border border-border hover:border-gold transition cursor-zoom-in group"
                    aria-label={p.title ?? `Photo ${idx + 1}`}
                  >
                    <img src={p.src} alt={p.title ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={16} /> Précédent</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-10 h-10 rounded-sm border font-display ${n === page ? "bg-gold text-background border-gold" : "border-border text-sand hover:border-gold"}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed">Suivant <ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </section>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={close} role="dialog" aria-modal="true">
          <button onClick={close} className="absolute top-4 right-4 text-ivory hover:text-gold p-2" aria-label="Fermer">
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-ivory hover:text-gold p-2" aria-label="Précédent">
            <ChevronLeft size={36} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-ivory hover:text-gold p-2" aria-label="Suivant">
            <ChevronRight size={36} />
          </button>
          <figure className="max-w-5xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={allPhotos[lightbox].src} alt={allPhotos[lightbox].title ?? ""} className="max-h-[80vh] w-auto object-contain border-2 border-gold/40" />
            {(allPhotos[lightbox].title || allPhotos[lightbox].description) && (
              <figcaption className="text-center mt-4 max-w-2xl">
                {allPhotos[lightbox].title && <p className="font-display text-gold text-lg">{allPhotos[lightbox].title}</p>}
                {allPhotos[lightbox].description && <p className="font-italic-serif text-sand text-sm mt-1">{allPhotos[lightbox].description}</p>}
              </figcaption>
            )}
            <p className="text-sand text-xs mt-2">{lightbox + 1} / {allPhotos.length}</p>
          </figure>
        </div>
      )}
    </Page>
  );
}
