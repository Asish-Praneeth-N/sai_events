-- ============================================================================
-- SAI EVENTS - Sub-Events, Per-Function Location & Service Requirements Migration
-- Target: Supabase PostgreSQL (Run in Supabase SQL Editor)
-- Purpose: Support per-sub-event venue/location selection, mandatory cover images,
--          and specific service requirements (Food, Sound, Dance, Decor, etc.).
-- ============================================================================

-- 1. Extend customer_event_parts Table for Venue Location & Required Services
ALTER TABLE public.customer_event_parts
ADD COLUMN IF NOT EXISTS venue_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS required_services TEXT[] DEFAULT '{}'::text[];

-- 2. Extend event_parts Table for Mandatory Cover Images
ALTER TABLE public.event_parts
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2.1 Deduplicate existing event_parts table to remove duplicate sub-events
DELETE FROM public.event_parts a
USING public.event_parts b
WHERE a.id > b.id
  AND LOWER(TRIM(a.event_type)) = LOWER(TRIM(b.event_type))
  AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name));

-- Clean up bare duplicate titles ('Haldi', 'Mehendi', 'Sangeet')
DELETE FROM public.event_parts
WHERE LOWER(TRIM(name)) IN ('haldi', 'mehendi', 'sangeet', 'reception', 'muhurtham')
  AND event_type = 'Wedding';

-- 3. Seed / Update Master Event Parts with Curated Visual Cover Images
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

-- 4. Seed Curated Admin Packages (3 Packages Per Sub-Event: Haldi, Mehendi, Sangeet, Reception)
INSERT INTO public.packages (
  package_type, event_type, name, description, price, is_recommended, recommendation_priority, cover_image_url
) VALUES
  -- Haldi Packages
  ('EVENT_PART_PACKAGE', 'Wedding', 'Haldi Floral Splash Essential', 'Bright marigold arch, traditional brass thali setup, haldi tubs & ambient seating', 35000.00, true, 1, 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Haldi Royal Marigold Deluxe', 'Full floral canopy mandap, yellow drapes, flower shower cannon, dhol play & VIP lounge', 65000.00, true, 2, 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Haldi Grand Extravaganza', 'Opulent garden transformation, hydraulic flower shower, DJ, live beverage counter & photography', 115000.00, true, 3, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'),

  -- Mehendi Packages
  ('EVENT_PART_PACKAGE', 'Wedding', 'Boho Mehendi Cozy Lounge', 'Colorful dupatta canopy, low seating charpai lounge & floral photo booth', 40000.00, true, 1, 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Rajasthani Folk Mehendi Gala', 'Rajasthani puppet decor, live bangle maker, kalbelia dancers & henna bar', 75000.00, true, 2, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Mehendi Carnival Extravaganza', 'Carnival food stalls, live acoustic singer, premium henna bar & LED photo booth', 135000.00, true, 3, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'),

  -- Sangeet Packages
  ('EVENT_PART_PACKAGE', 'Wedding', 'Sangeet Club Night Essential', 'Truss lighting, DJ console, acrylic dance floor & bar counter decor', 55000.00, true, 1, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Sangeet Starry Glamour Night', 'P10 LED screen backdrop, choreographer rehearsal package, cold pyros & celebrity anchor', 98000.00, true, 2, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Sangeet & Cocktail Concert Gala', 'Concert line-array sound, live fusion band, CO2 jets, VIP cocktail lounge & cinematic video', 185000.00, true, 3, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'),

  -- Reception Packages
  ('EVENT_PART_PACKAGE', 'Wedding', 'Royal Banquet Elegance', 'Royal couple stage backdrop, velvet sofa, floral aisle entry & banquet chair covers', 75000.00, true, 1, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Crystal Chandelier Grand Reception', 'Crystal chandelier ceiling canopy, mirror aisle, live string quartet & VIP buffet setup', 145000.00, true, 2, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'),
  ('EVENT_PART_PACKAGE', 'Wedding', 'Imperial Palace Reception Gala', '3D architectural stage, orchid flower ceiling, 360 photo booth & live celebrity singer', 250000.00, true, 3, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;
