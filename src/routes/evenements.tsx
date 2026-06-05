import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";

export const Route = createFileRoute("/evenements")({
  head: () => ({ meta: [{ title: "Événements — Hounon Propre" }] }),
  component: () => {
    const [tab, setTab] = useState<"a_venir" | "passes">("a_venir");

    useEffect(() => {
      const blockContextMenu = (e: MouseEvent) => e.preventDefault();
      const blockKeys = (e: KeyboardEvent) => {
        if (
          (e.ctrlKey && ["s", "u", "p", "a", "c"].includes(e.key.toLowerCase())) ||
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
        ) {
          e.preventDefault();
        }
      };
      document.addEventListener("contextmenu", blockContextMenu);
      document.addEventListener("keydown", blockKeys);
      return () => {
        document.removeEventListener("contextmenu", blockContextMenu);
        document.removeEventListener("keydown", blockKeys);
      };
    }, []);

    const { data: events } = useQuery({
      queryKey: ["events"],
      queryFn: async () => {
        const { data } = await supabase
          .from("events")
          .select("*")
          .order("event_date", { ascending: false });
        return (data ?? []) as Array<Record<string, string | null>>;
      },
    });

    const today = new Date().toISOString().slice(0, 10);
    const filtered = (events ?? []).filter((e) =>
      tab === "a_venir" ? (e.event_date ?? "") >= today : (e.event_date ?? "") < today,
    );

    return (
      <Page>
        <section className="px-6 py-20 mx-auto max-w-6xl">
          <h1 className="section-title">Événements</h1>
          <div className="flex justify-center gap-3 mt-10">
            <button
              onClick={() => setTab("a_venir")}
              className={tab === "a_venir" ? "btn-primary" : "btn-outline"}
            >
              À venir
            </button>
            <button
              onClick={() => setTab("passes")}
              className={tab === "passes" ? "btn-primary" : "btn-outline"}
            >
              Passés
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-sand mt-12 font-italic-serif text-lg">
              {tab === "a_venir"
                ? "Aucun événement prévu pour le moment. Revenez bientôt."
                : "Aucun événement passé à afficher."}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {filtered.map((e) => (
                <div key={e.id} className="sacred-card">

                  {e.cover_image_url && (
                    <img
                      src={e.cover_image_url}
                      alt=""
                      className="w-full h-40 object-cover rounded-sm mb-4 pointer-events-none select-none"
                      draggable={false}
                      onContextMenu={(ev) => ev.preventDefault()}
                    />
                  )}

                  {e.video_url && (
                    <video
                      src={e.video_url}
                      controls
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      className="w-full rounded-sm mb-4"
                      onContextMenu={(ev) => ev.preventDefault()}
                    />
                  )}

                  {e.youtube_url && !e.video_url && (
                    <div className="mb-4 rounded-sm overflow-hidden">
                      <iframe
                        src={e.youtube_url.replace("watch?v=", "embed/")}
                        className="w-full h-48"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        title={e.title ?? ""}
                      />
                    </div>
                  )}

                  <h3 className="font-display text-xl text-gold">{e.title}</h3>
                  <p className="text-sand text-sm mt-2">
                    {e.event_date && new Date(e.event_date).toLocaleDateString("fr-FR")}
                    {e.event_time && ` · ${e.event_time}`}
                  </p>
                  {e.location && (
                    <p className="text-sand text-sm">{e.location}</p>
                  )}
                  {e.description && (
                    <p className="text-ivory/90 mt-3 text-sm select-none">{e.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </Page>
    );
  },
});