-- Add KININSI photo
UPDATE public.vodouns 
SET photo_url = '/vodouns/kininsi.webp'
WHERE name = 'KININSI' AND photo_url IS NULL;
