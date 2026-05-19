import { createFileRoute } from "@tanstack/react-router";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";

export const Route = createFileRoute("/admin/hommages")({
  component: () => (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Hommages</h1>
      <p className="text-sand mb-6">Gérez les hommages affichés sur le site.</p>
      <SiteContentEditor contentKey="tribute" title="Hommage à KINWAHO HOUNGUEVI ADITI (Père)"
        fields={[
          { key: "visible", label: "Section visible", type: "boolean" },
          { key: "title", label: "Titre" },
          { key: "subtitle", label: "Sous-titre" },
          { key: "caption_name", label: "Nom légende" },
          { key: "caption_subtitle", label: "Sous-titre légende" },
          { key: "photo_url", label: "URL photo (vide = défaut)", type: "url" },
          { key: "text", label: "Texte de l'hommage", type: "textarea" },
          { key: "closing", label: "Phrase de clôture" },
        ]} />
    </div>
  ),
});
