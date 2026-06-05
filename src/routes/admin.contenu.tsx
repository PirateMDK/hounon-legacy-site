import { createFileRoute } from "@tanstack/react-router";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";
import { CrudPanel } from "@/components/admin/CrudPanel";
import { useState } from "react";

export const Route = createFileRoute("/admin/contenu")({
  component: ContentAdmin,
});

const TABS = [
  "Biographie",
  "Hommage au Père",
  "Bannière Promo",
  "Informations Contact",
  "Galerie & Médias",
] as const;

function ContentAdmin() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Biographie");
  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Contenu & Biographie</h1>
      <p className="text-sand mb-6">Modifiez les textes affichés sur le site public.</p>
      <div className="flex gap-2 border-b border-border mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-display tracking-wider ${tab === t ? "text-gold border-b-2 border-gold" : "text-sand"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Biographie" && (
        <SiteContentEditor
          contentKey="biography"
          title="Texte biographique"
          fields={[
            {
              key: "text",
              label: "Biographie complète (un paragraphe par double saut de ligne)",
              type: "textarea",
            },
          ]}
        />
      )}

      {tab === "Hommage au Père" && (
        <SiteContentEditor
          contentKey="tribute"
          title="Hommage à KINWAHO HOUNGUEVI ADITI"
          fields={[
            { key: "visible", label: "Section visible", type: "boolean" },
            { key: "title", label: "Titre" },
            { key: "subtitle", label: "Sous-titre" },
            { key: "caption_name", label: "Nom (légende sous la photo)" },
            { key: "caption_subtitle", label: "Sous-titre légende" },
            {
              key: "photo_url",
              label: "URL photo du père (laisser vide pour utiliser la photo par défaut)",
              type: "url",
            },
            { key: "text", label: "Texte de l'hommage", type: "textarea" },
            { key: "closing", label: "Phrase de clôture" },
          ]}
        />
      )}

      {tab === "Bannière Promo" && (
        <SiteContentEditor
          contentKey="promo_banner"
          title="Bannière promotionnelle (Accueil + Services)"
          fields={[
            { key: "visible", label: "Bannière visible", type: "boolean" },
            { key: "title", label: "Titre" },
            { key: "subtitle", label: "Sous-titre / description" },
            { key: "cta_label", label: "Texte du bouton" },
            { key: "cta_link", label: "Lien du bouton (ex: /contact)" },
            {
              key: "image_url",
              label: "URL image de fond (laisser vide pour défaut)",
              type: "url",
            },
          ]}
        />
      )}

      {tab === "Informations Contact" && (
        <SiteContentEditor
          contentKey="contact_info"
          title="Coordonnées"
          fields={[
            { key: "whatsapp", label: "WhatsApp (affiché)" },
            { key: "whatsapp_number", label: "Numéro WhatsApp (format international sans +)" },
            { key: "email", label: "Email" },
            { key: "address", label: "Adresse" },
          ]}
        />
      )}

      {tab === "Galerie & Médias" && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-2xl text-gold mb-4">Galerie Photos</h2>
            <CrudPanel
              title="Photos"
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
          </div>

          <div className="border-t border-gold/40 pt-8">
            <h2 className="font-display text-2xl text-gold mb-4">Vidéos</h2>
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
          </div>
        </div>
      )}
    </div>
  );
}
