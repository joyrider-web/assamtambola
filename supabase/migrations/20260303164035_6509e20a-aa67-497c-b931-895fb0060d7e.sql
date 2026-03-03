
CREATE TABLE public.winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  prize_type text NOT NULL CHECK (prize_type IN ('first_full_house', 'full_sheet_bonus_2', 'full_sheet_bonus_3')),
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (session_id, prize_type)
);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view winners" ON public.winners FOR SELECT USING (true);
CREATE POLICY "Admin can insert winners" ON public.winners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update winners" ON public.winners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete winners" ON public.winners FOR DELETE USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE public.winners;
