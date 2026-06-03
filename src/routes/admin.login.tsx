import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminSeeded } from "@/lib/admin-seed.functions";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Connexion Admin — Hounon Propre" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const seed = useServerFn(ensureAdminSeeded);
  const [email, setEmail] = useState("hounonpropre@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-seed admin user on first visit
    seed({}).catch(() => {});
  }, [seed]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Connexion réussie");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Toaster theme="dark" position="top-center" />
      <div className="w-full max-w-md sacred-card">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl gold-text">HOUNON PROPRE</h1>
          <p className="font-italic-serif text-sand mt-1">Espace Administrateur</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-sand mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
          </div>
          <div>
            <label className="block text-sm text-sand mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="text-center mt-4"><Link to="/" className="text-sand hover:text-gold text-xs">← Retour au site</Link></p>
      </div>
    </div>
  );
}
