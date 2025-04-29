-- Add location column to posts table
ALTER TABLE public.posts
ADD COLUMN location TEXT;

-- Update existing posts with null location
UPDATE public.posts
SET location = NULL
WHERE location IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.posts.location IS 'The location associated with the post'; 