import { createFileRoute } from "@tanstack/react-router";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";
import { useState } from "react";

export const Route = createFileRoute("/admin/contenu")({
  component: ContentAdmin,
});

const TABS = ["Biographie", "Hommage au Père", "Bannière Promo", "Informations Contact"] as const;

function ContentAdmin() {
  const [tab, setTab] = useState<typeof TABS[number]>("Biographie");
  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Contenu & Biographie</h1>
      <p className="text-sand mb-6">Modifiez les textes affichés sur le site public.</p>
      <div className="flex gap-2 border-b border-border mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-display tracking-wider ${tab === t ? "text-gold border-b-2 border-gold" : "text-sand"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Biographie" && (
        <SiteContentEditor contentKey="biography" title="Texte biographique"
          fields={[{ key: "text", label: "Biographie complète (un paragraphe par double saut de ligne)", type: "textarea" }]} />
      )}

      {tab === "Hommage au Père" && (
        <SiteContentEditor contentKey="tribute" title="Hommage à KINWAHO HOUNGUEVI ADITI"
          fields={[
            { key: "visible", label: "Section visible", type: "boolean" },
            { key: "title", label: "Titre" },
            { key: "subtitle", label: "Sous-titre" },
            { key: "caption_name", label: "Nom (légende sous la photo)" },
            { key: "caption_subtitle", label: "Sous-titre légende" },
            { key: "photo_url", label: "URL photo du père (laisser vide pour utiliser la photo par défaut)", type: "url" },
            { key: "text", label: "Texte de l'hommage", type: "textarea" },
            { key: "closing", label: "Phrase de clôture" },
          ]} />
      )}

      {tab === "Informations Contact" && (
        <SiteContentEditor contentKey="contact_info" title="Coordonnées"
          fields={[
            { key: "whatsapp", label: "WhatsApp (affiché)" },
            { key: "whatsapp_number", label: "Numéro WhatsApp (format international sans +)" },
            { key: "email", label: "Email" },
            { key: "address", label: "Adresse" },
          ]} />
      )}
    </div>
  );
}
