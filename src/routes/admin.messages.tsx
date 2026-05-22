import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Mail, MessageCircle, Reply, X } from "lucide-react";
import { useState } from "react";

function normalizePhoneForWa(phone: string) {
  // wa.me requires international format digits only (with leading + optional)
  const cleaned = (phone || "").replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : cleaned;
}

export const Route = createFileRoute("/admin/messages")({
  component: MessagesAdmin,
});

const EMPTY = { full_name: "", country: "", email: "", phone: "", service: "", preferred_date: "", message: "" };

function MessagesAdmin() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const buildReplyBody = (m: any, text: string) =>
    `${text}\n\n— Hounon Propre\n\n--- Message original ---\nDe : ${m.full_name} (${m.country})\nDate : ${new Date(m.created_at).toLocaleString("fr-FR")}\n\n${m.message}`;

  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const mark = async (id: string, status: string) => {
    await supabase.from("messages").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    await supabase.from("messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
    toast.success("Supprimé");
  };
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...f, preferred_date: f.preferred_date || null, status: "traite" };
    const { error } = await supabase.from("messages").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Message enregistré");
    setF(EMPTY);
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-3xl text-gold">Boîte de réception</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={16} /> {showForm ? "Annuler" : "Nouveau message"}
        </button>
      </div>
      <p className="text-sand mb-6">Demandes et messages reçus depuis le site. Vous pouvez aussi créer un message manuellement (appel téléphonique, WhatsApp, etc.).</p>

      {showForm && (
        <form onSubmit={create} className="sacred-card border border-gold/40 space-y-3 mb-6">
          <h3 className="font-display text-xl text-gold">Nouveau message</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Nom complet" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} className="px-3 py-2 bg-input border border-border rounded text-ivory" />
            <input required placeholder="Pays" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className="px-3 py-2 bg-input border border-border rounded text-ivory" />
            <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="px-3 py-2 bg-input border border-border rounded text-ivory" />
            <input required placeholder="Téléphone / WhatsApp" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="px-3 py-2 bg-input border border-border rounded text-ivory" />
            <input placeholder="Service (optionnel)" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} className="px-3 py-2 bg-input border border-border rounded text-ivory" />
            <input type="date" value={f.preferred_date} onChange={(e) => setF({ ...f, preferred_date: e.target.value })} className="px-3 py-2 bg-input border border-border rounded text-ivory" />
          </div>
          <textarea required rows={4} placeholder="Message" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </form>
      )}

      <div className="space-y-3">
        {(data ?? []).map((m) => (
          <div key={m.id} className={`sacred-card ${m.status === "nouveau" ? "border-gold/60" : ""}`}>
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <p className="text-ivory font-medium">{m.full_name} <span className="text-sand">— {m.country}</span></p>
                <p className="text-sand text-xs">{m.email} · {m.phone} · {new Date(m.created_at).toLocaleString("fr-FR")}</p>
                {m.service && <p className="text-gold text-sm mt-1">Service : {m.service}{m.preferred_date && ` · Date souhaitée : ${m.preferred_date}`}</p>}
              </div>
              <div className="flex gap-2 items-start flex-wrap">
                <span className={`text-xs px-2 py-1 rounded ${m.status === "nouveau" ? "bg-gold/30 text-gold" : "bg-secondary text-sand"}`}>{m.status}</span>
                {m.status === "nouveau" && <button onClick={() => mark(m.id, "traite")} className="text-xs px-3 py-1 text-gold border border-gold/40 rounded">Marquer traité</button>}
                <button
                  onClick={() => setReplyOpen((s) => ({ ...s, [m.id]: !s[m.id] }))}
                  className="text-xs px-3 py-1 text-gold border border-gold/40 rounded inline-flex items-center gap-1"
                >
                  {replyOpen[m.id] ? <X size={12} /> : <Reply size={12} />} Répondre
                </button>
                <button onClick={() => remove(m.id)} className="text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-ivory mt-3 whitespace-pre-wrap">{m.message}</p>

            {replyOpen[m.id] && (
              <div className="mt-4 border-t border-gold/20 pt-4 space-y-3">
                <textarea
                  rows={4}
                  placeholder={`Bonjour ${m.full_name?.split(" ")[0] || ""}, merci pour votre message…`}
                  value={replyText[m.id] || ""}
                  onChange={(e) => setReplyText((s) => ({ ...s, [m.id]: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded text-ivory"
                />
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Réponse à votre demande — Hounon Propre`)}&body=${encodeURIComponent(buildReplyBody(m, replyText[m.id] || ""))}`}
                    onClick={() => { if (m.status === "nouveau") mark(m.id, "traite"); }}
                    className="text-xs px-3 py-2 border border-gold/40 text-gold rounded inline-flex items-center gap-2 hover:bg-gold/10"
                  >
                    <Mail size={14} /> Envoyer par email
                  </a>
                  {m.phone && (
                    <a
                      href={`https://wa.me/${normalizePhoneForWa(m.phone)}?text=${encodeURIComponent(buildReplyBody(m, replyText[m.id] || ""))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => { if (m.status === "nouveau") mark(m.id, "traite"); }}
                      className="text-xs px-3 py-2 bg-[#25D366] text-black rounded inline-flex items-center gap-2 font-medium hover:opacity-90"
                    >
                      <MessageCircle size={14} /> Envoyer par WhatsApp
                    </a>
                  )}
                </div>
                <p className="text-sand/70 text-xs italic">
                  Le message s'ouvre dans votre client mail ou directement dans WhatsApp. Le statut passe à « traité » à l'envoi.
                </p>
              </div>
            )}
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="text-sand italic">Aucun message.</p>}
      </div>
    </div>
  );
}
