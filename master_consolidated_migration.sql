-- ============================================================================
-- SAI EVENTS - MASTER CONSOLIDATED DATABASE MIGRATION
-- Target: Supabase PostgreSQL (Run in Supabase SQL Editor)
-- Purpose: Complete schema synchronization for Media Studio, Sub-Events,
--          Per-Function Venue Locations, Service Requirements, Storage Buckets,
--          Curated 3 Packages per Ceremony, and Legacy Cleanup.
-- ============================================================================

-- 1. Profiles & RLS Safety
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer' NOT NULL;

-- 2. Customer Media Studio Tables & RLS
CREATE TABLE IF NOT EXISTS public.customer_media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.customer_media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.customer_media_folders(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    file_type VARCHAR(50) DEFAULT 'image' NOT NULL,
    file_size INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.customer_media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_media_items ENABLE ROW LEVEL SECURITY;

-- Media RLS Policies
DROP POLICY IF EXISTS "Customers can view their own media folders" ON public.customer_media_folders;
CREATE POLICY "Customers can view their own media folders" ON public.customer_media_folders FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can create their own media folders" ON public.customer_media_folders;
CREATE POLICY "Customers can create their own media folders" ON public.customer_media_folders FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can view their own media items" ON public.customer_media_items;
CREATE POLICY "Customers can view their own media items" ON public.customer_media_items FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can view customer media items" ON public.customer_media_items;
CREATE POLICY "Admins can view customer media items" ON public.customer_media_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (LOWER(profiles.role) = 'admin')
  )
);

DROP POLICY IF EXISTS "Customers can create their own media items" ON public.customer_media_items;
CREATE POLICY "Customers can create their own media items" ON public.customer_media_items FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 3. Extend event_requests & customer_event_parts
ALTER TABLE public.event_requests
ADD COLUMN IF NOT EXISTS reference_images TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS additional_contacts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reference_video_url TEXT;

ALTER TABLE public.customer_event_parts
ADD COLUMN IF NOT EXISTS venue_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS required_services TEXT[] DEFAULT '{}'::text[];

ALTER TABLE public.event_parts
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 4. Clean up Bare Duplicate Sub-Events ('Haldi', 'Mehendi', 'Sangeet')
DELETE FROM public.event_parts a
USING public.event_parts b
WHERE a.id > b.id
  AND LOWER(TRIM(a.event_type)) = LOWER(TRIM(b.event_type))
  AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name));

DELETE FROM public.event_parts
WHERE LOWER(TRIM(name)) IN ('haldi', 'mehendi', 'sangeet', 'reception', 'muhurtham')
  AND event_type = 'Wedding';

-- 5. Seed / Update Master Sub-Events with Curated Visual Cover Images
INSERT INTO public.event_parts (event_type, name, description, cover_image_url, sort_order, is_active) VALUES
  ('Wedding', 'Haldi Ceremony', 'Vibrant yellow marigold decor, floral splash zone & auspicious haldi staging', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80', 1, true),
  ('Wedding', 'Mehendi Celebration', 'Boho canopy lounge, henna stations, floral seating & traditional folk vibe', 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80', 2, true),
  ('Wedding', 'Sangeet & Cocktail Night', 'Glamorous LED stage, dance floor, concert lighting & cocktail bar setup', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', 3, true),
  ('Wedding', 'Pellikuthuru / Pellikoduku', 'Traditional South Indian ritual mandap, banana leaf decor & auspicious seating', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', 4, true),
  ('Wedding', 'Muhurtham & Varmala', 'Sacred royal wedding mandap, lotus temple arch, floral aisle & live shehnai', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80', 5, true),
  ('Wedding', 'Grand Wedding Reception', 'Luxury banquet hall setup, crystal chandeliers, royal couple stage & lavish feast', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', 6, true),
  
  ('Corporate Event', 'Keynote & Product Launch', 'High-definition LED backdrop walls, audio-visual acoustics & executive podium', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', 1, true),
  ('Corporate Event', 'Gala Dinner & Awards Night', 'Red carpet entrance, trophy stage, ambient table lighting & gourmet banquet', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', 2, true),
  ('Corporate Event', 'Exhibition & Dealer Meet', 'Custom display booths, lounge seating, branding pylons & registration desk', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 3, true),
  
  ('Birthday', 'Themed Party & Cake Cutting', 'Custom backdrop arch, balloon installations, theme props & cake pedestal', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80', 1, true),
  ('Birthday', 'DJ Dance Night', 'Intelligent beam lights, haze machines, DJ console & energetic dance floor', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', 2, true),
  
  ('Anniversary', 'Golden Milestone Celebration', 'Romantic candlelit dining, floral tunnel entry, live acoustic band & photo gallery', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', 1, true),
  
  ('Private Event', 'Griha Pravesh Puja', 'Auspicious havan kund setup, marigold toran entry & traditional dining', 'https://images.unsplash.com/photo-1545232979-fbf4dce9d533?auto=format&fit=crop&w=800&q=80', 1, true),
  ('Private Event', 'Rooftop Get-Together', 'Fairy light canopy, outdoor lounge seating, live live-grill bar & ambient music', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80', 2, true)
ON CONFLICT DO NOTHING;

-- 6. Seed Curated Admin Packages (3 Packages Per Sub-Event)
INSERT INTO public.packages (
  package_type, event_type, name, description, price, is_recommended, recommendation_priority, cover_image_url
) VALUES
  ('EVENT_PART_PACKAGE', 'Wedding', 'Haldi Floral Splash Essential', 'Bright marigold arch, traditional brass thali setup, haldi tubs & ambient seating', 35000.00, true, 1, 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Haldi Royal Marigold Deluxe', 'Full floral canopy mandap, yellow drapes, flower shower cannon, dhol play & VIP lounge', 65000.00, true, 2, 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Haldi Grand Extravaganza', 'Opulent garden transformation, hydraulic flower shower, DJ, live beverage counter & photography', 115000.00, true, 3, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'),

  ('EVENT_PART_PACKAGE', 'Wedding', 'Boho Mehendi Cozy Lounge', 'Colorful dupatta canopy, low seating charpai lounge & floral photo booth', 40000.00, true, 1, 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Rajasthani Folk Mehendi Gala', 'Rajasthani puppet decor, live bangle maker, kalbelia dancers & henna bar', 75000.00, true, 2, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Mehendi Carnival Extravaganza', 'Carnival food stalls, live acoustic singer, premium henna bar & LED photo booth', 135000.00, true, 3, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'),

  ('EVENT_PART_PACKAGE', 'Wedding', 'Sangeet Club Night Essential', 'Truss lighting, DJ console, acrylic dance floor & bar counter decor', 55000.00, true, 1, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Sangeet Starry Glamour Night', 'P10 LED screen backdrop, choreographer rehearsal package, cold pyros & celebrity anchor', 98000.00, true, 2, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Sangeet & Cocktail Concert Gala', 'Concert line-array sound, live fusion band, CO2 jets, VIP cocktail lounge & cinematic video', 185000.00, true, 3, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'),

  ('EVENT_PART_PACKAGE', 'Wedding', 'Royal Banquet Elegance', 'Royal couple stage backdrop, velvet sofa, floral aisle entry & banquet chair covers', 75000.00, true, 1, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Crystal Chandelier Grand Reception', 'Crystal chandelier ceiling canopy, mirror aisle, live string quartet & VIP buffet setup', 145000.00, true, 2, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Imperial Palace Reception Gala', '3D architectural stage, orchid flower ceiling, 360 photo booth & live celebrity singer', 250000.00, true, 3, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;

-- 7. Supabase Storage Bucket Setup for 'customer-media'
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-media', 'customer-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public select customer media" ON storage.objects;
CREATE POLICY "Public select customer media"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-media');

DROP POLICY IF EXISTS "Users can upload customer media" ON storage.objects;
CREATE POLICY "Users can upload customer media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'customer-media' AND auth.role() = 'authenticated');

-- 8. Cleanup Legacy Documents Table (Removed from customer workflow)
DROP TABLE IF EXISTS public.documents CASCADE;

-- 9. Seed Gourmet Catering Service Items & Cleanup Generic Junk Placeholders
DO $$
BEGIN
  -- Insert into 'categories' if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    INSERT INTO public.categories (id, name, description, is_active, sort_order)
    VALUES ('00000000-0000-4000-8000-000000000001', 'Food & Catering Services', 'Gourmet dining and live culinary stations', true, 1)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert into 'main_categories' if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'main_categories') THEN
    INSERT INTO public.main_categories (id, name, description, is_active, sort_order)
    VALUES ('00000000-0000-4000-8000-000000000001', 'Food & Catering Services', 'Gourmet dining and live culinary stations', true, 1)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

INSERT INTO subcategories (id, category_id, name, description, is_active, sort_order)
VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Catering Engine', 'Gourmet food spreads and live counters', true, 1)
ON CONFLICT (id) DO NOTHING;

-- Clean up duplicate and generic placeholder items safely
DELETE FROM request_items 
WHERE service_item_id IN (
  SELECT id FROM service_items 
  WHERE LOWER(name) LIKE '%select any%' 
     OR LOWER(name) LIKE '%3 items%' 
     OR LOWER(name) LIKE '%non veg basic%'
     
     OR LOWER(name) LIKE '%chatnys%'
     OR LOWER(name) LIKE '%karapodi%'
);

DELETE FROM service_items 
WHERE LOWER(name) LIKE '%select any%' 
   OR LOWER(name) LIKE '%3 items%' 
   OR LOWER(name) LIKE '%non veg basic%'
   OR LOWER(name) LIKE '%chatnys%'
   OR LOWER(name) LIKE '%karapodi%';

-- Upsert All Gourmet Catering Service Items into service_items table
INSERT INTO service_items (id, subcategory_id, name, description, price, pricing_type, pricing_unit, food_category, meal_type, is_available, sort_order)
VALUES
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'South Indian Royal Breakfast Spread', 'Steaming mini idlis, medu vada, ghee masala dosa counter, sambar & 3 artisanal chutneys', 350, 'per_plate', 'per_plate', 'veg', 'breakfast', true, 1),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'North Indian Halwa Poori & Amritsari Chole', 'Crispy poori, bedmi aloo, amritsari chole, kesar suji halwa & kulhad lassi', 380, 'per_plate', 'per_plate', 'veg', 'breakfast', true, 2),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Live Street Chaat & Pani Puri Counter', '6 flavors of pani, dahi puri, raj kachori, bhel, papdi chaat & aloo tikki live station', 250, 'per_plate', 'per_plate', 'veg', 'high_tea', true, 3),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'Amritsari Fish Tikka & Chicken Malai Seekh', 'Charcoal grilled amritsari fish fingers, chicken malai seekh kabab & mint chutney', 450, 'per_plate', 'per_plate', 'non_veg', 'high_tea', true, 4),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000001', 'Royal Hyderabadi Dum Veg Biryani & Paneer Butter Masala', 'Fragrant basmati dum biryani, mirchi ka salan, paneer butter masala, butter naan & raita', 550, 'per_plate', 'per_plate', 'veg', 'lunch', true, 5),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000001', 'Authentic Hyderabadi Mutton & Chicken Dum Biryani', 'Slow-cooked saffron mutton dum biryani, chicken roasted gravy, mirchi ka salan & raita', 750, 'per_plate', 'per_plate', 'non_veg', 'lunch', true, 6),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000001', 'Gourmet Mushroom Galouti & Dahi Ke Kebab', 'Melt-in-mouth spiced mushroom galouti on mini parathas & crispy dahi kebabs', 320, 'per_plate', 'per_plate', 'veg', 'cocktail', true, 7),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000001', 'Tandoori Tiger Prawns & Mutton Boti Kebabs', 'Jumbo tiger prawns in yellow chilli marination & smoky tandoori mutton boti kebabs', 650, 'per_plate', 'per_plate', 'non_veg', 'cocktail', true, 8),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000001', 'Imperial Veg Dinner Banquet', 'Dal Makhani, Kadhai Paneer, Subz Handi, Stuffed Kulcha, Jeera Rice, Rumali Roti & Salad Bar', 680, 'per_plate', 'per_plate', 'veg', 'dinner', true, 9),
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000001', 'Royal Mughlai Non-Veg Dinner Feast', 'Butter Chicken, Mutton Rogan Josh, Fish Curry, Assorted Tandoori Rotis, Naan & Pulao', 880, 'per_plate', 'per_plate', 'non_veg', 'dinner', true, 10),
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000001', 'Live Jalebi & Rabri Counter', 'Crispy saffron jalebis prepared live, served with chilled condensed milk rabri', 220, 'per_plate', 'per_plate', 'veg', 'dessert', true, 11),
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000001', 'Gourmet Gelato Ice-Cream & Gulab Jamun', 'Hot gulab jamun with artisanal gelato, sundae toppings & waffle cone counter', 280, 'per_plate', 'per_plate', 'veg', 'dessert', true, 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  pricing_type = EXCLUDED.pricing_type,
  pricing_unit = EXCLUDED.pricing_unit,
  food_category = EXCLUDED.food_category,
  meal_type = EXCLUDED.meal_type;
