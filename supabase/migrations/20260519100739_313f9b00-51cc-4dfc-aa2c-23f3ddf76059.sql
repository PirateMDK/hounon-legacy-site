
ALTER TABLE public.vodouns ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.vodouns ADD COLUMN IF NOT EXISTS accent_color text;

UPDATE public.vodouns SET symbol = '🐍', photo_url = '/vodouns/gambada.webp', accent_color = '#FCD116' WHERE name = 'GAMBADA';
UPDATE public.vodouns SET symbol = '⚔️', photo_url = '/vodouns/kokou.webp', accent_color = '#E8112D' WHERE name = 'KOKOU';
UPDATE public.vodouns SET symbol = '🌿', photo_url = '', accent_color = '#008751' WHERE name = 'KININSI';
UPDATE public.vodouns SET symbol = '🗝️', photo_url = '/vodouns/legba-kokou.webp', accent_color = '#FCD116' WHERE name = 'LÈGBA KOKOU';
UPDATE public.vodouns SET symbol = '👤', photo_url = '/vodouns/togban.webp', accent_color = '#E8112D' WHERE name = 'TÔGBAN';
UPDATE public.vodouns SET symbol = '👥', photo_url = '/vodouns/adjahouzou.webp', accent_color = '#008751' WHERE name = 'ADJAHOUZOU';
UPDATE public.vodouns SET symbol = '⚒️', photo_url = '/vodouns/gadaoundoto.webp', accent_color = '#FCD116' WHERE name = 'GADAOUNDOTO';
UPDATE public.vodouns SET symbol = '🌅', photo_url = '/vodouns/hoho.webp', accent_color = '#E8112D' WHERE name = 'HÓHO';
UPDATE public.vodouns SET symbol = '🗡️', photo_url = '/vodouns/tchotchoclitcho.webp', accent_color = '#008751' WHERE name = 'TCHOTCHOCLITCHO';
