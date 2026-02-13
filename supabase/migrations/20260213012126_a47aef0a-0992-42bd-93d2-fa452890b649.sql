
-- Table to track all donations and trees planted
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  donor_name TEXT DEFAULT 'Anonymous',
  amount_cents INTEGER NOT NULL DEFAULT 100,
  trees_planted INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Anyone can read donations (public tracker)
CREATE POLICY "Donations are publicly readable"
  ON public.donations FOR SELECT
  USING (true);

-- Only service role can insert (via edge function)
-- No insert policy for anon/authenticated = only backend can insert

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
