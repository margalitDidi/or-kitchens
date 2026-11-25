ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Anyone reads testimonials" ON public.testimonials;
CREATE POLICY "Public reads published testimonials"
  ON public.testimonials
  FOR SELECT
  TO anon, authenticated
  USING (published OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Public reads site media" ON storage.objects;
CREATE POLICY "Admins read site media"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));