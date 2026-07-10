-- ============================================================================
-- SAI EVENTS - Milestone 2 Update: Operational Manager Activation & Lock Columns
-- Run in Supabase SQL Editor
-- ============================================================================

-- Add the requires_password_change column to operational_managers table
ALTER TABLE public.operational_managers 
    ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT TRUE NOT NULL;

-- Allow OMs to update their own status and flags (e.g. requires_password_change, availability_status)
DROP POLICY IF EXISTS "Allow OMs to update their own record" ON public.operational_managers;
CREATE POLICY "Allow OMs to update their own record"
    ON public.operational_managers FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
