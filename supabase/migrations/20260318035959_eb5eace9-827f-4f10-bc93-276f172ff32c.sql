
CREATE TABLE public.processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'processing',
  progress int NOT NULL DEFAULT 0,
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on processing_jobs"
ON public.processing_jobs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on processing_jobs"
ON public.processing_jobs FOR SELECT USING (true);

CREATE POLICY "Allow public update on processing_jobs"
ON public.processing_jobs FOR UPDATE USING (true);
