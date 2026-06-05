import { createFileRoute } from "@tanstack/react-router";
import { CrudPanel } from "@/components/admin/CrudPanel";

export const Route = createFileRoute("/admin/services")({
  component: () => (
    <CrudPanel
      title="Services Spirituels"
      table="services"
      fields={[
        { key: "title", label: "Titre" },
        { key: "icon", label: "Icône / Emoji" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sort_order", label: "Ordre", type: "number" },
        { key: "visible", label: "Visible", type: "boolean" },
      ]}
    />
  ),
});
