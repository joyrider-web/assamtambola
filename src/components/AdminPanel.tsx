import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, Ticket, GameSession } from '@/hooks/useGameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateSimpleTicket } from '@/lib/supabase-helpers';
import {
  Users, Clock, Play, Square, Plus, Edit2, Trash2,
  RotateCcw, ChevronDown, Hash, LogOut, Loader2, Check, X
} from 'lucide-react';
import { formatTime } from '@/lib/supabase-helpers';

interface AdminPanelProps {
  players: Player[];
  tickets: Ticket[];
  session: GameSession | null;
  drawnNumbers: number[];
  gameTime: string;
  onLogout: () => void;
  onRefetch: () => void;
}

export function AdminPanel({
  players, tickets, session, drawnNumbers, gameTime, onLogout, onRefetch
}: AdminPanelProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newGameTime, setNewGameTime] = useState(gameTime);
  const [loading, setLoading] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState(1);

  const addPlayer = async () => {
    if (!newPlayerName.trim()) return;
    setLoading('addPlayer');
    const order = players.length;
    const { data: playerData, error } = await supabase
      .from('players')
      .insert({ name: newPlayerName.trim(), display_order: order })
      .select()
      .single();

    if (!error && playerData) {
      // Generate tickets for the player
      for (let i = 1; i <= ticketCount; i++) {
        const ticketGrid = generateSimpleTicket();
        await supabase.from('tickets').insert({
          player_id: playerData.id,
          ticket_number: i,
          numbers: ticketGrid as unknown as never,
        });
      }
      setNewPlayerName('');
      setTicketCount(1);
      onRefetch();
    }
    setLoading(null);
  };

  const updatePlayerName = async (playerId: string) => {
    if (!editName.trim()) return;
    setLoading('editPlayer');
    await supabase.from('players').update({ name: editName.trim() }).eq('id', playerId);
    setEditingPlayer(null);
    setEditName('');
    onRefetch();
    setLoading(null);
  };

  const removePlayer = async (playerId: string) => {
    setLoading('remove-' + playerId);
    await supabase.from('players').delete().eq('id', playerId);
    onRefetch();
    setLoading(null);
  };

  const updateGameTime = async () => {
    setLoading('time');
    await supabase.from('admin_settings').update({ value: newGameTime }).eq('key', 'default_game_time');
    onRefetch();
    setLoading(null);
  };

  const startGame = async () => {
    setLoading('start');
    if (session && session.status === 'waiting') {
      await supabase.from('game_sessions').update({ status: 'active' }).eq('id', session.id);
    } else {
      await supabase.from('game_sessions').insert({
        scheduled_time: newGameTime + ':00',
        scheduled_date: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
    onRefetch();
    setLoading(null);
  };

  const drawNumber = async () => {
    if (!session) return;
    setLoading('draw');
    const remaining = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawnNumbers.includes(n));
    if (remaining.length === 0) return;
    const num = remaining[Math.floor(Math.random() * remaining.length)];
    await supabase.from('drawn_numbers').insert({ session_id: session.id, number: num });
    await supabase.from('game_sessions').update({ current_number: num }).eq('id', session.id);
    onRefetch();
    setLoading(null);
  };

  const endGame = async () => {
    if (!session) return;
    setLoading('end');
    await supabase.from('game_sessions').update({ status: 'completed' }).eq('id', session.id);
    onRefetch();
    setLoading(null);
  };

  const resetGame = async () => {
    if (!session) return;
    setLoading('reset');
    await supabase.from('drawn_numbers').delete().eq('session_id', session.id);
    await supabase.from('game_sessions').update({ status: 'waiting', current_number: null }).eq('id', session.id);
    onRefetch();
    setLoading(null);
  };

  const isActive = session?.status === 'active';
  const isWaiting = !session || session.status === 'waiting' || session.status === 'completed';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-gold glow-text">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">ASSAM TAMBOLA Control</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-muted-foreground hover:text-foreground gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Game Time */}
          <div className="gradient-card border gold-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg text-gold">Game Time</h2>
            </div>
            <div className="flex gap-2">
              <Input
                type="time"
                value={newGameTime}
                onChange={e => setNewGameTime(e.target.value)}
                className="bg-input border-border text-foreground flex-1"
              />
              <Button
                onClick={updateGameTime}
                disabled={loading === 'time'}
                className="px-3"
                style={{ background: 'var(--gradient-gold)', color: 'hsl(20 40% 10%)' }}
              >
                {loading === 'time' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs mt-2">Current: {formatTime(gameTime)}</p>
          </div>

          {/* Game Status */}
          <div className="gradient-card border gold-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg text-gold">Game Control</h2>
            </div>

            <div className="space-y-3">
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-green-900/50 text-green-400 border border-green-700' :
                  session?.status === 'completed' ? 'bg-gray-800 text-gray-400 border border-gray-700' :
                  'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                }`}>
                  {isActive ? '🟢 LIVE' : session?.status === 'completed' ? '✅ Done' : '🟡 Waiting'}
                </span>
              </div>

              {isActive && (
                <div className="gradient-card rounded-lg p-3 text-center border gold-border">
                  <p className="text-muted-foreground text-xs mb-1">Last Number</p>
                  <p className="font-display text-4xl text-gold glow-text font-bold">
                    {session?.current_number || '—'}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">{drawnNumbers.length}/90 drawn</p>
                </div>
              )}

              <div className="space-y-2">
                {isWaiting && (
                  <Button
                    onClick={startGame}
                    disabled={loading === 'start'}
                    className="w-full gap-2 py-5"
                    style={{ background: 'var(--gradient-gold)', color: 'hsl(20 40% 10%)' }}
                  >
                    {loading === 'start' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Start Game
                  </Button>
                )}

                {isActive && (
                  <>
                    <Button
                      onClick={drawNumber}
                      disabled={loading === 'draw' || drawnNumbers.length >= 90}
                      className="w-full gap-2 py-5 text-base font-bold"
                      style={{ background: 'hsl(var(--crimson))', color: 'white' }}
                    >
                      {loading === 'draw' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                      Draw Next Number
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={resetGame} variant="outline" className="flex-1 gap-1 border-border text-muted-foreground text-xs">
                        <RotateCcw className="w-3 h-3" /> Reset
                      </Button>
                      <Button onClick={endGame} variant="outline" className="flex-1 gap-1 border-border text-muted-foreground text-xs">
                        <Square className="w-3 h-3" /> End
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player Management */}
        <div className="lg:col-span-2">
          <div className="gradient-card border gold-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg text-gold">Players ({players.length}/250)</h2>
            </div>

            {/* Add Player */}
            <div className="flex gap-2 mb-5 flex-wrap">
              <Input
                placeholder="Player name..."
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
                className="bg-input border-border text-foreground flex-1 min-w-[150px]"
              />
              <select
                value={ticketCount}
                onChange={e => setTicketCount(Number(e.target.value))}
                className="bg-input border border-border text-foreground rounded-md px-3 text-sm"
              >
                <option value={1}>1 Ticket</option>
                <option value={2}>2 Tickets</option>
                <option value={3}>3 Tickets</option>
              </select>
              <Button
                onClick={addPlayer}
                disabled={loading === 'addPlayer' || !newPlayerName.trim() || players.length >= 250}
                style={{ background: 'var(--gradient-gold)', color: 'hsl(20 40% 10%)' }}
                className="gap-2 font-semibold"
              >
                {loading === 'addPlayer' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </Button>
            </div>

            {/* Players List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {players.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No players yet. Add some above!</p>
                </div>
              ) : (
                players.map((player, idx) => {
                  const playerTickets = tickets.filter(t => t.player_id === player.id);
                  return (
                    <div key={player.id} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2 border border-border/50 animate-slide-up">
                      <span className="text-gold font-bold text-sm w-6 text-right shrink-0">{idx + 1}.</span>
                      {editingPlayer === player.id ? (
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') updatePlayerName(player.id);
                            if (e.key === 'Escape') setEditingPlayer(null);
                          }}
                          className="bg-input border-border text-foreground h-8 text-sm flex-1"
                          autoFocus
                        />
                      ) : (
                        <span className="text-foreground text-sm flex-1">{player.name}</span>
                      )}
                      <span className="text-muted-foreground text-xs shrink-0">{playerTickets.length}T</span>
                      <div className="flex gap-1 shrink-0">
                        {editingPlayer === player.id ? (
                          <>
                            <Button size="sm" variant="ghost" className="w-7 h-7 p-0 text-green-400 hover:text-green-300"
                              onClick={() => updatePlayerName(player.id)}>
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="w-7 h-7 p-0 text-muted-foreground"
                              onClick={() => setEditingPlayer(null)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" className="w-7 h-7 p-0 text-muted-foreground hover:text-gold"
                              onClick={() => { setEditingPlayer(player.id); setEditName(player.name); }}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="w-7 h-7 p-0 text-muted-foreground hover:text-crimson"
                              onClick={() => removePlayer(player.id)}
                              disabled={loading === 'remove-' + player.id}>
                              {loading === 'remove-' + player.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
