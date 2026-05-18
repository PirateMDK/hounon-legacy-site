import { createFileRoute } from "@tanstack/react-router";
import { CrudPanel } from "@/components/admin/CrudPanel";

export const Route = createFileRoute("/admin/evenements")({
  component: () => (
    <CrudPanel title="Événements" table="events" orderBy="event_date" fields={[
      { key: "title", label: "Titre" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "event_date", label: "Date", type: "date" },
      { key: "event_time", label: "Horaire" },
      { key: "location", label: "Lieu" },
      { key: "cover_image_url", label: "Image de couverture (URL)" },
      { key: "status", label: "Statut", type: "select", options: ["a_venir", "passe", "brouillon"], defaultValue: "a_venir" },
    ]} />
  ),
});
