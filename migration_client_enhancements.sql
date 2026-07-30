-- ============================================================================
-- SAI EVENTS - Client Enhancements & Masters Migration
-- Target: Supabase PostgreSQL
-- Purpose: Add event_parts, recommendations, food pricing units, and request details
-- ============================================================================

-- 1. Event Parts Master Table
CREATE TABLE IF NOT EXISTS public.event_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast lookup by event type
CREATE INDEX IF NOT EXISTS idx_event_parts_type ON public.event_parts(event_type);

-- 2. Event Request Parts Junction Table
CREATE TABLE IF NOT EXISTS public.event_request_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
    event_part_id UUID NOT NULL REFERENCES public.event_parts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_request_part UNIQUE (request_id, event_part_id)
);

CREATE INDEX IF NOT EXISTS idx_event_request_parts_request ON public.event_request_parts(request_id);

-- 3. Admin Recommendations Master Table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    service_item_id UUID NOT NULL REFERENCES public.service_items(id) ON DELETE CASCADE,
    badge_label VARCHAR(100) DEFAULT 'Recommended' NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_type_service UNIQUE (event_type, service_item_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_type ON public.recommendations(event_type);

-- 4. Add pricing units & food attributes to service_items
ALTER TABLE public.service_items
  ADD COLUMN IF NOT EXISTS pricing_unit VARCHAR(20) DEFAULT 'per_plate',
  ADD COLUMN IF NOT EXISTS food_category VARCHAR(50) DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50) DEFAULT 'general';

-- Update existing NULLs
UPDATE public.service_items SET pricing_unit = 'per_plate' WHERE pricing_unit IS NULL;
UPDATE public.service_items SET food_category = 'general' WHERE food_category IS NULL;
UPDATE public.service_items SET meal_type = 'general' WHERE meal_type IS NULL;

ALTER TABLE public.service_items
  DROP CONSTRAINT IF EXISTS check_service_items_pricing_unit;
ALTER TABLE public.service_items
  ADD CONSTRAINT check_service_items_pricing_unit
    CHECK (pricing_unit IN ('per_plate', 'per_piece', 'fixed'));

-- 5. Add enhanced details to event_requests
ALTER TABLE public.event_requests
  ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS event_for VARCHAR(100),
  ADD COLUMN IF NOT EXISTS event_time VARCHAR(20),
  ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(4,1) DEFAULT 4.0,
  ADD COLUMN IF NOT EXISTS venue_address TEXT,
  ADD COLUMN IF NOT EXISTS venue_lat NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS venue_lng NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS target_budget NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS special_requirements TEXT;

-- 6. Add attributes to request_items
ALTER TABLE public.request_items
  ADD COLUMN IF NOT EXISTS pricing_unit VARCHAR(20) DEFAULT 'per_plate',
  ADD COLUMN IF NOT EXISTS food_category VARCHAR(50) DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50) DEFAULT 'general';

-- 7. Triggers for updated_at
DROP TRIGGER IF EXISTS set_event_parts_updated_at ON public.event_parts;
CREATE TRIGGER set_event_parts_updated_at
  BEFORE UPDATE ON public.event_parts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_recommendations_updated_at ON public.recommendations;
CREATE TRIGGER set_recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Row Level Security (RLS)
ALTER TABLE public.event_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_request_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select of event_parts" ON public.event_parts;
CREATE POLICY "Allow public select of event_parts"
  ON public.event_parts FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admins full access to event_parts" ON public.event_parts;
CREATE POLICY "Allow admins full access to event_parts"
  ON public.event_parts FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow customers/admins select request parts" ON public.event_request_parts;
CREATE POLICY "Allow customers/admins select request parts"
  ON public.event_request_parts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.event_requests er
      WHERE er.id = request_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Allow customers/admins insert request parts" ON public.event_request_parts;
CREATE POLICY "Allow customers/admins insert request parts"
  ON public.event_request_parts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_requests er
      WHERE er.id = request_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Allow customers/admins delete request parts" ON public.event_request_parts;
CREATE POLICY "Allow customers/admins delete request parts"
  ON public.event_request_parts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.event_requests er
      WHERE er.id = request_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Allow public select of recommendations" ON public.recommendations;
CREATE POLICY "Allow public select of recommendations"
  ON public.recommendations FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admins full access to recommendations" ON public.recommendations;
CREATE POLICY "Allow admins full access to recommendations"
  ON public.recommendations FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Seed default event parts for initial convenience
INSERT INTO public.event_parts (event_type, name, sort_order) VALUES
  ('Wedding', 'Engagement', 1),
  ('Wedding', 'Haldi', 2),
  ('Wedding', 'Mehendi', 3),
  ('Wedding', 'Sangeet', 4),
  ('Wedding', 'Wedding Ceremony', 5),
  ('Wedding', 'Reception', 6),
  ('Birthday', 'Cake Cutting', 1),
  ('Birthday', 'Entertainment & Games', 2),
  ('Birthday', 'Dinner', 3),
  ('Corporate', 'Keynote & Conference', 1),
  ('Corporate', 'Networking Lunch', 2),
  ('Corporate', 'Gala Dinner', 3)
ON CONFLICT DO NOTHING;
