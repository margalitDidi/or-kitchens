-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- First account ever created becomes the site owner (admin)
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Editable site content (texts, images, contact details) in Hebrew + English
create table public.site_content (
  key text primary key,
  value_he text not null default '',
  value_en text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;
create policy "Anyone reads content" on public.site_content for select to anon, authenticated using (true);
create policy "Admins insert content" on public.site_content for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update content" on public.site_content for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete content" on public.site_content for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger site_content_touch before update on public.site_content for each row execute function public.touch_updated_at();

-- Projects (portfolio)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'kitchen' check (category in ('kitchen','bathroom','closets')),
  title_he text not null default '',
  title_en text not null default '',
  description_he text not null default '',
  description_en text not null default '',
  location_he text not null default '',
  location_en text not null default '',
  cover_url text not null default '',
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "Public reads published projects" on public.projects for select to anon, authenticated using (published or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert projects" on public.projects for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update projects" on public.projects for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete projects" on public.projects for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_idx on public.project_images(project_id, sort_order);
grant select on public.project_images to anon, authenticated;
grant insert, update, delete on public.project_images to authenticated;
grant all on public.project_images to service_role;
alter table public.project_images enable row level security;
create policy "Public reads project images" on public.project_images for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and (p.published or public.has_role(auth.uid(), 'admin'))));
create policy "Admins insert project images" on public.project_images for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update project images" on public.project_images for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete project images" on public.project_images for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name_he text not null default '',
  name_en text not null default '',
  text_he text not null default '',
  text_en text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "Anyone reads testimonials" on public.testimonials for select to anon, authenticated using (true);
create policy "Admins insert testimonials" on public.testimonials for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update testimonials" on public.testimonials for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete testimonials" on public.testimonials for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Contact form leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null default '' check (char_length(email) <= 255),
  project_type text not null default '' check (char_length(project_type) <= 50),
  message text not null default '' check (char_length(message) <= 2000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "Anyone can send a lead" on public.leads for insert to anon, authenticated with check (handled = false);
create policy "Admins read leads" on public.leads for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update leads" on public.leads for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete leads" on public.leads for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Storage policies for the public media bucket (bucket created separately)
create policy "Public reads site media" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
create policy "Admins upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));

-- Seed content
insert into public.site_content (key, value_he, value_en) values
  ('brand_name', 'אטלייה נוי', 'Atelier Noy'),
  ('brand_tagline', 'עיצוב פנים · מטבחים בהתאמה אישית', 'Interior Design · Bespoke Kitchens'),
  ('logo_url', '', ''),
  ('hero_image', '/images/hero-kitchen.jpg', ''),
  ('hero_eyebrow', 'סטודיו לעיצוב פנים · מאז 2012', 'Interior design studio · since 2012'),
  ('hero_title', 'מטבחים שנבנים סביב החיים שלכם', 'Kitchens built around the way you live'),
  ('hero_subtitle', 'תכנון ועיצוב מטבחים, חדרי רחצה וארונות בהתאמה אישית — מהסקיצה הראשונה ועד הידית האחרונה.', 'Bespoke kitchens, bathrooms and cabinetry — from the first sketch to the final handle.'),
  ('about_title', 'עיצוב שמתחיל בהקשבה', 'Design that begins with listening'),
  ('about_text', 'כל פרויקט מתחיל בשיחה: איך אתם מבשלים, מארחים, מאחסנים ונעים בבית. מתוך ההיכרות הזו אני מתכננת חללים מדויקים — עם חומרים טבעיים, פרזול איכותי ותשומת לב לכל מילימטר. אני מלווה את הלקוחות לאורך כל הדרך: תכנון, בחירת חומרים, עבודה מול נגרים וספקים ופיקוח עד המסירה.', 'Every project starts with a conversation: how you cook, host, store and move through your home. From there I design precise spaces — natural materials, premium hardware and attention to every millimetre. I guide clients through the entire journey: planning, material selection, working with carpenters and suppliers, and on-site supervision until handover.'),
  ('about_image', '/images/designer-studio.jpg', ''),
  ('stat_1_value', '+250', '250+'),
  ('stat_1_label', 'מטבחים שתוכננו', 'Kitchens designed'),
  ('stat_2_value', '12', '12'),
  ('stat_2_label', 'שנות ניסיון', 'Years of experience'),
  ('stat_3_value', '100%', '100%'),
  ('stat_3_label', 'התאמה אישית', 'Made to measure'),
  ('service_kitchen_title', 'מטבחים', 'Kitchens'),
  ('service_kitchen_text', 'תכנון ארגונומי, איים, מזווים ומערכות אחסון חכמות — מטבח שנראה מושלם ועובד עוד יותר טוב.', 'Ergonomic planning, islands, pantries and smart storage — a kitchen that looks perfect and works even better.'),
  ('service_bathroom_title', 'חדרי רחצה', 'Bathrooms'),
  ('service_bathroom_text', 'חללי רחצה בתחושת ספא: ארונות אמבטיה בהתאמה, חיפויים, תאורה ופתרונות אחסון נקיים.', 'Spa-like bathrooms: bespoke vanities, cladding, lighting and clean storage solutions.'),
  ('service_closets_title', 'ארונות וספריות', 'Wardrobes & Libraries'),
  ('service_closets_text', 'ארונות קיר, חדרי ארונות, ספריות ויחידות טלוויזיה בעיצוב אישי לכל חלל בבית.', 'Built-in wardrobes, walk-in closets, libraries and media walls designed for every room.'),
  ('process_title', 'מהרעיון ועד המפתח', 'From idea to keys'),
  ('process_1_title', 'פגישת היכרות', 'Discovery meeting'),
  ('process_1_text', 'מבינים את הצרכים, הסגנון והתקציב — ומודדים את החלל.', 'We learn your needs, style and budget — and measure the space.'),
  ('process_2_title', 'תכנון והדמיה', 'Design & 3D renders'),
  ('process_2_text', 'תוכניות עבודה מפורטות והדמיות תלת־ממד שמאפשרות לראות הכל מראש.', 'Detailed plans and 3D renders so you can see everything in advance.'),
  ('process_3_title', 'בחירת חומרים', 'Material selection'),
  ('process_3_text', 'סיור משותף אצל ספקים לבחירת חזיתות, משטחים, פרזול ותאורה.', 'Supplier visits together to choose fronts, worktops, hardware and lighting.'),
  ('process_4_title', 'ביצוע ופיקוח', 'Execution & supervision'),
  ('process_4_text', 'ליווי צמוד מול הנגרים והקבלנים עד להתקנה ולמסירה מושלמת.', 'Close supervision of carpenters and contractors through to a flawless handover.'),
  ('cta_title', 'בואו נתכנן את המטבח הבא שלכם', 'Let''s design your next kitchen'),
  ('cta_text', 'השאירו פרטים ואחזור אליכם תוך 24 שעות לתיאום פגישת ייעוץ.', 'Leave your details and I''ll get back to you within 24 hours to schedule a consultation.'),
  ('contact_phone', '050-000-0000', ''),
  ('contact_whatsapp', '972500000000', ''),
  ('contact_email', 'studio@example.com', ''),
  ('contact_address', 'תל אביב והמרכז', 'Tel Aviv & central Israel'),
  ('contact_instagram', 'https://instagram.com/', ''),
  ('contact_facebook', 'https://facebook.com/', '');

insert into public.projects (category, title_he, title_en, description_he, description_en, location_he, location_en, cover_url, featured, sort_order) values
  ('kitchen', 'מטבח אגוז ושיש', 'Walnut & Marble Kitchen', 'מטבח פתוח עם אי מרכזי מחופה שיש קלקטה, חזיתות פורניר אגוז ופרזול פליז מוברש.', 'An open kitchen with a Calacatta marble island, walnut veneer fronts and brushed brass hardware.', 'הרצליה פיתוח', 'Herzliya Pituach', '/images/hero-kitchen.jpg', true, 1),
  ('kitchen', 'מטבח ירוק זית', 'Olive Green Kitchen', 'חזיתות מסגרת בגוון ירוק זית עמוק, משטח טרצו בהיר ומדפים פתוחים מעץ אלון.', 'Deep olive shaker fronts, pale terrazzo worktops and open oak shelving.', 'רמת השרון', 'Ramat HaSharon', '/images/kitchen-olive.jpg', true, 2),
  ('kitchen', 'מטבח מינימליסטי בהיר', 'Minimal Light Kitchen', 'קווים נקיים, חזיתות לכה מט בגוון שמנת ומשטח קוורץ רציף.', 'Clean lines, matte cream lacquer fronts and a seamless quartz worktop.', 'תל אביב', 'Tel Aviv', '/images/kitchen-minimal.jpg', false, 3),
  ('bathroom', 'חדר רחצה טרוורטין', 'Travertine Bathroom', 'חיפוי אבן טרוורטין, ארון רחצה צף מעץ אלון וכיור אבן מסותתת.', 'Travertine cladding, a floating oak vanity and a carved stone basin.', 'כפר שמריהו', 'Kfar Shmaryahu', '/images/bathroom-travertine.jpg', true, 4),
  ('bathroom', 'מקלחת מאסטר כהה', 'Dark Master Bath', 'אריחי זליג׳ בגוון ירוק כהה, אביזרים בגימור זהב ותאורה עקיפה.', 'Dark green zellige tiles, gold fixtures and soft indirect lighting.', 'גבעתיים', 'Givatayim', '/images/bathroom-dark.jpg', false, 5),
  ('closets', 'ספריית אלון לסלון', 'Oak Living Room Library', 'ספרייה מקיר לקיר עם תאורת לד משולבת וסולם פליז נע.', 'A wall-to-wall library with integrated LED lighting and a sliding brass ladder.', 'רעננה', 'Ra''anana', '/images/library-oak.jpg', true, 6),
  ('closets', 'חדר ארונות', 'Walk-in Closet', 'חדר ארונות עם דלתות זכוכית מעושנת, אי מגירות מרכזי ותאורה חמה.', 'A walk-in closet with smoked glass doors, a central drawer island and warm lighting.', 'סביון', 'Savyon', '/images/closet-walkin.jpg', false, 7);

insert into public.project_images (project_id, url, sort_order)
select id, cover_url, 0 from public.projects;

insert into public.testimonials (name_he, name_en, text_he, text_en, sort_order) values
  ('מיכל ואורי', 'Michal & Uri', 'המטבח שלנו הפך ללב הבית. כל מגירה במקום, כל פרט מחושב — ואורחים לא מפסיקים לשאול מי עיצבה.', 'Our kitchen became the heart of our home. Every drawer in its place, every detail considered — guests keep asking who designed it.', 1),
  ('דנה ל.', 'Dana L.', 'ליווי מקצועי, סבלני ומדויק. קיבלנו חדר רחצה שמרגיש כמו מלון בוטיק.', 'Professional, patient and precise. We got a bathroom that feels like a boutique hotel.', 2),
  ('יואב ש.', 'Yoav S.', 'הספרייה בסלון היא בדיוק מה שדמיינו, רק יפה יותר. עמידה מלאה בלוחות זמנים.', 'The living room library is exactly what we imagined, only more beautiful. Delivered right on schedule.', 3);
