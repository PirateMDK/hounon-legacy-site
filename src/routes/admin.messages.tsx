import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Mail,
  MessageCircle,
  Reply,
  X,
  History,
  BellPlus,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useState } from "react";

function normalizePhoneForWa(phone: string) {
  const cleaned = (phone || "").replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : cleaned;
}

export const Route = createFileRoute("/admin/messages")({
  component: MessagesAdmin,
});

const EMPTY = {
  full_name: "",
  country: "",
  email: "",
  phone: "",
  service: "",
  preferred_date: "",
  message: "",
};

function MessagesAdmin() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [historyOpen, setHistoryOpen] = useState<Record<string, boolean>>({});
  const [followupOpen, setFollowupOpen] = useState<Record<string, boolean>>({});
  const [followupForm, setFollowupForm] = useState<
    Record<string, { remind_at: string; note: string }>
  >({});

  const buildReplyBody = (m: any, text: string) =>
    `${text}\n\n— Hounon Propre\n\n--- Message original ---\nDe : ${m.full_name} (${m.country})\nDate : ${new Date(m.created_at).toLocaleString("fr-FR")}\n\n${m.message}`;

  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: replies } = useQuery({
    queryKey: ["admin-message-replies"],
    queryFn: async () => {
      const { data } = await supabase
        .from("message_replies" as any)
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  const { data: followups } = useQuery({
    queryKey: ["admin-message-followups"],
    queryFn: async () => {
      const { data } = await supabase
        .from("message_followups" as any)
        .select("*")
        .order("remind_at", { ascending: true });
      return (data ?? []) as any[];
    },
  });

  const repliesBy = (id: string) => (replies ?? []).filter((r) => r.message_id === id);
  const followupsBy = (id: string) => (followups ?? []).filter((r) => r.message_id === id);

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
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Message enregistré");
    setF(EMPTY);
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };

  const logReply = async (m: any, channel: "email" | "whatsapp") => {
    const body = buildReplyBody(m, replyText[m.id] || "");
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("message_replies" as any).insert({
      message_id: m.id,
      channel,
      body,
      sent_by: u.user?.id ?? null,
    });
    if (m.status === "nouveau") await mark(m.id, "traite");
    qc.invalidateQueries({ queryKey: ["admin-message-replies"] });
    toast.success(`Réponse ${channel === "email" ? "email" : "WhatsApp"} enregistrée`);
  };

  const saveFollowup = async (m: any) => {
    const ff = followupForm[m.id];
    if (!ff?.remind_at) {
      toast.error("Date requise");
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("message_followups" as any).insert({
      message_id: m.id,
      remind_at: new Date(ff.remind_at).toISOString(),
      note: ff.note || null,
      created_by: u.user?.id ?? null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Suivi planifié");
    setFollowupForm((s) => ({ ...s, [m.id]: { remind_at: "", note: "" } }));
    setFollowupOpen((s) => ({ ...s, [m.id]: false }));
    qc.invalidateQueries({ queryKey: ["admin-message-followups"] });
  };

  const toggleFollowup = async (fu: any) => {
    await supabase
      .from("message_followups" as any)
      .update({ done: !fu.done })
      .eq("id", fu.id);
    qc.invalidateQueries({ queryKey: ["admin-message-followups"] });
  };

  const deleteFollowup = async (id: string) => {
    await supabase
      .from("message_followups" as any)
      .delete()
      .eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-message-followups"] });
  };

  // pending follow-ups summary (top banner)
  const now = Date.now();
  const dueFollowups = (followups ?? []).filter(
    (f) => !f.done && new Date(f.remind_at).getTime() <= now,
  );

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-3xl text-gold">Boîte de réception</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary text-sm inline-flex items-center gap-2"
        >
          <Plus size={16} /> {showForm ? "Annuler" : "Nouveau message"}
        </button>
      </div>
      <p className="text-sand mb-4">
        Demandes et messages reçus depuis le site. Historique des réponses et rappels de suivi
        intégrés.
      </p>

      {dueFollowups.length > 0 && (
        <div className="sacred-card border border-gold/60 mb-6">
          <p className="text-gold font-medium flex items-center gap-2">
            <Clock size={16} /> {dueFollowups.length} suivi(s) à effectuer maintenant
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={create} className="sacred-card border border-gold/40 space-y-3 mb-6">
          <h3 className="font-display text-xl text-gold">Nouveau message</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              required
              placeholder="Nom complet"
              value={f.full_name}
              onChange={(e) => setF({ ...f, full_name: e.target.value })}
              className="px-3 py-2 bg-input border border-border rounded text-ivory"
            />
            <input
              required
              placeholder="Pays"
              value={f.country}
              onChange={(e) => setF({ ...f, country: e.target.value })}
              className="px-3 py-2 bg-input border border-border rounded text-ivory"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              className="px-3 py-2 bg-input border border-border rounded text-ivory"
            />
            <input
              required
              placeholder="Téléphone / WhatsApp"
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
              className="px-3 py-2 bg-input border border-border rounded text-ivory"
            />
            <input
              placeholder="Service (optionnel)"
              value={f.service}
              onChange={(e) => setF({ ...f, service: e.target.value })}
              className="px-3 py-2 bg-input border border-border rounded text-ivory"
            />
            <input
              type="date"
              value={f.preferred_date}
              onChange={(e) => setF({ ...f, preferred_date: e.target.value })}
              className="px-3 py-2 bg-input border border-border rounded text-ivory"
            />
          </div>
          <textarea
            required
            rows={4}
            placeholder="Message"
            value={f.message}
            onChange={(e) => setF({ ...f, message: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-border rounded text-ivory"
          />
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {(data ?? []).map((m) => {
          const mReplies = repliesBy(m.id);
          const mFollowups = followupsBy(m.id);
          const pendingFu = mFollowups.filter((x) => !x.done);
          return (
            <div
              key={m.id}
              className={`sacred-card ${m.status === "nouveau" ? "border-gold/60" : ""}`}
            >
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <p className="text-ivory font-medium">
                    {m.full_name} <span className="text-sand">— {m.country}</span>
                  </p>
                  <p className="text-sand text-xs">
                    {m.email} · {m.phone} · {new Date(m.created_at).toLocaleString("fr-FR")}
                  </p>
                  {m.service && (
                    <p className="text-gold text-sm mt-1">
                      Service : {m.service}
                      {m.preferred_date && ` · Date souhaitée : ${m.preferred_date}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-start flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded ${m.status === "nouveau" ? "bg-gold/30 text-gold" : "bg-secondary text-sand"}`}
                  >
                    {m.status}
                  </span>
                  {mReplies.length > 0 && (
                    <button
                      onClick={() => setHistoryOpen((s) => ({ ...s, [m.id]: !s[m.id] }))}
                      className="text-xs px-3 py-1 text-gold border border-gold/40 rounded inline-flex items-center gap-1"
                    >
                      <History size={12} /> {mReplies.length} réponse
                      {mReplies.length > 1 ? "s" : ""}
                    </button>
                  )}
                  {pendingFu.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-gold/20 text-gold inline-flex items-center gap-1">
                      <Clock size={12} /> {pendingFu.length} suivi
                    </span>
                  )}
                  {m.status === "nouveau" && (
                    <button
                      onClick={() => mark(m.id, "traite")}
                      className="text-xs px-3 py-1 text-gold border border-gold/40 rounded"
                    >
                      Marquer traité
                    </button>
                  )}
                  <button
                    onClick={() => setFollowupOpen((s) => ({ ...s, [m.id]: !s[m.id] }))}
                    className="text-xs px-3 py-1 text-gold border border-gold/40 rounded inline-flex items-center gap-1"
                  >
                    <BellPlus size={12} /> Planifier suivi
                  </button>
                  <button
                    onClick={() => setReplyOpen((s) => ({ ...s, [m.id]: !s[m.id] }))}
                    className="text-xs px-3 py-1 text-gold border border-gold/40 rounded inline-flex items-center gap-1"
                  >
                    {replyOpen[m.id] ? <X size={12} /> : <Reply size={12} />} Répondre
                  </button>
                  <button onClick={() => remove(m.id)} className="text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-ivory mt-3 whitespace-pre-wrap">{m.message}</p>

              {followupOpen[m.id] && (
                <div className="mt-4 border-t border-gold/20 pt-4 space-y-3">
                  <h4 className="text-gold text-sm font-medium flex items-center gap-2">
                    <BellPlus size={14} /> Planifier un suivi
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="datetime-local"
                      value={followupForm[m.id]?.remind_at || ""}
                      onChange={(e) =>
                        setFollowupForm((s) => ({
                          ...s,
                          [m.id]: { ...(s[m.id] || { note: "" }), remind_at: e.target.value },
                        }))
                      }
                      className="px-3 py-2 bg-input border border-border rounded text-ivory"
                    />
                    <input
                      placeholder="Note (optionnel)"
                      value={followupForm[m.id]?.note || ""}
                      onChange={(e) =>
                        setFollowupForm((s) => ({
                          ...s,
                          [m.id]: { ...(s[m.id] || { remind_at: "" }), note: e.target.value },
                        }))
                      }
                      className="px-3 py-2 bg-input border border-border rounded text-ivory"
                    />
                  </div>
                  <button onClick={() => saveFollowup(m)} className="btn-primary text-xs">
                    Enregistrer le rappel
                  </button>
                </div>
              )}

              {mFollowups.length > 0 && (
                <div className="mt-3 space-y-1">
                  {mFollowups.map((fu) => {
                    const due = !fu.done && new Date(fu.remind_at).getTime() <= now;
                    return (
                      <div
                        key={fu.id}
                        className={`flex items-center justify-between gap-2 text-xs px-3 py-2 rounded border ${due ? "border-gold/60 bg-gold/10" : "border-border bg-secondary/40"}`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={12} className={fu.done ? "text-sand/50" : "text-gold"} />
                          <span className={fu.done ? "text-sand/50 line-through" : "text-ivory"}>
                            {new Date(fu.remind_at).toLocaleString("fr-FR")}
                            {fu.note && <span className="text-sand"> — {fu.note}</span>}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFollowup(fu)}
                            className="text-gold inline-flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> {fu.done ? "Réouvrir" : "Terminé"}
                          </button>
                          <button
                            onClick={() => deleteFollowup(fu.id)}
                            className="text-destructive"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {historyOpen[m.id] && mReplies.length > 0 && (
                <div className="mt-4 border-t border-gold/20 pt-4 space-y-2">
                  <h4 className="text-gold text-sm font-medium flex items-center gap-2">
                    <History size={14} /> Historique des réponses
                  </h4>
                  {mReplies.map((r) => (
                    <div
                      key={r.id}
                      className="text-xs border border-border rounded p-3 bg-secondary/30"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {r.channel === "email" ? (
                          <Mail size={12} className="text-gold" />
                        ) : (
                          <MessageCircle size={12} className="text-[#25D366]" />
                        )}
                        <span className="text-sand">
                          {r.channel === "email" ? "Email" : "WhatsApp"} ·{" "}
                          {new Date(r.created_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <pre className="text-ivory whitespace-pre-wrap font-sans">{r.body}</pre>
                    </div>
                  ))}
                </div>
              )}

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
                      onClick={() => logReply(m, "email")}
                      className="text-xs px-3 py-2 border border-gold/40 text-gold rounded inline-flex items-center gap-2 hover:bg-gold/10"
                    >
                      <Mail size={14} /> Envoyer par email
                    </a>
                    {m.phone && (
                      <a
                        href={`https://wa.me/${normalizePhoneForWa(m.phone)}?text=${encodeURIComponent(buildReplyBody(m, replyText[m.id] || ""))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => logReply(m, "whatsapp")}
                        className="text-xs px-3 py-2 bg-[#25D366] text-black rounded inline-flex items-center gap-2 font-medium hover:opacity-90"
                      >
                        <MessageCircle size={14} /> Envoyer par WhatsApp
                      </a>
                    )}
                  </div>
                  <p className="text-sand/70 text-xs italic">
                    Chaque envoi est ajouté à l'historique et fait passer le statut à « traité ».
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {(data ?? []).length === 0 && <p className="text-sand italic">Aucun message.</p>}
      </div>
    </div>
  );
}
