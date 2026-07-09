-- ============================================================================
-- SAI EVENTS - Milestone 2 Database Migration
-- Target: Supabase PostgreSQL (SQL Editor)
-- Purpose: Support workforce management for Operational Managers and Event Assignments
-- ============================================================================

-- 1. Alter check constraint for roles on profiles to include 'operational_manager'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_profiles_role;
ALTER TABLE public.profiles ADD CONSTRAINT check_profiles_role CHECK (role IN ('customer', 'vendor', 'admin', 'operational_manager'));

-- 2. Create Operational Managers Table
CREATE TABLE IF NOT EXISTS public.operational_managers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(100) NOT NULL DEFAULT 'Coordinator',
    assigned_regions TEXT[] NOT NULL DEFAULT '{}',
    assigned_cities TEXT[] NOT NULL DEFAULT '{}',
    availability_status VARCHAR(50) DEFAULT 'Inactive' NOT NULL, -- Available, Busy, On Leave, Training, Inactive
    employment_status VARCHAR(50) DEFAULT 'Onboarding' NOT NULL, -- Onboarding, Active, Suspended, Deactivated, Soft Deleted
    joining_date DATE DEFAULT CURRENT_DATE NOT NULL,
    current_workload INTEGER DEFAULT 0 NOT NULL,
    performance_score NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    completion_rate NUMERIC(5, 2) DEFAULT 100.00 NOT NULL,
    profile_photo TEXT,
    created_by_admin UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_om_availability CHECK (availability_status IN ('Available', 'Busy', 'On Leave', 'Training', 'Inactive')),
    CONSTRAINT check_om_employment CHECK (employment_status IN ('Onboarding', 'Active', 'Suspended', 'Deactivated', 'Soft Deleted'))
);

-- 3. Create Event Assignments Table
CREATE TABLE IF NOT EXISTS public.event_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_operational_manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL, -- Pending, Assigned, Accepted, Execution Started, Execution Complete, Closed
    handover_notes TEXT,
    internal_notes TEXT,
    expected_completion TIMESTAMPTZ,
    escalation_level INTEGER DEFAULT 0 NOT NULL, -- 0 = None, 1 = Low, 2 = Medium, 3 = High
    escalation_reason TEXT,
    reassignment_history JSONB DEFAULT '[]'::jsonb NOT NULL,
    timeline JSONB DEFAULT '[]'::jsonb NOT NULL,
    activity JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_assignment_status CHECK (status IN ('Pending', 'Assigned', 'Accepted', 'Execution Started', 'Execution Complete', 'Closed')),
    CONSTRAINT check_escalation_level CHECK (escalation_level BETWEEN 0 AND 3)
);

-- 4. Create Audit Logs Table (Immutable Log)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL, -- 'Operational Manager Created', etc.
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means system/broadcast to admins
    user_type VARCHAR(50) NOT NULL, -- 'customer', 'vendor', 'admin', 'operational_manager'
    user_name VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Delivered' NOT NULL, -- Delivered, Read
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create Timelines Table
CREATE TABLE IF NOT EXISTS public.timelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_internal BOOLEAN DEFAULT TRUE NOT NULL, -- TRUE: Admin & OM only, FALSE: visible to Customer as well
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Add updated_at trigger helper for operational_managers & event_assignments
CREATE TRIGGER set_operational_managers_updated_at
    BEFORE UPDATE ON public.operational_managers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_event_assignments_updated_at
    BEFORE UPDATE ON public.event_assignments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.operational_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timelines ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies

-- A. Operational Managers Policies
CREATE POLICY "Allow authenticated read of OMs"
    ON public.operational_managers FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins full access to OMs"
    ON public.operational_managers FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- B. Event Assignments Policies
CREATE POLICY "Allow admins full access to Event Assignments"
    ON public.event_assignments FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Allow OMs to read their assigned event assignments"
    ON public.event_assignments FOR SELECT
    USING (assigned_operational_manager_id = auth.uid());

CREATE POLICY "Allow OMs to update status on their assigned assignments"
    ON public.event_assignments FOR UPDATE
    USING (assigned_operational_manager_id = auth.uid())
    WITH CHECK (assigned_operational_manager_id = auth.uid());

-- C. Audit Logs Policies (Admins read-only, trigger/actions insert)
CREATE POLICY "Allow admins to read audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow authenticated to write audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- D. Notifications Policies
CREATE POLICY "Allow users to read their own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow authenticated to insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update status on their notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
    WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- E. Timelines Policies
CREATE POLICY "Allow public/customer read-only of non-internal timelines"
    ON public.timelines FOR SELECT
    USING (
        is_internal = FALSE 
        OR public.is_admin(auth.uid()) 
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.event_id = public.timelines.event_id AND ea.assigned_operational_manager_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins full access to timelines"
    ON public.timelines FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
