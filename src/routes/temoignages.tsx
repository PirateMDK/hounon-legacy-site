import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/temoignages")({
  head: () => ({ meta: [{ title: "Témoignages — Hounon Propre" }] }),
  component: () => {
    const { data: items, refetch } = useQuery({
      queryKey: ["all-testimonials"],
      queryFn: async () =>
        (
          await supabase
            .from("testimonials")
            .select("*")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
        ).data ?? [],
    });
    const [form, setForm] = useState({
      first_name: "",
      country: "",
      service: "",
      text: "",
      rating: 5,
    });
    const [sending, setSending] = useState(false);
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSending(true);
      const { error } = await supabase.from("testimonials").insert(form);
      setSending(false);
      if (error) {
        toast.error("Erreur d'envoi");
        return;
      }
      toast.success("Merci ! Votre témoignage sera publié après validation.");
      setForm({ first_name: "", country: "", service: "", text: "", rating: 5 });
      refetch();
    };
    return (
      <Page>
        <Toaster theme="dark" position="top-center" />
        <section className="px-6 py-20 mx-auto max-w-5xl">
          <h1 className="section-title">Témoignages</h1>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {(items ?? []).map((t) => (
              <div key={t.id} className="sacred-card">
                <div className="text-gold mb-2">
                  {"★".repeat(t.rating)}
                  {"☆".repeat(5 - t.rating)}
                </div>
                <p className="font-italic-serif text-ivory text-lg">« {t.text} »</p>
                <p className="text-sand text-sm mt-3">
                  — {t.first_name}, {t.country} {t.service && `· ${t.service}`}
                </p>
              </div>
            ))}
          </div>
          <div className="gold-divider" />
          <h2 className="font-display text-2xl text-gold text-center mb-8">
            Partagez votre expérience
          </h2>
          <form onSubmit={submit} className="sacred-card max-w-2xl mx-auto space-y-3">
            <input
              required
              placeholder="Prénom"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <input
              required
              placeholder="Pays"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <input
              placeholder="Service reçu"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <textarea
              required
              placeholder="Votre témoignage"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory h-28"
            />
            <div className="flex items-center gap-2">
              <span className="text-sand text-sm">Note :</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setForm({ ...form, rating: n })}
                  className={`text-2xl ${n <= form.rating ? "text-gold" : "text-sand/40"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <button type="submit" disabled={sending} className="btn-primary">
              {sending ? "Envoi…" : "Envoyer"}
            </button>
          </form>
        </section>
      </Page>
    );
  },
});
