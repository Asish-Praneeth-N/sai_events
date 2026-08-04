-- ============================================================================
-- SAI EVENTS - Guest Enquiries & Account Reconciliation Database Migration
-- Target: Supabase PostgreSQL (Run in Supabase SQL Editor)
-- Purpose: Track public guest enquiries and automatically link to user accounts
-- ============================================================================

-- 1. Create Guest Enquiries Table
CREATE TABLE IF NOT EXISTS public.guest_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' NOT NULL,
    linked_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_guest_enquiry_status CHECK (status IN ('new', 'in_progress', 'resolved'))
);

-- 2. Index for fast search and normalization queries
CREATE INDEX IF NOT EXISTS idx_guest_enquiries_email ON public.guest_enquiries(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_guest_enquiries_linked_user_id ON public.guest_enquiries(linked_user_id);
CREATE INDEX IF NOT EXISTS idx_guest_enquiries_status ON public.guest_enquiries(status);

-- 3. Automatic updated_at timestamp trigger
DROP TRIGGER IF EXISTS set_guest_enquiries_updated_at ON public.guest_enquiries;
CREATE TRIGGER set_guest_enquiries_updated_at
    BEFORE UPDATE ON public.guest_enquiries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Account Creation Reconciliation Function & Trigger
CREATE OR REPLACE FUNCTION public.handle_reconcile_guest_enquiries()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE public.guest_enquiries
    SET linked_user_id = NEW.id,
        updated_at = NOW()
    WHERE LOWER(email) = LOWER(NEW.email)
      AND linked_user_id IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_created_reconcile_guest_enquiries ON public.profiles;
CREATE TRIGGER on_profile_created_reconcile_guest_enquiries
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_reconcile_guest_enquiries();

-- 5. Secure RPC Function for Guest Enquiry Submission (Bypasses RLS RETURNING constraint safely)
CREATE OR REPLACE FUNCTION public.submit_guest_enquiry(
    p_full_name VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_event_type VARCHAR,
    p_event_description TEXT
)
RETURNS UUID SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_normalized_email VARCHAR;
    v_linked_user_id UUID := NULL;
    v_enquiry_id UUID;
BEGIN
    v_normalized_email := LOWER(TRIM(p_email));

    -- Check if user profile already exists with this email
    SELECT id INTO v_linked_user_id
    FROM public.profiles
    WHERE LOWER(email) = v_normalized_email
    LIMIT 1;

    -- Insert into guest_enquiries
    INSERT INTO public.guest_enquiries (
        full_name,
        email,
        phone,
        event_type,
        event_description,
        status,
        linked_user_id
    ) VALUES (
        TRIM(p_full_name),
        v_normalized_email,
        TRIM(p_phone),
        TRIM(p_event_type),
        TRIM(p_event_description),
        'new',
        v_linked_user_id
    ) RETURNING id INTO v_enquiry_id;

    -- Log admin notification
    BEGIN
        INSERT INTO public.notifications (
            user_type,
            user_name,
            message,
            status
        ) VALUES (
            'admin',
            TRIM(p_full_name),
            'New Event Enquiry: ' || TRIM(p_full_name) || ' submitted a ' || TRIM(p_event_type) || ' enquiry.',
            'Delivered'
        );
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN v_enquiry_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execution to public/anon
GRANT EXECUTE ON FUNCTION public.submit_guest_enquiry(VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT) TO anon, authenticated, service_role;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.guest_enquiries ENABLE ROW LEVEL SECURITY;

-- 7. Row Level Security Policies

-- Policy A: Admins have full access (select, insert, update, delete)
DROP POLICY IF EXISTS "Allow admins full access to guest_enquiries" ON public.guest_enquiries;
CREATE POLICY "Allow admins full access to guest_enquiries"
    ON public.guest_enquiries FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Policy B: Allow public/unauthenticated users to submit guest enquiries
DROP POLICY IF EXISTS "Allow public guest enquiry submission" ON public.guest_enquiries;
CREATE POLICY "Allow public guest enquiry submission"
    ON public.guest_enquiries FOR INSERT
    WITH CHECK (true);

-- Policy C: Authenticated users can read their own linked enquiries
DROP POLICY IF EXISTS "Allow users to read their own linked guest enquiries" ON public.guest_enquiries;
CREATE POLICY "Allow users to read their own linked guest enquiries"
    ON public.guest_enquiries FOR SELECT
    USING (linked_user_id = auth.uid());
