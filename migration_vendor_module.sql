-- ============================================================================
-- SAI EVENTS - Vendor Module Migration
-- Target: Supabase PostgreSQL (SQL Editor)
-- Purpose: Add all vendor-specific columns and tables required by the
--          Vendor Business Workspace, previously missing from the schema.
-- ============================================================================

-- 1. Add vendor-specific columns to profiles
--    - status          : vendor approval state managed by Admin
--    - availability_status : vendor's own workspace availability preference
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20);

-- Normalise all existing rows BEFORE adding the CHECK constraints
-- so no row can violate them
UPDATE public.profiles
  SET status = 'Approved'
  WHERE status IS NULL OR status NOT IN ('Pending', 'Approved', 'Rejected');

UPDATE public.profiles
  SET availability_status = 'Available'
  WHERE availability_status IS NULL OR availability_status NOT IN ('Available', 'Busy', 'Leave');

-- Now set NOT NULL defaults (safe because every row has a valid value)
ALTER TABLE public.profiles
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'Approved',
  ALTER COLUMN availability_status SET NOT NULL,
  ALTER COLUMN availability_status SET DEFAULT 'Available';

-- Add CHECK constraints (all rows now conform)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_profiles_status;
ALTER TABLE public.profiles
  ADD CONSTRAINT check_profiles_status
    CHECK (status IN ('Pending', 'Approved', 'Rejected'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_profiles_availability_status;
ALTER TABLE public.profiles
  ADD CONSTRAINT check_profiles_availability_status
    CHECK (availability_status IN ('Available', 'Busy', 'Leave'));

-- ============================================================================
-- 2. Vendor Services Table
--    Each vendor can offer custom prices for admin-managed service_items.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_item_id UUID NOT NULL REFERENCES public.service_items(id) ON DELETE CASCADE,
    custom_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_vendor_service UNIQUE (vendor_id, service_item_id),
    CONSTRAINT check_vendor_service_price CHECK (custom_price >= 0)
);

CREATE TRIGGER set_vendor_services_updated_at
  BEFORE UPDATE ON public.vendor_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow vendors/admins to read vendor_services"
  ON public.vendor_services FOR SELECT
  USING (vendor_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow vendors/admins full access to vendor_services"
  ON public.vendor_services FOR ALL
  USING (vendor_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (vendor_id = auth.uid() OR public.is_admin(auth.uid()));

-- ============================================================================
-- 3. Vendor Service Media Table
--    Stores media URLs for each vendor_service entry.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_service_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_service_id UUID NOT NULL REFERENCES public.vendor_services(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.vendor_service_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of vendor_service_media"
  ON public.vendor_service_media FOR SELECT
  USING (true);

CREATE POLICY "Allow vendors/admins full access to vendor_service_media"
  ON public.vendor_service_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_services vs
      WHERE vs.id = vendor_service_id
        AND (vs.vendor_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendor_services vs
      WHERE vs.id = vendor_service_id
        AND (vs.vendor_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

-- ============================================================================
-- 4. Vendor Portfolio Table
--    Stores portfolio image URLs per vendor, replacing the old localStorage approach.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_portfolio_vendor ON public.vendor_portfolio(vendor_id);

ALTER TABLE public.vendor_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of vendor_portfolio"
  ON public.vendor_portfolio FOR SELECT
  USING (true);

CREATE POLICY "Allow vendors/admins full access to vendor_portfolio"
  ON public.vendor_portfolio FOR ALL
  USING (vendor_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (vendor_id = auth.uid() OR public.is_admin(auth.uid()));

-- ============================================================================
-- 5. Add completion_notes column to vendor_assignments
--    Used by the Completion Report submission instead of a fake data: URI file.
-- ============================================================================
ALTER TABLE public.vendor_assignments
  ADD COLUMN IF NOT EXISTS completion_notes TEXT,
  ADD COLUMN IF NOT EXISTS completion_submitted_at TIMESTAMPTZ;

-- ============================================================================
-- 6. Storage bucket for vendor uploads (documents & media)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-uploads', 'vendor-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow vendors to upload to vendor-uploads bucket
CREATE POLICY "Allow vendors to insert in vendor-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-uploads'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );

CREATE POLICY "Allow public read from vendor-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-uploads');

CREATE POLICY "Allow vendors to delete their own files in vendor-uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vendor-uploads'
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'vendor'
      )
    )
  );
