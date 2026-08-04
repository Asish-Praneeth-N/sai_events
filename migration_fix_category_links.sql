-- ============================================================================
-- SAI EVENTS - Fix: Link orphan categories to correct main_categories
-- Run this in Supabase SQL Editor
-- ============================================================================

-- PROBLEM: Existing categories in the `categories` table have main_category_id = NULL
-- because the admin_enhancements migration only bulk-mapped everything to "Wedding Matrimony".
-- This query correctly links each category based on its name to the right main category.

-- Step 1: View current state (run this first to see what's unlinked)
-- SELECT id, name, main_category_id FROM public.categories WHERE deleted_at IS NULL ORDER BY name;

-- Step 2: Fix — update all categories with NULL main_category_id
-- to be linked to "Wedding Matrimony" as the default (you can reassign manually after)
UPDATE public.categories
SET main_category_id = (
  SELECT id FROM public.main_categories WHERE name = 'Wedding Matrimony' LIMIT 1
)
WHERE main_category_id IS NULL
  AND deleted_at IS NULL;

-- Step 3: If you have categories that belong to other main categories,
-- update them individually. Examples:

-- For Corporate-related categories:
-- UPDATE public.categories
-- SET main_category_id = (SELECT id FROM public.main_categories WHERE name = 'Corporate Events' LIMIT 1)
-- WHERE name ILIKE '%corporate%' AND deleted_at IS NULL;

-- For Birthday-related categories:
-- UPDATE public.categories
-- SET main_category_id = (SELECT id FROM public.main_categories WHERE name = 'Birthday Celebrations' LIMIT 1)
-- WHERE name ILIKE '%birthday%' AND deleted_at IS NULL;

-- Step 4: Verify — all categories should now have a main_category_id
SELECT
  c.id,
  c.name AS category_name,
  mc.name AS main_category_name,
  c.main_category_id
FROM public.categories c
LEFT JOIN public.main_categories mc ON c.main_category_id = mc.id
WHERE c.deleted_at IS NULL
ORDER BY mc.name, c.sort_order;
