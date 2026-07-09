-- ============================================================================
-- SAI EVENTS - Operations Module Migration
-- Target: Supabase PostgreSQL (SQL Editor)
-- Purpose: Add all OM-specific tables required by the Operational Manager
--          Event Execution Center workspace.
-- Run AFTER: migration_milestone_2.sql, migration_vendor_module.sql
-- ============================================================================

-- 1. OM Checklist Items Table
--    Per-assignment interactive checklist tracking execution progress.
CREATE TABLE IF NOT EXISTS public.om_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.event_assignments(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_om_checklist_assignment ON public.om_checklist_items(assignment_id);

-- 2. OM Internal Notes Table
--    Private notes per assignment — never visible to customers.
CREATE TABLE IF NOT EXISTS public.om_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.event_assignments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_om_notes_assignment ON public.om_notes(assignment_id);

-- 3. OM Completion Reports Table
--    Post-execution report submitted by OM, reviewed by Admin.
CREATE TABLE IF NOT EXISTS public.om_completion_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.event_assignments(id) ON DELETE CASCADE UNIQUE,
    executive_summary TEXT NOT NULL,
    execution_notes TEXT,
    issues_faced TEXT,
    vendor_performance TEXT,
    customer_satisfaction INTEGER DEFAULT 5,
    lessons_learned TEXT,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_satisfaction_range CHECK (customer_satisfaction BETWEEN 1 AND 10)
);

-- 4. OM Vendor Coordination Table
--    Tracks OM's coordination status and notes per vendor assignment.
--    OMs cannot approve or assign vendors — only track coordination.
CREATE TABLE IF NOT EXISTS public.om_vendor_coordination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.event_assignments(id) ON DELETE CASCADE,
    vendor_assignment_id UUID NOT NULL REFERENCES public.vendor_assignments(id) ON DELETE CASCADE,
    arrival_status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
    coordination_note TEXT,
    last_contacted TIMESTAMPTZ,
    noted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (assignment_id, vendor_assignment_id),
    CONSTRAINT check_om_arrival_status CHECK (arrival_status IN ('Pending', 'Confirmed', 'In Transit', 'Arrived', 'Late', 'No Show'))
);

CREATE INDEX IF NOT EXISTS idx_om_vendor_coord_assignment ON public.om_vendor_coordination(assignment_id);

-- 5. Auto-update updated_at for vendor coordination
DROP TRIGGER IF EXISTS set_om_vendor_coordination_updated_at ON public.om_vendor_coordination;
CREATE TRIGGER set_om_vendor_coordination_updated_at
    BEFORE UPDATE ON public.om_vendor_coordination
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. Enable Row Level Security
-- ============================================================================
ALTER TABLE public.om_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.om_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.om_completion_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.om_vendor_coordination ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS Policies
-- ============================================================================

-- A. om_checklist_items — OM manages only their own assignment checklists
DROP POLICY IF EXISTS "Allow OMs and admins to manage checklist items" ON public.om_checklist_items;
CREATE POLICY "Allow OMs and admins to manage checklist items"
    ON public.om_checklist_items FOR ALL
    USING (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    );

-- B. om_notes — strictly internal, OM + admin only
DROP POLICY IF EXISTS "Allow OMs and admins to manage notes" ON public.om_notes;
CREATE POLICY "Allow OMs and admins to manage notes"
    ON public.om_notes FOR ALL
    USING (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    );

-- C. om_completion_reports — OM submits, admin reads
DROP POLICY IF EXISTS "Allow OMs and admins to manage completion reports" ON public.om_completion_reports;
CREATE POLICY "Allow OMs and admins to manage completion reports"
    ON public.om_completion_reports FOR ALL
    USING (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    );

-- D. om_vendor_coordination — OM logs coordination, admin reads all
DROP POLICY IF EXISTS "Allow OMs and admins to manage vendor coordination" ON public.om_vendor_coordination;
CREATE POLICY "Allow OMs and admins to manage vendor coordination"
    ON public.om_vendor_coordination FOR ALL
    USING (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.id = assignment_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    );

-- ============================================================================
-- 8. Timeline INSERT policy for OMs
--    Existing migration_milestone_2.sql only gives admin full access to timelines.
--    OMs must be able to insert milestones for their events.
-- ============================================================================
DROP POLICY IF EXISTS "Allow OMs to insert timeline entries for their events" ON public.timelines;
CREATE POLICY "Allow OMs to insert timeline entries for their events"
    ON public.timelines FOR INSERT
    WITH CHECK (
        public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.event_id = public.timelines.event_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    );

-- ============================================================================
-- 9. Storage bucket for OM document uploads
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('om-uploads', 'om-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow OMs to upload to om-uploads" ON storage.objects;
CREATE POLICY "Allow OMs to upload to om-uploads"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'om-uploads'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role = 'operational_manager'
        )
    );

DROP POLICY IF EXISTS "Allow public read from om-uploads" ON storage.objects;
CREATE POLICY "Allow public read from om-uploads"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'om-uploads');

DROP POLICY IF EXISTS "Allow OMs and admins to delete from om-uploads" ON storage.objects;
CREATE POLICY "Allow OMs and admins to delete from om-uploads"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'om-uploads'
        AND (
            public.is_admin(auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                  AND role = 'operational_manager'
            )
        )
    );

-- ============================================================================
-- 10. Allow OMs to read vendor_assignments for their events (coordination view)
-- ============================================================================
DROP POLICY IF EXISTS "Allow OMs to read vendor assignments for their events" ON public.vendor_assignments;
CREATE POLICY "Allow OMs to read vendor assignments for their events"
    ON public.vendor_assignments FOR SELECT
    USING (
        vendor_id = auth.uid()
        OR public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.event_id = public.vendor_assignments.request_id
              AND ea.assigned_operational_manager_id = auth.uid()
        )
    );
