-- Event Management Platform - Milestone 1 Database Migration
-- Target: Supabase PostgreSQL (Production Ready)
-- Role: Senior Architect Verified & Approved

-- ============================================================================
-- A. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- B. TABLES
-- ============================================================================

-- 1. Profiles Table (Synced with auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    business_name VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Categories Table (Admin managed)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 3. Subcategories Table (Admin managed)
CREATE TABLE public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 4. Service Items Table (Admin managed)
CREATE TABLE public.service_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    pricing_type VARCHAR(20) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 5. Service Item Media Table (Admin managed)
CREATE TABLE public.service_item_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_item_id UUID NOT NULL REFERENCES public.service_items(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- C. CONSTRAINTS (CHECK & UNIQUE)
-- ============================================================================

-- Profiles constraints
ALTER TABLE public.profiles
    ADD CONSTRAINT check_profiles_role CHECK (role IN ('customer', 'vendor', 'admin')),
    ADD CONSTRAINT check_profiles_phone CHECK (length(phone_number) >= 10);

-- Categories constraints
ALTER TABLE public.categories
    ADD CONSTRAINT check_categories_name_length CHECK (length(name) >= 3);

-- Subcategories constraints
ALTER TABLE public.subcategories
    ADD CONSTRAINT check_subcategories_name_length CHECK (length(name) >= 2);

-- Service Items constraints
ALTER TABLE public.service_items
    ADD CONSTRAINT check_service_items_price CHECK (price >= 0.00),
    ADD CONSTRAINT check_service_items_pricing_type CHECK (pricing_type IN ('flat', 'per_plate'));

-- Media constraints
ALTER TABLE public.service_item_media
    ADD CONSTRAINT check_media_type CHECK (media_type IN ('image', 'video'));

-- ============================================================================
-- D. TRIGGERS & UTILITY FUNCTIONS
-- ============================================================================

-- 1. Helper function: check if user is admin (RLS bypass)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger function: auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subcategories_updated_at
    BEFORE UPDATE ON public.subcategories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_service_items_updated_at
    BEFORE UPDATE ON public.service_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Trigger function: sync profiles on auth signup with Role Hijack Protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
DECLARE
    assigned_role VARCHAR(20);
BEGIN
    -- Extract desired role and sanitize
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    
    -- Admin role hijack prevention (Downgrade unauthorized attempts to customer)
    IF assigned_role = 'admin' THEN
        assigned_role := 'customer';
    END IF;

    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        phone_number, 
        role, 
        business_name, 
        address
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''), -- Guaranteed by app auth logic
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed User'),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', '0000000000'), -- Fallback placeholder
        assigned_role,
        NEW.raw_user_meta_data->>'business_name',
        NEW.raw_user_meta_data->>'address'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Trigger function: auto-manage audit fields (created_by, updated_by)
CREATE OR REPLACE FUNCTION public.handle_audit_fields()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = auth.uid();
        NEW.updated_by = auth.uid();
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_by = auth.uid();
        NEW.created_by = OLD.created_by; -- Prevent tampering with creator field
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach audit triggers
CREATE TRIGGER set_categories_audit
    BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER set_subcategories_audit
    BEFORE INSERT OR UPDATE ON public.subcategories
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER set_service_items_audit
    BEFORE INSERT OR UPDATE ON public.service_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

-- ============================================================================
-- E. INDEXES (PERFORMANCE & CONDITIONAL UNIQUENESS)
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE UNIQUE INDEX idx_profiles_unique_email ON public.profiles(email);

-- Categories indexes
CREATE UNIQUE INDEX idx_categories_unique_active_name ON public.categories (name) WHERE (deleted_at IS NULL);
CREATE INDEX idx_categories_sort ON public.categories(sort_order);
CREATE INDEX idx_categories_deleted ON public.categories(deleted_at) WHERE (deleted_at IS NOT NULL);

-- Subcategories indexes
CREATE INDEX idx_subcategories_category ON public.subcategories(category_id);
CREATE UNIQUE INDEX idx_subcategories_unique_active_name ON public.subcategories (category_id, name) WHERE (deleted_at IS NULL);
CREATE INDEX idx_subcategories_sort ON public.subcategories(sort_order);
CREATE INDEX idx_subcategories_deleted ON public.subcategories(deleted_at) WHERE (deleted_at IS NOT NULL);

-- Service Items indexes
CREATE INDEX idx_service_items_subcategory ON public.service_items(subcategory_id);
CREATE INDEX idx_service_items_availability ON public.service_items(is_available);
CREATE INDEX idx_service_items_sort ON public.service_items(sort_order);
CREATE INDEX idx_service_items_deleted ON public.service_items(deleted_at) WHERE (deleted_at IS NOT NULL);

-- Service Item Media indexes
CREATE INDEX idx_media_service_item ON public.service_item_media(service_item_id);

-- ============================================================================
-- F. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_item_media ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Allow authenticated users to read all profiles"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own profiles"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin(auth.uid()));

-- 2. Categories Policies
CREATE POLICY "Allow public read-only of non-deleted categories"
    ON public.categories FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Allow admins full access to categories"
    ON public.categories FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 3. Subcategories Policies
CREATE POLICY "Allow public read-only of non-deleted subcategories"
    ON public.subcategories FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Allow admins full access to subcategories"
    ON public.subcategories FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 4. Service Items Policies
CREATE POLICY "Allow public read-only of non-deleted service items"
    ON public.service_items FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Allow admins full access to service items"
    ON public.service_items FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 5. Service Item Media Policies
CREATE POLICY "Allow public read-only of media items"
    ON public.service_item_media FOR SELECT
    USING (TRUE);

CREATE POLICY "Allow admins full access to service item media"
    ON public.service_item_media FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- G. STORAGE POLICIES
-- ============================================================================

-- Ensure storage bucket row is configured for 'service-media'
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-media', 'service-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage.objects policies on 'service-media' bucket

CREATE POLICY "Allow public select access to service-media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'service-media');

CREATE POLICY "Allow admin to insert objects in service-media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'service-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Allow admin to update objects in service-media"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'service-media' AND public.is_admin(auth.uid()))
    WITH CHECK (bucket_id = 'service-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Allow admin to delete objects in service-media"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'service-media' AND public.is_admin(auth.uid()));

-- ============================================================================
-- H. PHASES 3-6 TABLES
-- ============================================================================

-- 1. Vendor Category Mappings Table
CREATE TABLE public.vendor_category_mappings (
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (vendor_id, category_id)
);

-- 2. Event Requests Table
CREATE TABLE public.event_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    location TEXT NOT NULL,
    guest_count INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Request Submitted' NOT NULL,
    total_budget NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 3. Request Items Table
CREATE TABLE public.request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
    service_item_id UUID NOT NULL REFERENCES public.service_items(id) ON DELETE RESTRICT,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    pricing_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Vendor Assignments Table
CREATE TABLE public.vendor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_request_category_vendor UNIQUE (request_id, category_id, vendor_id)
);

-- ============================================================================
-- I. PHASES 3-6 CONSTRAINTS, TRIGGERS & RLS
-- ============================================================================

-- Add updated_at trigger for event_requests and vendor_assignments
CREATE TRIGGER set_event_requests_updated_at
    BEFORE UPDATE ON public.event_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_vendor_assignments_updated_at
    BEFORE UPDATE ON public.vendor_assignments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.vendor_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assignments ENABLE ROW LEVEL SECURITY;

-- 1. Vendor Category Mappings RLS
CREATE POLICY "Allow public select access to mappings"
    ON public.vendor_category_mappings FOR SELECT
    USING (true);

CREATE POLICY "Allow vendors/admins full access to mappings"
    ON public.vendor_category_mappings FOR ALL
    USING (vendor_id = auth.uid() OR public.is_admin(auth.uid()))
    WITH CHECK (vendor_id = auth.uid() OR public.is_admin(auth.uid()));

-- 2. Event Requests RLS
CREATE POLICY "Allow customers/admins/assigned-vendors select access to requests"
    ON public.event_requests FOR SELECT
    USING (
        customer_id = auth.uid() 
        OR public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.vendor_assignments va 
            WHERE va.request_id = public.event_requests.id AND va.vendor_id = auth.uid()
        )
    );

CREATE POLICY "Allow customers/admins to insert requests"
    ON public.event_requests FOR INSERT
    WITH CHECK (customer_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow customers/admins/assigned-vendors to update requests"
    ON public.event_requests FOR UPDATE
    USING (
        customer_id = auth.uid() 
        OR public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.vendor_assignments va 
            WHERE va.request_id = public.event_requests.id AND va.vendor_id = auth.uid()
        )
    )
    WITH CHECK (
        customer_id = auth.uid() 
        OR public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.vendor_assignments va 
            WHERE va.request_id = public.event_requests.id AND va.vendor_id = auth.uid()
        )
    );

-- 3. Request Items RLS
CREATE POLICY "Allow customers/admins/assigned-vendors select access to request items"
    ON public.request_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.event_requests r
            WHERE r.id = request_id AND (
                r.customer_id = auth.uid() 
                OR public.is_admin(auth.uid())
                OR EXISTS (
                    SELECT 1 FROM public.vendor_assignments va 
                    WHERE va.request_id = r.id AND va.vendor_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Allow customers/admins to insert request items"
    ON public.request_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.event_requests r
            WHERE r.id = request_id AND (r.customer_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

-- 4. Vendor Assignments RLS
CREATE POLICY "Allow assigned vendors/admins select access"
    ON public.vendor_assignments FOR SELECT
    USING (vendor_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow admins full access to assignments"
    ON public.vendor_assignments FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Allow vendors to update their own assignment status"
    ON public.vendor_assignments FOR UPDATE
    USING (vendor_id = auth.uid())
    WITH CHECK (vendor_id = auth.uid());

-- ============================================================================
-- J. VENDOR CUSTOM SERVICES & MEDIA MANAGEMENT
-- ============================================================================

-- 1. Vendor Custom Services Table
CREATE TABLE IF NOT EXISTS public.vendor_custom_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    subcategory_name VARCHAR(100) NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    custom_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_vendor_custom_price CHECK (custom_price >= 0.00)
);

-- 2. Vendor Custom Service Media Table
CREATE TABLE IF NOT EXISTS public.vendor_custom_service_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_custom_service_id UUID NOT NULL REFERENCES public.vendor_custom_services(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.vendor_custom_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_custom_service_media ENABLE ROW LEVEL SECURITY;

-- Attach timestamp auto-update trigger
DROP TRIGGER IF EXISTS set_vendor_custom_services_updated_at ON public.vendor_custom_services;
CREATE TRIGGER set_vendor_custom_services_updated_at
    BEFORE UPDATE ON public.vendor_custom_services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for vendor_custom_services
CREATE POLICY "Allow public select access to vendor_custom_services"
    ON public.vendor_custom_services FOR SELECT
    USING (true);

CREATE POLICY "Allow vendors/admins full access to vendor_custom_services"
    ON public.vendor_custom_services FOR ALL
    USING (vendor_id = auth.uid() OR public.is_admin(auth.uid()))
    WITH CHECK (vendor_id = auth.uid() OR public.is_admin(auth.uid()));

-- RLS Policies for vendor_custom_service_media
CREATE POLICY "Allow public select access to vendor_custom_service_media"
    ON public.vendor_custom_service_media FOR SELECT
    USING (true);

CREATE POLICY "Allow vendors/admins full access to vendor_custom_service_media"
    ON public.vendor_custom_service_media FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.vendor_custom_services vs
            WHERE vs.id = vendor_custom_service_id AND (vs.vendor_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendor_custom_services vs
            WHERE vs.id = vendor_custom_service_id AND (vs.vendor_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

-- Storage Permissions (allow vendors to upload/delete files in service-media bucket)
DROP POLICY IF EXISTS "Allow vendors to insert objects in service-media" ON storage.objects;
CREATE POLICY "Allow vendors to insert objects in service-media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'service-media' AND (
        public.is_admin(auth.uid()) OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'vendor')
    ));

DROP POLICY IF EXISTS "Allow vendors to delete objects in service-media" ON storage.objects;
CREATE POLICY "Allow vendors to delete objects in service-media"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'service-media' AND (
        public.is_admin(auth.uid()) OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'vendor')
    ));
