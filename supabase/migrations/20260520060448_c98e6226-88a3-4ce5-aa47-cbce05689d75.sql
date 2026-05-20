UPDATE public.vodouns SET photo_url = CASE name
  WHEN 'GAMBADA' THEN '/vodouns/gambada.webp'
  WHEN 'KOKOU' THEN '/vodouns/kokou.webp'
  WHEN 'LÈGBA KOKOU' THEN '/vodouns/legba-kokou.webp'
  WHEN 'TÔGBAN' THEN '/vodouns/togban.webp'
  WHEN 'ADJAHOUZOU' THEN '/vodouns/adjahouzou.webp'
  WHEN 'GADAOUNDOTO' THEN '/vodouns/gadaoundoto.webp'
  WHEN 'HÓHO' THEN '/vodouns/hoho.webp'
  WHEN 'TCHOTCHOCLITCHO' THEN '/vodouns/tchotchoclitcho.webp'
  ELSE photo_url END
WHERE name IN ('GAMBADA','KOKOU','LÈGBA KOKOU','TÔGBAN','ADJAHOUZOU','GADAOUNDOTO','HÓHO','TCHOTCHOCLITCHO');

INSERT INTO public.site_content (key, value) VALUES
  ('promo_banner', '{"visible": true, "title": "Offre Spirituelle Spéciale", "subtitle": "Consultation initiale offerte à tout nouveau consultant à l''étranger", "cta_label": "Profiter de l''offre", "cta_link": "/contact"}'::jsonb)
ON CONFLICT (key) DO NOTHING;