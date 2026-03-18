
-- Create storage bucket for course file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-files', 'course-files', false);

-- Allow anyone to upload files (no auth required for this app)
CREATE POLICY "Allow public uploads to course-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-files');

-- Allow service role to read files (edge functions)
CREATE POLICY "Allow public reads from course-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-files');

-- Allow deletion of processed files
CREATE POLICY "Allow public deletes from course-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-files');
