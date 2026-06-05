import { createFileRoute } from "@tanstack/react-router";
import { CrudPanel } from "@/components/admin/CrudPanel";
import { useState } from "react";

export const Route = createFileRoute("/admin/medias")({
  component: MediasAdmin,
});

function MediasAdmin() {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-6">Médias</h1>
      <div className="flex gap-2 border-b border-border mb-6">
        <button
          onClick={() => setTab("photos")}
          className={`px-4 py-2 text-sm font-display ${tab === "photos" ? "text-gold border-b-2 border-gold" : "text-sand"}`}
        >
          Photos
        </button>
        <button
          onClick={() => setTab("videos")}
          className={`px-4 py-2 text-sm font-display ${tab === "videos" ? "text-gold border-b-2 border-gold" : "text-sand"}`}
        >
          Vidéos
        </button>
      </div>
      {tab === "photos" ? (
        <CrudPanel
          title="Galerie Photos"
          table="media_photos"
          fields={[
            { key: "title", label: "Titre" },
            { key: "description", label: "Description", type: "textarea" },
            {
              key: "image_url",
              label: "Image",
              type: "upload",
              accept: "image/*",
              bucket: "media",
            },
            { key: "photo_date", label: "Date", type: "date" },
            { key: "sort_order", label: "Ordre", type: "number" },
          ]}
        />
      ) : (
        <CrudPanel
          title="Vidéos"
          table="media_videos"
          fields={[
            { key: "title", label: "Titre" },
            { key: "description", label: "Description", type: "textarea" },
            {
              key: "youtube_url",
              label: "URL YouTube (embed) ou importer un fichier vidéo",
              type: "upload",
              accept: "video/mp4,video/webm,video/*",
              bucket: "media",
            },
            {
              key: "thumbnail_url",
              label: "Miniature (image)",
              type: "upload",
              accept: "image/*",
              bucket: "media",
            },
            { key: "video_date", label: "Date", type: "date" },
            { key: "sort_order", label: "Ordre", type: "number" },
          ]}
        />
      )}
    </div>
  );
}
