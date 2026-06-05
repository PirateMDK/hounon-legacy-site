import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import ceremonyImg from "@/assets/ceremony.jpg";
import plantsImg from "@/assets/plants.jpg";
import altarImg from "@/assets/altar.jpg";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Film,
  Image as ImageIcon,
  Grid3X3,
  Search,
  Play,
} from "lucide-react";

const PAGE_SIZE = 9;

export const Route = createFileRoute("/medias")({
  head: () => ({ meta: [{ title: "Médias — Hounon Propre" }] }),
  component: MediasPage,
});

type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  video_date: string | null;
};
type PhotoItem = {
  src: string;
  title: string | null;
  description: string | null;
  date: string | null;
};

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function MediasPage() {
  const { data: videosRaw } = useQuery({
    queryKey: ["videos"],
    queryFn: async () =>
      (await supabase.from("media_videos").select("*").order("sort_order")).data ?? [],
  });
  const { data: photosRaw } = useQuery({
    queryKey: ["photos"],
    queryFn: async () =>
      (await supabase.from("media_photos").select("*").order("sort_order")).data ?? [],
  });

  const fallback = [ceremonyImg, plantsImg, altarImg, ceremonyImg, plantsImg, altarImg];
  const allPhotosBase: PhotoItem[] =
    photosRaw && photosRaw.length > 0
      ? photosRaw.map((p) => ({
          src: p.image_url,
          title: p.title as string | null,
          description: p.description as string | null,
          date: (p.photo_date as string | null) ?? null,
        }))
      : fallback.map((src) => ({ src, title: null, description: null, date: null }));

  const videos: VideoRow[] = (videosRaw ?? []) as VideoRow[];

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "videos" | "photos">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"title-asc" | "title-desc" | "date-desc" | "date-asc">(
    "title-asc",
  );

  const handleFilterChange = (f: "all" | "videos" | "photos") => {
    setFilter(f);
    setPage(1);
  };

  const norm = (s: string | null | undefined) => (s ?? "").toLowerCase();

  const filteredPhotos = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allPhotosBase.filter(
      (p) => !q || norm(p.title).includes(q) || norm(p.description).includes(q),
    );
    list = [...list].sort((a, b) => {
      if (sort.startsWith("title")) {
        const r = norm(a.title).localeCompare(norm(b.title));
        return sort === "title-asc" ? r : -r;
      }
      const da = a.date ?? "",
        db = b.date ?? "";
      const r = da.localeCompare(db);
      return sort === "date-asc" ? r : -r;
    });
    return list;
  }, [allPhotosBase, search, sort]);

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = videos.filter(
      (v) => !q || norm(v.title).includes(q) || norm(v.description).includes(q),
    );
    list = [...list].sort((a, b) => {
      if (sort.startsWith("title")) {
        const r = norm(a.title).localeCompare(norm(b.title));
        return sort === "title-asc" ? r : -r;
      }
      const da = a.video_date ?? "",
        db = b.video_date ?? "";
      const r = da.localeCompare(db);
      return sort === "date-asc" ? r : -r;
    });
    return list;
  }, [videos, search, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / PAGE_SIZE));
  const visible = filteredPhotos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () =>
      setLightbox((i) =>
        i === null ? null : (i - 1 + filteredPhotos.length) % filteredPhotos.length,
      ),
    [filteredPhotos.length],
  );
  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % filteredPhotos.length)),
    [filteredPhotos.length],
  );

  const [videoModal, setVideoModal] = useState<VideoRow | null>(null);
  const closeVideo = useCallback(() => setVideoModal(null), []);

  useEffect(() => {
    if (lightbox === null && !videoModal) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        closeVideo();
      } else if (lightbox !== null && e.key === "ArrowLeft") prev();
      else if (lightbox !== null && e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, videoModal, close, closeVideo, prev, next]);

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

        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre ou description…"
              className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-sm text-ivory placeholder:text-sand/60 focus:border-gold focus:outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="px-3 py-2.5 bg-card border border-border rounded-sm text-ivory focus:border-gold focus:outline-none font-display text-sm"
            aria-label="Trier"
          >
            <option value="title-asc">Titre (A → Z)</option>
            <option value="title-desc">Titre (Z → A)</option>
            <option value="date-desc">Date (récent → ancien)</option>
            <option value="date-asc">Date (ancien → récent)</option>
          </select>
        </div>

        {filter !== "photos" && (
          <>
            <h2 className="font-display text-2xl text-gold mt-4 mb-6">
              Vidéos & Conférences{" "}
              {filteredVideos.length > 0 && (
                <span className="text-sand text-sm">({filteredVideos.length})</span>
              )}
            </h2>
            {filteredVideos.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {filteredVideos.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVideoModal(v)}
                    className="sacred-card text-left group cursor-pointer hover:border-gold transition"
                  >
                    <div className="aspect-video bg-black rounded-sm overflow-hidden mb-3 relative">
                      {v.thumbnail_url ? (
                        <img
                          src={v.thumbnail_url}
                          alt={v.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-black to-stone-900" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center text-background group-hover:scale-110 transition">
                          <Play size={22} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-display text-gold">{v.title}</h3>
                    {v.description && (
                      <p className="text-sand text-sm mt-1 line-clamp-2">{v.description}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sand italic">
                Aucune vidéo {search && "ne correspond à votre recherche"}.
              </p>
            )}
          </>
        )}

        {filter === "all" && <div className="gold-divider" />}

        {filter !== "videos" && (
          <>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-2xl text-gold">Galerie</h2>
              <p className="text-sand text-sm">
                {filteredPhotos.length} photo{filteredPhotos.length > 1 ? "s" : ""} — page {page}/
                {totalPages}
              </p>
            </div>

            {filteredPhotos.length === 0 ? (
              <p className="text-sand italic">
                Aucune photo {search && "ne correspond à votre recherche"}.
              </p>
            ) : (
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
                      <img
                        src={p.src}
                        alt={p.title ?? ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-10 h-10 rounded-sm border font-display ${n === page ? "bg-gold text-background border-gold" : "border-border text-sand hover:border-gold"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {lightbox !== null && filteredPhotos[lightbox] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 text-ivory hover:text-gold p-2"
            aria-label="Fermer"
          >
            <X size={28} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 text-ivory hover:text-gold p-2"
            aria-label="Précédent"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 text-ivory hover:text-gold p-2"
            aria-label="Suivant"
          >
            <ChevronRight size={36} />
          </button>
          <figure
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredPhotos[lightbox].src}
              alt={filteredPhotos[lightbox].title ?? ""}
              className="max-h-[80vh] w-auto object-contain border-2 border-gold/40"
            />
            {(filteredPhotos[lightbox].title || filteredPhotos[lightbox].description) && (
              <figcaption className="text-center mt-4 max-w-2xl">
                {filteredPhotos[lightbox].title && (
                  <p className="font-display text-gold text-lg">{filteredPhotos[lightbox].title}</p>
                )}
                {filteredPhotos[lightbox].description && (
                  <p className="font-italic-serif text-sand text-sm mt-1">
                    {filteredPhotos[lightbox].description}
                  </p>
                )}
              </figcaption>
            )}
            <p className="text-sand text-xs mt-2">
              {lightbox + 1} / {filteredPhotos.length}
            </p>
          </figure>
        </div>
      )}

      {videoModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeVideo}
            className="absolute top-4 right-4 text-ivory hover:text-gold p-2"
            aria-label="Fermer"
          >
            <X size={28} />
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-black border-2 border-gold/40 rounded-sm overflow-hidden">
              {isYouTube(videoModal.youtube_url) ? (
                <iframe
                  src={videoModal.youtube_url}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={videoModal.title}
                />
              ) : (
                <video src={videoModal.youtube_url} className="w-full h-full" controls autoPlay />
              )}
            </div>
            <div className="text-center mt-4">
              <h3 className="font-display text-gold text-xl">{videoModal.title}</h3>
              {videoModal.description && (
                <p className="font-italic-serif text-sand text-sm mt-1 max-w-2xl mx-auto">
                  {videoModal.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
