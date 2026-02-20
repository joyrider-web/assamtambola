
-- Enable realtime
-- Create game_sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_time TIME NOT NULL DEFAULT '21:30:00',
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  current_number INT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table (each player can have 1-3 tickets)
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  ticket_number INT NOT NULL DEFAULT 1,
  numbers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drawn_numbers table
CREATE TABLE public.drawn_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  number INT NOT NULL,
  drawn_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default game time
INSERT INTO public.admin_settings (key, value) VALUES ('default_game_time', '21:30');
INSERT INTO public.admin_settings (key, value) VALUES ('game_active', 'false');

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawn_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies (everyone can see everything)
CREATE POLICY "Anyone can view game sessions" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can view tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Anyone can view drawn numbers" ON public.drawn_numbers FOR SELECT USING (true);
CREATE POLICY "Anyone can view admin settings" ON public.admin_settings FOR SELECT USING (true);

-- Admin write policies (only authenticated users - the admin)
CREATE POLICY "Admin can insert game sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update game sessions" ON public.game_sessions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete game sessions" ON public.game_sessions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert players" ON public.players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update players" ON public.players FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete players" ON public.players FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert tickets" ON public.tickets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update tickets" ON public.tickets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete tickets" ON public.tickets FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert drawn numbers" ON public.drawn_numbers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete drawn numbers" ON public.drawn_numbers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can update admin settings" ON public.admin_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable realtime for live game sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawn_numbers;

-- Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON public.game_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
