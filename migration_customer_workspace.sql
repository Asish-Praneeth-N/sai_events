    -- ============================================================================
    -- SAI EVENTS - Customer Module, Workspace & Planning Database Migration
    -- Target: Supabase PostgreSQL (Run in Supabase SQL Editor)
    -- Purpose: Support profile completion, country codes, event draft persistence,
    --          event edit requests, and event-linked meeting requests.
    -- ============================================================================

    -- 1. Extend Profiles Table for Country Codes & Location
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(10) DEFAULT '+91',
    ADD COLUMN IF NOT EXISTS whatsapp_country_code VARCHAR(10) DEFAULT '+91',
    ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS whatsapp_same_as_phone BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS location_lat NUMERIC(10,7),
    ADD COLUMN IF NOT EXISTS location_lng NUMERIC(10,7),
    ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

    -- Update existing profiles with non-empty phone and full_name to be completed
    UPDATE public.profiles
    SET profile_completed = TRUE
    WHERE phone_number IS NOT NULL 
    AND phone_number <> '' 
    AND phone_number <> '0000000000'
    AND full_name IS NOT NULL 
    AND full_name <> '' 
    AND full_name <> 'Unnamed User';

    -- 2. Extend Event Requests Table for Drafts & Stage 1 Details
    ALTER TABLE public.event_requests
    ADD COLUMN IF NOT EXISTS min_guest_count INTEGER,
    ADD COLUMN IF NOT EXISTS max_guest_count INTEGER,
    ADD COLUMN IF NOT EXISTS budget_range VARCHAR(100),
    ADD COLUMN IF NOT EXISTS custom_budget NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS reference_video_url TEXT,
    ADD COLUMN IF NOT EXISTS planning_stage INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS celebrant_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS draft_status VARCHAR(50) DEFAULT 'active', -- 'active', 'discarded', 'submitted'
    ADD COLUMN IF NOT EXISTS discarded_at TIMESTAMPTZ;

    -- Create Indexes for fast draft queries
    CREATE INDEX IF NOT EXISTS idx_event_requests_customer_draft 
    ON public.event_requests(customer_id, is_draft, draft_status);

    -- 3. Create Event Edit Requests Table
    CREATE TABLE IF NOT EXISTS public.event_edit_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        requested_categories TEXT[] NOT NULL DEFAULT '{}',
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected', 'used'
        requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        approved_at TIMESTAMPTZ,
        approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        used_at TIMESTAMPTZ,
        change_history JSONB DEFAULT '[]'::jsonb NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        CONSTRAINT check_edit_request_status CHECK (status IN ('pending', 'approved', 'rejected', 'used'))
    );

    CREATE INDEX IF NOT EXISTS idx_edit_requests_event ON public.event_edit_requests(event_id);
    CREATE INDEX IF NOT EXISTS idx_edit_requests_customer ON public.event_edit_requests(customer_id);
    CREATE INDEX IF NOT EXISTS idx_edit_requests_status ON public.event_edit_requests(status);

    -- 4. Create Event Meetings Table
    CREATE TABLE IF NOT EXISTS public.event_meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        purpose TEXT NOT NULL,
        preferred_date DATE NOT NULL,
        preferred_time_window VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Scheduled', 'Rejected', 'Completed', 'Cancelled'
        confirmed_date DATE,
        confirmed_time VARCHAR(20),
        meeting_link TEXT,
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        CONSTRAINT check_meeting_status CHECK (status IN ('Pending', 'Scheduled', 'Rejected', 'Completed', 'Cancelled'))
    );

    CREATE INDEX IF NOT EXISTS idx_event_meetings_event ON public.event_meetings(event_id);
    CREATE INDEX IF NOT EXISTS idx_event_meetings_customer ON public.event_meetings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_event_meetings_status ON public.event_meetings(status);

    -- 5. Updated At Triggers
    DROP TRIGGER IF EXISTS set_event_edit_requests_updated_at ON public.event_edit_requests;
    CREATE TRIGGER set_event_edit_requests_updated_at
        BEFORE UPDATE ON public.event_edit_requests
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    DROP TRIGGER IF EXISTS set_event_meetings_updated_at ON public.event_meetings;
    CREATE TRIGGER set_event_meetings_updated_at
        BEFORE UPDATE ON public.event_meetings
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    -- 6. Enable Row Level Security
    ALTER TABLE public.event_edit_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_meetings ENABLE ROW LEVEL SECURITY;

    -- 7. Row Level Security Policies for event_edit_requests
    DROP POLICY IF EXISTS "Allow customers and admins select access to edit requests" ON public.event_edit_requests;
    CREATE POLICY "Allow customers and admins select access to edit requests"
        ON public.event_edit_requests FOR SELECT
        USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Allow customers to create edit requests" ON public.event_edit_requests;
    CREATE POLICY "Allow customers to create edit requests"
        ON public.event_edit_requests FOR INSERT
        WITH CHECK (customer_id = auth.uid() OR public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Allow customers and admins to update edit requests" ON public.event_edit_requests;
    CREATE POLICY "Allow customers and admins to update edit requests"
        ON public.event_edit_requests FOR UPDATE
        USING (customer_id = auth.uid() OR public.is_admin(auth.uid()))
        WITH CHECK (customer_id = auth.uid() OR public.is_admin(auth.uid()));

    -- 8. Row Level Security Policies for event_meetings
    DROP POLICY IF EXISTS "Allow customers and admins select access to event meetings" ON public.event_meetings;
    CREATE POLICY "Allow customers and admins select access to event meetings"
        ON public.event_meetings FOR SELECT
        USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Allow customers to create event meetings" ON public.event_meetings;
    CREATE POLICY "Allow customers to create event meetings"
        ON public.event_meetings FOR INSERT
        WITH CHECK (customer_id = auth.uid() OR public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Allow admins and customers to update event meetings" ON public.event_meetings;
    CREATE POLICY "Allow admins and customers to update event meetings"
        ON public.event_meetings FOR UPDATE
        USING (customer_id = auth.uid() OR public.is_admin(auth.uid()))
        WITH CHECK (customer_id = auth.uid() OR public.is_admin(auth.uid()));
