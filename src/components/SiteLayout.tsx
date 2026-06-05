import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, MessageCircle, Mail, MapPin, Globe, Facebook } from "lucide-react";
import logoCncvb from "@/assets/logo-cncvb.png";
import logoMinistere from "@/assets/logo-ministere.png";
import flagBenin from "@/assets/flag-benin.png";

const WA_NUMBER = "2290145237071";
const WA_DISPLAY = "+2290145237071";
const EMAIL = "hounonpropre@gmail.com";
const WEBSITE = "";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590362858272";

const FALLBACK_NAV = [
  { label: "Accueil", url: "/", open_new_tab: false },
  { label: "Biographie", url: "/biographie", open_new_tab: false },
  { label: "Services", url: "/services", open_new_tab: false },
  { label: "Formations", url: "/formations", open_new_tab: false },
  { label: "Diplômés", url: "/diplomes", open_new_tab: false },
  { label: "Médias", url: "/medias", open_new_tab: false },
  { label: "Événements", url: "/evenements", open_new_tab: false },
  { label: "Témoignages", url: "/temoignages", open_new_tab: false },
  { label: "Contact", url: "/contact", open_new_tab: false },
];

function useNavItems() {
  return useQuery({
    queryKey: ["public-nav"],
    queryFn: async () => {
      const { data } = await supabase
        .from("navigation_items")
        .select("label,url,open_new_tab,is_visible,order_position")
        .eq("is_visible", true)
        .order("order_position");
      return data && data.length > 0 ? data : FALLBACK_NAV;
    },
  });
}

function NavLink({
  url,
  label,
  openNewTab,
  active,
  onClick,
}: {
  url: string;
  label: string;
  openNewTab: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  const cls = `nav-link ${active ? "active" : ""}`;
  if (openNewTab || url.startsWith("http")) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <Link to={url} className={cls} onClick={onClick}>
      {label}
    </Link>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { data: nav } = useNavItems();
  const items = nav ?? FALLBACK_NAV;
  return (
    <header className="nav-blur fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-tight" onClick={() => setOpen(false)}>
          <span className="font-display text-base sm:text-lg text-gold tracking-widest">
            HOUNON PROPRE
          </span>
          <span className="font-italic-serif text-xs text-sand">KINWAHO HOUNGUEVI DJIMA</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {items.map((n) => (
            <NavLink
              key={n.url + n.label}
              url={n.url}
              label={n.label}
              openNewTab={Boolean(n.open_new_tab)}
              active={pathname === n.url}
            />
          ))}
        </nav>
        <button
          className="lg:hidden text-gold"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-border bg-background/95 px-6 py-4 flex flex-col gap-2">
          {items.map((n) => (
            <NavLink
              key={n.url + n.label}
              url={n.url}
              label={n.label}
              openNewTab={Boolean(n.open_new_tab)}
              active={pathname === n.url}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const { data: nav } = useNavItems();
  const items = nav ?? FALLBACK_NAV;
  return (
    <footer className="border-t border-border mt-24 pt-16 pb-8 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="font-display text-xl text-gold mb-3">HOUNON PROPRE</h3>
          <p className="font-italic-serif text-sand text-sm">
            Là où la médecine moderne s'arrête,
            <br />
            la sagesse des ancêtres commence.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sand text-xs">
            <img src={logoCncvb} alt="CNCVB-Racine" className="h-10 w-auto opacity-90" />
            <span>CNCVB-Racine — Atlantique</span>
          </div>
        </div>
        <div>
          <h4 className="text-gold mb-3">Navigation</h4>
          <ul className="grid grid-cols-2 gap-y-1 text-sm">
            {items.map((n) => (
              <li key={n.url + n.label}>
                {n.open_new_tab || n.url.startsWith("http") ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sand hover:text-gold"
                  >
                    {n.label}
                  </a>
                ) : (
                  <Link to={n.url} className="text-sand hover:text-gold">
                    {n.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-gold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-sand">
            <li className="flex items-start gap-2">
              <MessageCircle size={16} className="mt-1 text-gold" /> {WA_DISPLAY}
            </li>
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-1 text-gold" /> {EMAIL}
            </li>
            <li className="flex items-start gap-2">
              <Globe size={16} className="mt-1 text-gold" />
              <a
                href={`https://${WEBSITE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                {WEBSITE}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Facebook size={16} className="mt-1 text-gold" />
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                Facebook
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-1 text-gold" />
              <span className="inline-flex items-center gap-2">
                Pahou Founoucodji, Bénin
                <img
                  src={flagBenin}
                  alt="Drapeau Bénin"
                  className="h-4.5 w-auto rounded-sm"
                  style={{ width: 28 }}
                />
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-12">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-sand/70 mb-4">
          Reconnaissance Officielle & Appartenance Nationale
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <img src={logoCncvb} alt="CNCVB-Racine" className="credibility-logo" />
          <img
            src={logoMinistere}
            alt="Ministère du Tourisme, de la Culture et des Arts — République du Bénin"
            className="credibility-logo"
            style={{ height: 50 }}
          />
          <img
            src={flagBenin}
            alt="Drapeau du Bénin"
            className="credibility-logo"
            style={{ height: 36 }}
          />
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-sand/60">
        © {new Date().getFullYear()} Hounon Propre — Tous droits réservés. ·{" "}
        <Link to="/admin" className="hover:text-gold">
          Admin
        </Link>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  const message = encodeURIComponent(
    "Bonjour Maître Hounon Propre, je vous contacte depuis votre site.",
  );
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      title="Contacter sur WhatsApp"
      aria-label="Contacter sur WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.46 0 .11 5.34.11 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.93 11.93 0 0 0 5.77 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.46-8.42zM12.05 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.72.97.99-3.62-.24-.37a9.86 9.86 0 0 1-1.51-5.27c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.91a9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.87-9.95 9.87zm5.45-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.21 3.09.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}

export default function SiteLayout() {
  // Scroll restoration suppression for anchor refresh
  useEffect(() => {}, []);
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export { WA_NUMBER, WA_DISPLAY, EMAIL, WEBSITE };
