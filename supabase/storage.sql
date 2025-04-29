-- Create a bucket for Instagram images
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram', 'instagram', true);

-- Set up security policies for the instagram bucket
CREATE POLICY "Anyone can view Instagram images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'instagram');

CREATE POLICY "Authenticated users can upload Instagram images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'instagram' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own Instagram images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'instagram' AND 
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own Instagram images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'instagram' AND 
  auth.uid() = owner
); 