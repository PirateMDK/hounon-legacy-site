import { createFileRoute } from "@tanstack/react-router";
import { CrudPanel } from "@/components/admin/CrudPanel";

export const Route = createFileRoute("/admin/vodouns")({
  component: () => (
    <CrudPanel
      title="Vodouns Tutélaires"
      table="vodouns"
      fields={[
        { key: "name", label: "Nom" },
        { key: "subtitle", label: "Sous-titre" },
        { key: "symbol", label: "Symbole / Emoji" },
        { key: "photo_url", label: "Image", type: "upload", accept: "image/*", bucket: "media" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sort_order", label: "Ordre", type: "number" },
        { key: "visible", label: "Visible", type: "boolean" },
      ]}
    />
  ),
});
