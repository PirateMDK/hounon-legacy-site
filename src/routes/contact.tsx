import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Page from "@/components/Page";
import { toast, Toaster } from "sonner";
import { WA_NUMBER, WA_DISPLAY, EMAIL } from "@/components/SiteLayout";
import { MessageCircle, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Rendez-vous — Hounon Propre" },
      {
        name: "description",
        content:
          "Prenez rendez-vous avec Hounon Propre. WhatsApp, email, formulaire. Services disponibles dans le monde entier.",
      },
    ],
  }),
  component: () => {
    const [f, setF] = useState({
      full_name: "",
      country: "",
      email: "",
      phone: "",
      service: "",
      preferred_date: "",
      message: "",
    });
    const [sending, setSending] = useState(false);
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSending(true);
      const payload = { ...f, preferred_date: f.preferred_date || null };
      const { error } = await supabase.from("messages").insert(payload);
      setSending(false);
      if (error) {
        toast.error("Erreur lors de l'envoi");
        return;
      }
      toast.success("Demande envoyée ! Nous vous répondons sous 24h.");
      setF({
        full_name: "",
        country: "",
        email: "",
        phone: "",
        service: "",
        preferred_date: "",
        message: "",
      });
    };
    const services = [
      "Consultation du Fâ",
      "Rituels d'Amour",
      "Protection & Désenvoûtement",
      "Guérison Traditionnelle",
      "Chance & Prospérité",
      "Travaux Occultes",
      "Formation",
      "Autre",
    ];
    return (
      <Page>
        <Toaster theme="dark" position="top-center" />
        <section className="px-6 py-20 mx-auto max-w-5xl">
          <h1 className="section-title">Contact & Rendez-vous</h1>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sacred-card text-center hover:bg-secondary/30"
            >
              <MessageCircle className="mx-auto text-gold mb-3" size={32} />
              <h3 className="font-display text-gold">WhatsApp</h3>
              <p className="text-ivory mt-2">{WA_DISPLAY}</p>
            </a>
            <a href={`mailto:${EMAIL}`} className="sacred-card text-center hover:bg-secondary/30">
              <Mail className="mx-auto text-gold mb-3" size={32} />
              <h3 className="font-display text-gold">Email</h3>
              <p className="text-ivory mt-2 break-all">{EMAIL}</p>
            </a>
            <div className="sacred-card text-center">
              <MapPin className="mx-auto text-gold mb-3" size={32} />
              <h3 className="font-display text-gold">Adresse</h3>
              <p className="text-ivory mt-2">Pahou Founoucodji, Bénin</p>
            </div>
          </div>

          <div className="gold-divider" />

          <h2 className="font-display text-2xl text-gold text-center mb-8">
            Formulaire de Rendez-vous
          </h2>
          <form onSubmit={submit} className="sacred-card max-w-2xl mx-auto space-y-3">
            <input
              required
              placeholder="Nom complet"
              value={f.full_name}
              onChange={(e) => setF({ ...f, full_name: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <input
              required
              placeholder="Pays de résidence"
              value={f.country}
              onChange={(e) => setF({ ...f, country: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <input
              required
              placeholder="Téléphone / WhatsApp"
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <select
              required
              value={f.service}
              onChange={(e) => setF({ ...f, service: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            >
              <option value="">Service souhaité…</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={f.preferred_date}
              onChange={(e) => setF({ ...f, preferred_date: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory"
            />
            <textarea
              required
              placeholder="Votre message"
              value={f.message}
              onChange={(e) => setF({ ...f, message: e.target.value })}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-ivory h-32"
            />
            <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
              {sending ? "Envoi…" : "Envoyer ma demande"}
            </button>
            <p className="text-sand text-xs text-center mt-4">
              🌍 Services disponibles dans le monde entier — livraison internationale.
              <br />
              🔒 Discrétion absolue garantie. Réponse sous 24 heures.
            </p>
          </form>
        </section>
      </Page>
    );
  },
});
