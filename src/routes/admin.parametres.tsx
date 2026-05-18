import { createFileRoute } from "@tanstack/react-router";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/parametres")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const [pwd, setPwd] = useState("");
  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) { toast.error("Minimum 8 caractères"); return; }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) { toast.error(error.message); return; }
    toast.success("Mot de passe mis à jour");
    setPwd("");
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-gold mb-2">Paramètres</h1>
        <p className="text-sand">Configuration générale et sécurité.</p>
      </div>

      <section className="sacred-card">
        <h3 className="font-display text-xl text-gold mb-4">Changer le mot de passe</h3>
        <form onSubmit={change} className="space-y-3 max-w-md">
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Nouveau mot de passe (min. 8 caractères)"
            className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
          <button type="submit" className="btn-primary text-sm">Mettre à jour</button>
        </form>
      </section>

      <SiteContentEditor contentKey="contact_info" title="Coordonnées publiques" fields={[
        { key: "whatsapp", label: "WhatsApp (affiché)" },
        { key: "whatsapp_number", label: "Numéro WhatsApp international (sans +)" },
        { key: "email", label: "Email" },
        { key: "address", label: "Adresse" },
      ]} />

      <SiteContentEditor contentKey="logos" title="Logos officiels (pied de page)" fields={[
        { key: "cncvb_visible", label: "Logo CNCVB-Racine visible", type: "boolean" },
        { key: "ministere_visible", label: "Logo Ministère de la Culture visible", type: "boolean" },
        { key: "flag_visible", label: "Drapeau Bénin visible", type: "boolean" },
      ]} />
    </div>
  );
}
