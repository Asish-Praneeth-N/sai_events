-- ============================================================================
-- SAI EVENTS - Vendor Module Enhancements & Admin Controls Schema Migration
-- ============================================================================

-- 1. Create Vendor Personal Schedules table
CREATE TABLE IF NOT EXISTS public.vendor_personal_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  entry_type VARCHAR(100) NOT NULL DEFAULT 'Leave', -- 'Leave', 'Personal Function', 'Equipment Maintenance', 'Office Work', 'Family Function'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE,
  end_time TIME WITHOUT TIME ZONE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_vendor_personal_sched_dates 
  ON public.vendor_personal_schedules(vendor_id, start_date, end_date);

-- 2. Create Vendor Quotations & Quotation Items tables
CREATE TABLE IF NOT EXISTS public.vendor_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Submitted', -- 'Draft', 'Submitted', 'Approved', 'Rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.vendor_quotations(id) ON DELETE CASCADE,
  service_item_id UUID NOT NULL REFERENCES public.service_items(id) ON DELETE CASCADE,
  item_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Vendor Financial Ledger & Payments table
CREATE TABLE IF NOT EXISTS public.vendor_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_agreed_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  advance_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  remaining_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Paid', 'Partial', 'Pending'
  paid_date DATE,
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_id UUID NOT NULL REFERENCES public.vendor_financials(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(100) DEFAULT 'Bank Transfer', -- 'Bank Transfer', 'UPI', 'Cheque', 'Cash'
  reference_number VARCHAR(255),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extend Profiles table with Vendor Attributes & Daily Capacity
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS max_daily_capacity INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS service_radius_km INT DEFAULT 100,
  ADD COLUMN IF NOT EXISTS primary_city VARCHAR(150),
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS years_of_experience INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS account_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS account_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bank_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vendor_documents JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS godown_photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS vehicle_assets JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- 5. Row Level Security Policies
ALTER TABLE public.vendor_personal_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;

-- Personal schedules policies
CREATE POLICY vendor_personal_schedules_owner ON public.vendor_personal_schedules
  FOR ALL USING (auth.uid() = vendor_id);

CREATE POLICY vendor_personal_schedules_admin_read ON public.vendor_personal_schedules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Quotation policies
CREATE POLICY vendor_quotations_owner ON public.vendor_quotations
  FOR ALL USING (auth.uid() = vendor_id);

CREATE POLICY vendor_quotations_admin ON public.vendor_quotations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY vendor_quotation_items_all ON public.vendor_quotation_items
  FOR ALL USING (TRUE);

-- Financials policies
CREATE POLICY vendor_financials_owner ON public.vendor_financials
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY vendor_financials_admin ON public.vendor_financials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY vendor_payments_owner ON public.vendor_payments
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY vendor_payments_admin ON public.vendor_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
