-- ============================================================================
-- SAI EVENTS - Admin Module Change Requests & 4-Level Catalog Schema Migration
-- ============================================================================

-- 1. Create Main Categories Table (Level 1 of Catalog Hierarchy)
CREATE TABLE IF NOT EXISTS public.main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Link Categories to Main Categories (Level 2 of Catalog Hierarchy)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS main_category_id UUID REFERENCES public.main_categories(id) ON DELETE SET NULL;

-- Index for main category queries
CREATE INDEX IF NOT EXISTS idx_categories_main_cat_id 
  ON public.categories(main_category_id);

-- 3. Seed Default Main Categories
INSERT INTO public.main_categories (name, description, sort_order)
VALUES 
  ('Wedding Matrimony', 'Grand Matrimonial Ceremonies, Sangeet, Haldi & Receptions', 1),
  ('Corporate Events', 'Conferences, Product Launches, Galas & Corporate Banquets', 2),
  ('Birthday Celebrations', 'Private Birthday Parties, Milestones & Kid Banquets', 3),
  ('Private Galas', 'Exclusive Private Dinners, Anniversaries & Housewarmings', 4)
ON CONFLICT (name) DO NOTHING;

-- Map existing categories to Wedding Matrimony main category if unlinked
UPDATE public.categories 
SET main_category_id = (SELECT id FROM public.main_categories WHERE name = 'Wedding Matrimony' LIMIT 1)
WHERE main_category_id IS NULL;

-- 4. Enable Row Level Security
ALTER TABLE public.main_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY main_categories_read_all ON public.main_categories
  FOR SELECT USING (TRUE);

CREATE POLICY main_categories_admin_write ON public.main_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
