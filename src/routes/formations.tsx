import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/formations")({
  head: () => ({ meta: [{ title: "Formations — Hounon Propre" }] }),
  component: FormationsPage,
});

function FormationsPage() {
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const { data } = await supabase.from("formations").select("*").eq("visible", true).order("sort_order");
      return data ?? [];
    },
  });
  const [open, setOpen] = useState<{ id: string; title: string } | null>(null);
  const [form, setForm] = useState({ full_name: "", country: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!open) return;
    setSending(true);
    const { error } = await supabase.from("formation_inscriptions").insert({
      ...form, formation_id: open.id, formation_title: open.title,
    });
    setSending(false);
    if (error) { toast.error("Erreur lors de l'envoi"); return; }
    toast.success("Inscription envoyée ! Nous vous recontacterons rapidement.");
    setForm({ full_name: "", country: "", email: "", phone: "", message: "" });
    setOpen(null);
  };

  return (
    <Page>
      <Toaster theme="dark" position="top-center" />
      <section className="px-6 py-20 mx-auto max-w-6xl">
        <h1 className="section-title">Formations</h1>
        <p className="text-center text-ivory mt-8 max-w-3xl mx-auto font-italic-serif text-lg">
          Hounon Propre transmet son savoir ancestral à ceux qui souhaitent embrasser la voie de la tradition vodoun. À l'issue de chaque formation, les apprenants reçoivent un diplôme reconnu.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {(formations ?? []).map((f) => (
            <div key={f.id} className="sacred-card">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display text-lg text-gold mb-3">{f.title}</h3>
              <p className="text-ivory/90 text-sm mb-4">{f.description}</p>
              <p className="text-sand text-xs uppercase tracking-wider mb-4">Durée : {f.duration}</p>
              <button onClick={() => setOpen({ id: f.id, title: f.title })} className="btn-primary">S'inscrire</button>
            </div>
          ))}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto" onClick={() => setOpen(null)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="sacred-card max-w-lg w-full">
            <h3 className="font-display text-xl text-gold mb-4">Inscription — {open.title}</h3>
            {(["full_name","country","email","phone"] as const).map((k) => (
              <input key={k} required placeholder={{ full_name:"Nom complet", country:"Pays", email:"Email", phone:"Téléphone / WhatsApp" }[k]}
                value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full bg-input border border-border rounded-sm px-3 py-2 mb-3 text-ivory" />
            ))}
            <textarea placeholder="Message (optionnel)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 mb-4 text-ivory h-24" />
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setOpen(null)} className="btn-outline">Annuler</button>
              <button type="submit" disabled={sending} className="btn-primary">{sending ? "Envoi…" : "Envoyer"}</button>
            </div>
          </form>
        </div>
      )}
    </Page>
  );
}
