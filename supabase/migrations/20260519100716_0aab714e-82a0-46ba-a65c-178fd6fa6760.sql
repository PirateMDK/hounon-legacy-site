
-- 2. navigation_items table
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  order_position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  open_new_tab boolean NOT NULL DEFAULT false,
  is_core boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read nav" ON public.navigation_items;
CREATE POLICY "public read nav" ON public.navigation_items FOR SELECT USING (is_visible OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff write nav" ON public.navigation_items;
CREATE POLICY "staff write nav" ON public.navigation_items FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Seed default nav items
INSERT INTO public.navigation_items (label, url, order_position, is_core) VALUES
('Accueil', '/', 1, true),
('Biographie', '/biographie', 2, true),
('Services', '/services', 3, true),
('Formations', '/formations', 4, true),
('Diplômés', '/diplomes', 5, true),
('Médias', '/medias', 6, true),
('Événements', '/evenements', 7, true),
('Témoignages', '/temoignages', 8, true),
('Contact', '/contact', 9, true)
ON CONFLICT DO NOTHING;

-- 3. Dedupe user_roles (keep highest priority)
WITH ranked AS (
  SELECT id, user_id, role,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY 
      CASE role::text
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'sub_admin' THEN 3
        WHEN 'editor' THEN 4
        WHEN 'graduate' THEN 5
        ELSE 6
      END) AS rn
  FROM public.user_roles
)
DELETE FROM public.user_roles WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Unique constraint: one role per user
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- 4. Super admin protection trigger
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  super_count int;
  caller_is_super boolean;
BEGIN
  caller_is_super := public.has_role(auth.uid(), 'super_admin'::app_role);

  IF TG_OP = 'DELETE' AND OLD.role = 'super_admin' THEN
    SELECT COUNT(*) INTO super_count FROM public.user_roles WHERE role = 'super_admin';
    IF super_count <= 1 THEN
      RAISE EXCEPTION 'Impossible de supprimer le dernier Super Administrateur. Créez d''abord un autre Super Administrateur.';
    END IF;
    IF NOT caller_is_super THEN
      RAISE EXCEPTION 'Seul un Super Administrateur peut modifier un Super Administrateur.';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.role = 'super_admin' AND NEW.role <> 'super_admin' THEN
    IF NOT caller_is_super THEN
      RAISE EXCEPTION 'Seul un Super Administrateur peut modifier un Super Administrateur.';
    END IF;
    SELECT COUNT(*) INTO super_count FROM public.user_roles WHERE role = 'super_admin';
    IF super_count <= 1 THEN
      RAISE EXCEPTION 'Impossible de retirer le dernier Super Administrateur.';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_super_admin ON public.user_roles;
CREATE TRIGGER trg_protect_super_admin
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

-- 5. Replace vodouns with 9 real ones
DELETE FROM public.vodouns;

INSERT INTO public.vodouns (name, subtitle, symbol, description, sort_order) VALUES
('GAMBADA', 'Kabada Lèhountè — Mère de tous les vodouns', '/src/assets/vodoun-gambada.webp',
'Considérée comme la mère de tous les vodouns, source de puissance pour toutes les autres divinités. Représentée par un serpent à trois têtes, Gambada protège contre les sorciers, guérit les maladies mentales, purifie contre le mauvais sort et procure la richesse. Elle bénit les unions et aide la femme à concevoir.', 1),
('KOKOU', 'Koku / Flimani Koku — Divinité guerrière', '/src/assets/vodoun-legba-kokou.webp',
'Divinité guerrière et protectrice vénérée au Bénin et au Togo. Ancien dieu de guerre redoutable, Kokou est devenu un puissant protecteur des justes. Ses adeptes entrent en transe lors des cérémonies, badigeonnés d''un mélange sacré. Il châtie les injustes et défend sans relâche ceux qui le servent avec droiture.', 2),
('KININSI', 'Vodoun de l''aire culturelle Adja-Tado', '',
'Vodoun de l''aire culturelle Adja-Tado, présent au Bénin depuis le XVIe siècle. Invoqué lors de cérémonies sacrées de neuf jours après consultation du Fâ. Kininsi veille sur la communauté et garantit l''harmonie entre les vivants et les esprits ancestraux.', 3),
('LÈGBA KOKOU', 'Le messager des dieux', '/src/assets/vodoun-legba-kokou.webp',
'Premier de tous les vodouns — le messager incontournable entre les hommes et les dieux. Aucun rituel ne peut commencer sans son invocation. Gardien des carrefours et des seuils, il ouvre les portes entre le monde des vivants et celui des esprits. Dans sa forme Kokou, il cumule la puissance du messager et la force guerrière du protecteur.', 4),
('TÔGBAN', 'Vodoun des ancêtres fondateurs', '/src/assets/vodoun-togban.webp',
'Vodoun des ancêtres fondateurs, gardien de la lignée et de la mémoire familiale. Il veille sur les descendants et assure la continuité du lien sacré entre les vivants et les morts. Invoqué pour la protection de la famille, la résolution des conflits ancestraux et la transmission des pouvoirs initiatiques.', 5),
('ADJAHOUZOU', 'Protection collective et justice ancestrale', '/src/assets/vodoun-adjahouzou.webp',
'Divinité de protection collective et de justice ancestrale. Ses formes jumelles — féminin et masculin — lui permettent d''intervenir dans tous les domaines : amour, protection, justice et guérison. Adjahouzou veille sur les espaces sacrés et châtie quiconque transgresse les lois de la tradition. L''un des vodouns les plus respectés du couvent.', 6),
('GADAOUNDOTO', 'Combat spirituel et protection absolue', '/src/assets/vodoun-gadaoundoto.webp',
'Divinité de combat spirituel et de protection absolue. Recouvert de métal, de fer et d''offrandes, il incarne la force brute contre toutes les forces négatives. Invoqué pour briser les malédictions les plus tenaces, désarmer les ennemis spirituels et protéger dans les situations les plus critiques. Sa présence est le signe d''une puissance de protection hors du commun.', 7),
('HÓHO', 'Abondance et force vitale', '/src/assets/vodoun-hoho.webp',
'L''une des divinités les plus imposantes du couvent. Sa masse monumentale, recouverte de couches d''offrandes accumulées depuis des générations, témoigne de son ancienneté et de sa puissance. Divinité de l''abondance et de la force vitale, Hóho est invoqué pour les demandes les plus importantes : santé, prospérité, descendance et victoire. Chaque couche d''offrande est une prière exaucée.', 8),
('TCHOTCHOCLITCHO', 'Justice et vengeance sacrée', '/src/assets/vodoun-tchotchoclitcho.webp',
'Divinité de justice et de vengeance sacrée. Ses formes noires hérissées de pointes évoquent la puissance tranchante de sa justice. Invoqué pour punir les coupables et protéger les innocents des attaques injustes. Parmi les vodouns les plus redoutés du panthéon de Hounon Propre, Tchotchoclitcho agit avec rapidité et précision. Il ne frappe jamais un innocent.', 9);

-- 6. Philosophy content
INSERT INTO public.site_content (key, value) VALUES
('philosophy', '{"visible": true, "title": "Sa Philosophie", "quote": "Avec une forte concentration, on arrive à être en communication avec les éléments de la nature.", "author": "Honnongan Propre"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
