import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Player {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface Ticket {
  id: string;
  player_id: string;
  ticket_number: number;
  numbers: (number | null)[][];
}

export interface GameSession {
  id: string;
  scheduled_time: string;
  scheduled_date: string;
  status: 'waiting' | 'active' | 'completed';
  current_number: number | null;
}

export function useGameStore() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [gameTime, setGameTime] = useState('21:30');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [playersRes, ticketsRes, sessionRes, settingsRes] = await Promise.all([
      supabase.from('players').select('*').eq('is_active', true).order('display_order'),
      supabase.from('tickets').select('*'),
      supabase.from('game_sessions').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('admin_settings').select('*').eq('key', 'default_game_time').maybeSingle(),
    ]);

    if (playersRes.data) setPlayers(playersRes.data);
    if (ticketsRes.data) {
      setTickets(ticketsRes.data.map(t => ({
        ...t,
        numbers: t.numbers as (number | null)[][],
      })));
    }
    if (sessionRes.data) {
      setSession(sessionRes.data as GameSession);
      // Fetch drawn numbers for current session
      const drawnRes = await supabase
        .from('drawn_numbers')
        .select('number')
        .eq('session_id', sessionRes.data.id)
        .order('drawn_at');
      if (drawnRes.data) setDrawnNumbers(drawnRes.data.map(d => d.number));
    }
    if (settingsRes.data) setGameTime(settingsRes.data.value);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    // Realtime subscriptions
    const channel = supabase
      .channel('game-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drawn_numbers' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_settings' }, () => fetchAll())
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Fallback polling every 5 seconds in case realtime misses events
    const pollInterval = setInterval(() => {
      fetchAll();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  return { players, tickets, session, drawnNumbers, gameTime, loading, refetch: fetchAll };
}
