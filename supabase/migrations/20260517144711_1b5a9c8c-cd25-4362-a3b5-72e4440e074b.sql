
-- Roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'editor', 'graduate');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','editor'))
$$;

-- Auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic site_content key/value store
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline
CREATE TABLE public.timeline_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vodouns
CREATE TABLE public.vodouns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  symbol TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Formations
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT,
  price TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.formation_inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  formation_id UUID REFERENCES public.formations(id) ON DELETE SET NULL,
  formation_title TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Graduates
CREATE TABLE public.graduates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  specialty TEXT,
  location TEXT,
  contact TEXT,
  bio TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  description TEXT,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'a_venir',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media
CREATE TABLE public.media_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  video_date DATE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.media_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  photo_date DATE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  country TEXT NOT NULL,
  service TEXT,
  text TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages / appointments
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT,
  preferred_date DATE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vodouns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_staff(auth.uid()));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin manages roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Public read for content tables
CREATE POLICY "public read content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "staff write content" ON public.site_content FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "public read timeline" ON public.timeline_milestones FOR SELECT USING (true);
CREATE POLICY "staff write timeline" ON public.timeline_milestones FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "public read vodouns" ON public.vodouns FOR SELECT USING (visible OR public.is_staff(auth.uid()));
CREATE POLICY "staff write vodouns" ON public.vodouns FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "public read services" ON public.services FOR SELECT USING (visible OR public.is_staff(auth.uid()));
CREATE POLICY "staff write services" ON public.services FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "public read formations" ON public.formations FOR SELECT USING (visible OR public.is_staff(auth.uid()));
CREATE POLICY "staff write formations" ON public.formations FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Formation inscriptions: anyone can create, only staff read
CREATE POLICY "anyone insert inscription" ON public.formation_inscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read inscriptions" ON public.formation_inscriptions FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "staff manage inscriptions" ON public.formation_inscriptions FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "staff delete inscriptions" ON public.formation_inscriptions FOR DELETE USING (public.is_staff(auth.uid()));

-- Graduates: public read visible; staff manage all; graduate can update own
CREATE POLICY "public read graduates" ON public.graduates FOR SELECT USING (visible OR public.is_staff(auth.uid()) OR auth.uid() = user_id);
CREATE POLICY "staff write graduates" ON public.graduates FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "graduate update own" ON public.graduates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "public read events" ON public.events FOR SELECT USING (status <> 'brouillon' OR public.is_staff(auth.uid()));
CREATE POLICY "staff write events" ON public.events FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "public read videos" ON public.media_videos FOR SELECT USING (true);
CREATE POLICY "staff write videos" ON public.media_videos FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "public read photos" ON public.media_photos FOR SELECT USING (true);
CREATE POLICY "staff write photos" ON public.media_photos FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Testimonials: anyone insert, public sees approved only
CREATE POLICY "anyone insert testimonial" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "public read approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved' OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage testimonials" ON public.testimonials FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "staff delete testimonials" ON public.testimonials FOR DELETE USING (public.is_staff(auth.uid()));

-- Messages: anyone insert, only staff read
CREATE POLICY "anyone insert message" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read messages" ON public.messages FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "staff manage messages" ON public.messages FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "staff delete messages" ON public.messages FOR DELETE USING (public.is_staff(auth.uid()));

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media','media', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read media bucket" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "staff upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "staff update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "staff delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
