-- ============================================================================
-- SAI EVENTS - Event Parts, Service Packages & Recommendation Engine Migration
-- Target: Supabase PostgreSQL
-- Purpose: Hierarchical planning (Event Type -> Event Parts -> Services -> Packages),
--          rule-based recommendations, catering configurations, and price snapshots.
-- ============================================================================

-- 1. Master Event Types Table
CREATE TABLE IF NOT EXISTS public.event_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Default Event Types
INSERT INTO public.event_types (name, description, sort_order) VALUES
  ('Wedding', 'Grand matrimonial ceremonies, Haldi, Sangeet, Mehendi & Receptions', 1),
  ('Corporate Event', 'Product launches, dealer meets, conferences & galas', 2),
  ('Birthday', 'Private milestone birthday celebrations & themed banquets', 3),
  ('Anniversary', 'Golden milestone celebrations & private dinners', 4),
  ('Private Event', 'Exclusive housewarmings, get-togethers & private parties', 5),
  ('Other Celebration', 'Custom festivities & community gatherings', 6)
ON CONFLICT (name) DO NOTHING;

-- 2. Master Event Parts Table & Type-Part Junction
CREATE TABLE IF NOT EXISTS public.event_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_parts_type ON public.event_parts(event_type);

CREATE TABLE IF NOT EXISTS public.event_type_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type_id UUID NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
    event_part_id UUID NOT NULL REFERENCES public.event_parts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_type_part UNIQUE (event_type_id, event_part_id)
);

-- 3. Event Part to Service Mapping
CREATE TABLE IF NOT EXISTS public.event_part_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_part_id UUID NOT NULL REFERENCES public.event_parts(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE,
    service_item_id UUID REFERENCES public.service_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_part_services_part ON public.event_part_services(event_part_id);

-- 4. Centralized Package Management Table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('EVENT_PART_PACKAGE', 'SERVICE_PACKAGE')),
    event_type VARCHAR(100) NOT NULL,
    event_part_id UUID REFERENCES public.event_parts(id) ON DELETE CASCADE,
    service_item_id UUID REFERENCES public.service_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    original_value NUMERIC(12, 2),
    savings NUMERIC(12, 2),
    is_recommended BOOLEAN DEFAULT FALSE NOT NULL,
    min_suitable_budget NUMERIC(12, 2),
    max_suitable_budget NUMERIC(12, 2),
    recommendation_priority INTEGER DEFAULT 0 NOT NULL,
    cover_image_url TEXT,
    ref_video_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_packages_type_part ON public.packages(event_type, event_part_id);
CREATE INDEX IF NOT EXISTS idx_packages_service ON public.packages(service_item_id);

CREATE TABLE IF NOT EXISTS public.package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    service_name VARCHAR(150) NOT NULL,
    service_item_id UUID REFERENCES public.service_items(id) ON DELETE SET NULL,
    is_included BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.package_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image' NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL
);

-- 5. Customer Event Selections & Price Snapshots
CREATE TABLE IF NOT EXISTS public.customer_event_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
    event_part_id UUID NOT NULL REFERENCES public.event_parts(id) ON DELETE RESTRICT,
    event_part_name VARCHAR(100) NOT NULL,
    event_date DATE,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    venue_name VARCHAR(255),
    venue_address TEXT,
    min_guests INTEGER,
    max_guests INTEGER,
    planning_mode VARCHAR(50) CHECK (planning_mode IN ('RECOMMENDED', 'CUSTOM')),
    selected_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    package_price_snapshot NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_event_parts_request ON public.customer_event_parts(request_id);

CREATE TABLE IF NOT EXISTS public.customer_event_part_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_event_part_id UUID NOT NULL REFERENCES public.customer_event_parts(id) ON DELETE CASCADE,
    service_item_id UUID REFERENCES public.service_items(id) ON DELETE RESTRICT,
    service_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    custom_requirements TEXT,
    price_snapshot NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_part_services_part ON public.customer_event_part_services(customer_event_part_id);

-- 6. Specialized Catering Configuration Table
CREATE TABLE IF NOT EXISTS public.catering_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_event_part_id UUID NOT NULL REFERENCES public.customer_event_parts(id) ON DELETE CASCADE,
    meal_types TEXT[] DEFAULT '{}'::text[] NOT NULL,
    food_preference VARCHAR(50) NOT NULL,
    veg_plate_count INTEGER DEFAULT 0,
    non_veg_plate_count INTEGER DEFAULT 0,
    plate_price_snapshot NUMERIC(12, 2) DEFAULT 0,
    total_catering_price_snapshot NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Automated Updated At Triggers
DROP TRIGGER IF EXISTS set_event_types_updated_at ON public.event_types;
CREATE TRIGGER set_event_types_updated_at BEFORE UPDATE ON public.event_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_packages_updated_at ON public.packages;
CREATE TRIGGER set_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customer_event_parts_updated_at ON public.customer_event_parts;
CREATE TRIGGER set_customer_event_parts_updated_at BEFORE UPDATE ON public.customer_event_parts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Row Level Security (RLS)
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_type_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_part_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_event_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_event_part_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_configurations ENABLE ROW LEVEL SECURITY;

-- Catalog Policies (Public Read, Admin Write)
CREATE POLICY "Public catalog select event_types" ON public.event_types FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admin full access event_types" ON public.event_types FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public catalog select packages" ON public.packages FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admin full access packages" ON public.packages FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public catalog select package_services" ON public.package_services FOR SELECT USING (true);
CREATE POLICY "Admin full access package_services" ON public.package_services FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public catalog select package_media" ON public.package_media FOR SELECT USING (true);
CREATE POLICY "Admin full access package_media" ON public.package_media FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Customer Selections Policies
CREATE POLICY "Customer/Admin select customer_event_parts" ON public.customer_event_parts FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.event_requests er WHERE er.id = request_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE POLICY "Customer/Admin insert customer_event_parts" ON public.customer_event_parts FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.event_requests er WHERE er.id = request_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE POLICY "Customer/Admin update customer_event_parts" ON public.customer_event_parts FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.event_requests er WHERE er.id = request_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE POLICY "Customer/Admin delete customer_event_parts" ON public.customer_event_parts FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.event_requests er WHERE er.id = request_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE POLICY "Customer/Admin access customer_event_part_services" ON public.customer_event_part_services FOR ALL
    USING (EXISTS (SELECT 1 FROM public.customer_event_parts cep JOIN public.event_requests er ON er.id = cep.request_id WHERE cep.id = customer_event_part_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE POLICY "Customer/Admin access catering_configurations" ON public.catering_configurations FOR ALL
    USING (EXISTS (SELECT 1 FROM public.customer_event_parts cep JOIN public.event_requests er ON er.id = cep.request_id WHERE cep.id = customer_event_part_id AND (er.customer_id = auth.uid() OR public.is_admin(auth.uid()))));
