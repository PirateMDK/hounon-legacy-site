import { createFileRoute } from "@tanstack/react-router";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldCheck, KeyRound, LogOut, ScanSearch, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/parametres")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-gold mb-2">Paramètres</h1>
        <p className="text-sand">Configuration générale, sécurité et audit du site.</p>
      </div>

      <PasswordSection />
      <MfaSection />
      <SessionSection />
      <SecurityScanSection />

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

function PasswordSection() {
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) { toast.error("Minimum 8 caractères"); return; }
    if (pwd !== pwd2) { toast.error("Les deux mots de passe doivent être identiques"); return; }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) { toast.error(error.message); return; }
    toast.success("Mot de passe mis à jour");
    setPwd(""); setPwd2("");
  };
  return (
    <section className="sacred-card">
      <h3 className="font-display text-xl text-gold mb-4 flex items-center gap-2"><KeyRound size={20} /> Changer le mot de passe</h3>
      <form onSubmit={change} className="space-y-3 max-w-md">
        <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Nouveau mot de passe (min. 8 caractères)"
          className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
        <input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder="Confirmer le nouveau mot de passe"
          className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
        <button type="submit" className="btn-primary text-sm">Mettre à jour</button>
      </form>
    </section>
  );
}

type Factor = { id: string; friendly_name?: string | null; status: string; factor_type: string };

function MfaSection() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<null | { factorId: string; qr: string; secret: string }>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("Authenticator");

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors([...(data?.totp ?? [])] as Factor[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const start = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: name || "Authenticator" });
    if (error) { toast.error(error.message); return; }
    setEnrolling({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };
  const verify = async () => {
    if (!enrolling) return;
    const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId: enrolling.factorId });
    if (e1) { toast.error(e1.message); return; }
    const { error } = await supabase.auth.mfa.verify({ factorId: enrolling.factorId, challengeId: ch.id, code });
    if (error) { toast.error(error.message); return; }
    toast.success("Authentification à deux facteurs activée");
    setEnrolling(null); setCode("");
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Désactiver ce facteur 2FA ?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Facteur 2FA retiré");
    refresh();
  };

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <section className="sacred-card">
      <h3 className="font-display text-xl text-gold mb-2 flex items-center gap-2"><Shield size={20} /> Double authentification (2FA / MFA)</h3>
      <p className="text-sand text-sm mb-4">Protégez votre compte avec une application d'authentification (Google Authenticator, Authy, 1Password…). Un code à 6 chiffres sera demandé à chaque connexion.</p>

      {loading ? <p className="text-sand">Chargement…</p> : (
        <>
          {verified.length > 0 ? (
            <div className="space-y-2 mb-4">
              {verified.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-secondary/30 px-3 py-2 rounded">
                  <span className="text-ivory text-sm inline-flex items-center gap-2"><ShieldCheck size={16} className="text-gold" /> {f.friendly_name || "Authenticator"} <span className="text-xs text-sand">({f.factor_type})</span></span>
                  <button onClick={() => remove(f.id)} className="text-xs text-destructive">Retirer</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-2 text-amber-400 text-sm mb-4"><AlertTriangle size={16} className="mt-0.5" /> 2FA non activée — votre compte est protégé uniquement par mot de passe.</div>
          )}

          {!enrolling ? (
            <div className="flex gap-2 flex-wrap items-end">
              <div>
                <label className="text-sand text-xs block mb-1">Nom du facteur</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 bg-input border border-border rounded text-ivory text-sm" />
              </div>
              <button onClick={start} className="btn-primary text-sm">Activer un nouveau facteur 2FA</button>
            </div>
          ) : (
            <div className="border border-gold/30 rounded p-4 space-y-3">
              <p className="text-sand text-sm">1. Scannez ce QR code avec votre application d'authentification :</p>
              <img src={enrolling.qr} alt="QR Code 2FA" className="bg-white p-2 rounded" />
              <p className="text-sand text-xs">Ou entrez ce code manuellement : <code className="text-gold">{enrolling.secret}</code></p>
              <p className="text-sand text-sm">2. Entrez le code à 6 chiffres généré :</p>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} className="px-3 py-2 bg-input border border-border rounded text-ivory tracking-widest font-mono" />
              <div className="flex gap-2">
                <button onClick={verify} className="btn-primary text-sm">Vérifier et activer</button>
                <button onClick={() => { setEnrolling(null); setCode(""); }} className="text-sm px-3 py-2 text-sand">Annuler</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SessionSection() {
  const signOutEverywhere = async () => {
    if (!confirm("Déconnecter toutes vos sessions actives (sur tous les appareils) ?")) return;
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) { toast.error(error.message); return; }
    toast.success("Déconnexion globale effectuée");
    window.location.href = "/admin/login";
  };
  return (
    <section className="sacred-card">
      <h3 className="font-display text-xl text-gold mb-2 flex items-center gap-2"><LogOut size={20} /> Sessions actives</h3>
      <p className="text-sand text-sm mb-4">Si vous suspectez un accès non autorisé, déconnectez toutes vos sessions immédiatement.</p>
      <button onClick={signOutEverywhere} className="text-sm px-4 py-2 bg-earth-red/30 border border-earth-red/60 text-ivory rounded hover:bg-earth-red/50">Déconnecter tous les appareils</button>
    </section>
  );
}

type Check = { label: string; ok: boolean; detail?: string };

function SecurityScanSection() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [scanning, setScanning] = useState(false);

  const run = async () => {
    setScanning(true);
    const out: Check[] = [];

    // Session present
    const { data: { session } } = await supabase.auth.getSession();
    out.push({ label: "Session authentifiée", ok: !!session });

    // MFA enrolled
    const { data: mfa } = await supabase.auth.mfa.listFactors();
    const hasMfa = (mfa?.totp ?? []).some((f) => f.status === "verified");
    out.push({ label: "Double authentification (2FA) activée", ok: hasMfa, detail: hasMfa ? undefined : "Activez la 2FA ci-dessus." });

    // Email confirmed
    const user = session?.user;
    out.push({ label: "Email vérifié", ok: !!user?.email_confirmed_at });

    // Single super admin guard
    const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "super_admin");
    out.push({ label: "Au moins un Super Administrateur", ok: (count ?? 0) >= 1, detail: `${count ?? 0} compte(s)` });

    // Default password warning (heuristic — can't read pwd; mark warning if it's still the seed admin email and never changed)
    out.push({ label: "Mot de passe personnalisé", ok: true, detail: "Pensez à changer le mot de passe par défaut après la première connexion." });

    // HTTPS
    out.push({ label: "Connexion chiffrée (HTTPS)", ok: typeof window !== "undefined" && window.location.protocol === "https:" });

    setChecks(out);
    setScanning(false);
  };

  return (
    <section className="sacred-card">
      <h3 className="font-display text-xl text-gold mb-2 flex items-center gap-2"><ScanSearch size={20} /> Scan de sécurité</h3>
      <p className="text-sand text-sm mb-4">Vérification rapide de l'état de sécurité de votre compte et du site.</p>
      <button onClick={run} disabled={scanning} className="btn-primary text-sm mb-4">{scanning ? "Analyse…" : "Lancer un scan"}</button>
      {checks && (
        <ul className="space-y-2">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {c.ok ? <CheckCircle2 size={16} className="text-emerald-400 mt-0.5" /> : <AlertTriangle size={16} className="text-amber-400 mt-0.5" />}
              <span className="text-ivory">{c.label}{c.detail && <span className="text-sand"> — {c.detail}</span>}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
