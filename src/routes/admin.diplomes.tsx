import { createFileRoute } from "@tanstack/react-router";
import { CrudPanel } from "@/components/admin/CrudPanel";

export const Route = createFileRoute("/admin/diplomes")({
  component: () => (
    <CrudPanel title="Diplômés" table="graduates" fields={[
      { key: "full_name", label: "Nom complet" },
      { key: "specialty", label: "Spécialité" },
      { key: "location", label: "Localisation" },
      { key: "contact", label: "Contact" },
      { key: "photo_url", label: "URL Photo" },
      { key: "bio", label: "Biographie", type: "textarea" },
      { key: "sort_order", label: "Ordre", type: "number" },
      { key: "visible", label: "Visible", type: "boolean" },
    ]} />
  ),
});
