import { createFileRoute } from "@tanstack/react-router";
import { CrudPanel } from "@/components/admin/CrudPanel";

export const Route = createFileRoute("/admin/evenements")({
  component: () => (
    <CrudPanel
      title="Événements"
      table="events"
      orderBy="created_at"
      fields={[
        { key: "title", label: "Titre" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "event_date", label: "Date", type: "date" },
        { key: "event_time", label: "Horaire" },
        { key: "location", label: "Lieu" },
        {
          key: "cover_image_url",
          label: "Image de couverture",
          type: "upload",
          accept: "image/*",
          bucket: "media",
        },
        {
          key: "video_url",
          label: "Vidéo de l'événement",
          type: "upload",
          accept: "video/*",
          bucket: "media",
        },
        {
          key: "youtube_url",
          label: "Lien YouTube (optionnel)",
        },
        {
          key: "status",
          label: "Statut",
          type: "select",
          options: ["a_venir", "passe", "brouillon"],
          defaultValue: "a_venir",
        },
      ]}
    />
  ),
});