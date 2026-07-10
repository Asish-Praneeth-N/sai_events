-- ============================================================================
-- SAI EVENTS - Milestone 2 Update: Operational Manager Activation & Lock Columns
-- Run in Supabase SQL Editor
-- ============================================================================

-- Add the requires_password_change column to operational_managers table
ALTER TABLE public.operational_managers 
    ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT TRUE NOT NULL;
