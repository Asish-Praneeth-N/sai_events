-- ============================================================================
-- SAI EVENTS - Customer Media Studio & Supabase Storage Bucket Migration
-- Target: Supabase PostgreSQL & Storage Engine (Run in Supabase SQL Editor)
-- Purpose: Setup customer_media_folders, customer_media_items tables, 
--          extend event_requests schema for reference images and additional contacts,
--          and configure Supabase Storage bucket 'customer-media' with RLS policies.
-- ============================================================================

-- 1. Extend Event Requests Table for Reference Images & Additional Contacts
ALTER TABLE public.event_requests
ADD COLUMN IF NOT EXISTS reference_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS additional_contacts JSONB DEFAULT '[]'::jsonb;

-- 2. Create Customer Media Folders Table
CREATE TABLE IF NOT EXISTS public.customer_media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100) DEFAULT 'Folder',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for customer folder lookups
CREATE INDEX IF NOT EXISTS idx_customer_media_folders_customer 
ON public.customer_media_folders(customer_id);

-- 3. Create Customer Media Items Table
CREATE TABLE IF NOT EXISTS public.customer_media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.customer_media_folders(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(100) DEFAULT 'image',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for media items lookups by customer and folder
CREATE INDEX IF NOT EXISTS idx_customer_media_items_customer 
ON public.customer_media_items(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_media_items_folder 
ON public.customer_media_items(folder_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.customer_media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_media_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Folders
DROP POLICY IF EXISTS "Customers can view their own media folders" ON public.customer_media_folders;
CREATE POLICY "Customers can view their own media folders"
ON public.customer_media_folders FOR SELECT
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can create their own media folders" ON public.customer_media_folders;
CREATE POLICY "Customers can create their own media folders"
ON public.customer_media_folders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update their own media folders" ON public.customer_media_folders;
CREATE POLICY "Customers can update their own media folders"
ON public.customer_media_folders FOR UPDATE
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can delete their own media folders" ON public.customer_media_folders;
CREATE POLICY "Customers can delete their own media folders"
ON public.customer_media_folders FOR DELETE
USING (auth.uid() = customer_id);

-- RLS Policies for Media Items
DROP POLICY IF EXISTS "Customers can view their own media items" ON public.customer_media_items;
CREATE POLICY "Customers can view their own media items"
ON public.customer_media_items FOR SELECT
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can view customer media items" ON public.customer_media_items;
CREATE POLICY "Admins can view customer media items"
ON public.customer_media_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (LOWER(profiles.role) = 'admin')
  )
);

DROP POLICY IF EXISTS "Customers can create their own media items" ON public.customer_media_items;
CREATE POLICY "Customers can create their own media items"
ON public.customer_media_items FOR INSERT
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update their own media items" ON public.customer_media_items;
CREATE POLICY "Customers can update their own media items"
ON public.customer_media_items FOR UPDATE
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can delete their own media items" ON public.customer_media_items;
CREATE POLICY "Customers can delete their own media items"
ON public.customer_media_items FOR DELETE
USING (auth.uid() = customer_id);

-- 5. Supabase Storage Bucket Setup for 'customer-media'
-- Create public bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-media', 'customer-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Security Policies for 'customer-media' Bucket
DROP POLICY IF EXISTS "Public access to customer media" ON storage.objects;
CREATE POLICY "Public access to customer media"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-media');

DROP POLICY IF EXISTS "Authenticated users can upload customer media" ON storage.objects;
CREATE POLICY "Authenticated users can upload customer media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'customer-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their uploaded customer media" ON storage.objects;
CREATE POLICY "Users can update their uploaded customer media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'customer-media' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete their uploaded customer media" ON storage.objects;
CREATE POLICY "Users can delete their uploaded customer media"
ON storage.objects FOR DELETE
USING (bucket_id = 'customer-media' AND auth.uid() = owner);

-- 6. Cleanup Legacy Documents Table (Removed from customer workflow)
DROP TABLE IF EXISTS public.documents CASCADE;
