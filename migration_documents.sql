-- Milestone 2: Customer Documents Table Migration
-- Target: Supabase PostgreSQL
-- Description: Creates documents table for customer planning studio file attachments

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.event_requests(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'inspiration', 'reference', 'venue', 'quotation', 'agreement', 'summary'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Select Policies
CREATE POLICY "Allow customers/admins/assigned-OMs to select documents"
    ON public.documents FOR SELECT
    USING (
        uploaded_by = auth.uid()
        OR public.is_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.event_requests er
            WHERE er.id = public.documents.event_id AND er.customer_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.event_assignments ea
            WHERE ea.event_id = public.documents.event_id AND ea.assigned_operational_manager_id = auth.uid()
        )
    );

-- Insert Policies
CREATE POLICY "Allow authenticated to insert documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Delete Policies
CREATE POLICY "Allow users to delete their own documents"
    ON public.documents FOR DELETE
    USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));
