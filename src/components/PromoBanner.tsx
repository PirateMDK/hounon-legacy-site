import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import promoImg from "@/assets/promo-banner.webp";
import { Sparkles } from "lucide-react";

type Promo = {
  visible?: boolean;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_link?: string;
  image_url?: string;
};

export default function PromoBanner() {
  const { data } = useQuery({
    queryKey: ["promo_banner"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", "promo_banner").maybeSingle();
      return (data?.value as Promo) ?? null;
    },
  });

  if (!data || data.visible === false) return null;
  const img = data.image_url || promoImg;
  const href = data.cta_link || "/contact";

  return (
    <section className="px-6 my-12">
      <div className="mx-auto max-w-6xl relative overflow-hidden rounded-sm border border-gold/60" style={{ boxShadow: "var(--shadow-gold)" }}>
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
        <div className="relative z-10 px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest mb-2">
              <Sparkles size={14} /> Offre Sacrée
            </div>
            <h3 className="font-display text-2xl md:text-3xl gold-text leading-tight">{data.title}</h3>
            {data.subtitle && <p className="font-italic-serif text-ivory/90 mt-2 max-w-2xl">{data.subtitle}</p>}
          </div>
          {data.cta_label && (
            href.startsWith("http") ? (
              <a href={href} className="btn-primary whitespace-nowrap" target="_blank" rel="noopener noreferrer">{data.cta_label}</a>
            ) : (
              <Link to={href} className="btn-primary whitespace-nowrap">{data.cta_label}</Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
