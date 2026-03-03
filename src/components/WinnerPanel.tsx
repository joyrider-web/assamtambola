import { supabase } from '@/integrations/supabase/client';
import { Player, Ticket } from '@/hooks/useGameStore';
import { Winner, DetectedWinner, detectFullHouseWinners } from '@/hooks/useWinnerDetection';
import { announceWinner } from '@/hooks/useVoiceAnnouncer';
import { Button } from '@/components/ui/button';
import { Trophy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface WinnerPanelProps {
  sessionId: string;
  players: Player[];
  tickets: Ticket[];
  drawnNumbers: number[];
  winners: Winner[];
  onRefetch: () => void;
  isAdmin?: boolean;
}

const PRIZE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  first_full_house: { label: '1st Full House', emoji: '🏆', color: 'text-yellow-400' },
  full_sheet_bonus_2: { label: '2nd Full Sheet Bonus', emoji: '🥈', color: 'text-gray-300' },
  full_sheet_bonus_3: { label: '3rd Full Sheet Bonus', emoji: '🥉', color: 'text-amber-600' },
};

export function WinnerPanel({ sessionId, players, tickets, drawnNumbers, winners, onRefetch, isAdmin }: WinnerPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const detected = detectFullHouseWinners(players, tickets, drawnNumbers, winners);

  const confirmWinner = async (d: DetectedWinner) => {
    setLoading(d.prizeType);
    await supabase.from('winners').insert({
      session_id: sessionId,
      player_id: d.player.id,
      ticket_id: d.ticket.id,
      prize_type: d.prizeType,
      confirmed: true,
    });
    announceWinner(d.player.name, d.prizeType);
    onRefetch();
    setLoading(null);
  };

  const confirmedWinners = winners.filter(w => w.confirmed);
  const hasAny = detected.length > 0 || confirmedWinners.length > 0;

  if (!hasAny) return null;

  return (
    <div className="gradient-card border gold-border rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-gold" />
        <h2 className="font-display text-lg text-gold">Winners</h2>
      </div>

      {/* Confirmed winners */}
      {confirmedWinners.map(w => {
        const player = players.find(p => p.id === w.player_id);
        const info = PRIZE_LABELS[w.prize_type] || { label: w.prize_type, emoji: '🎉', color: 'text-gold' };
        return (
          <div key={w.id} className="flex items-center gap-3 bg-green-900/20 border border-green-700/50 rounded-lg px-4 py-3 mb-2">
            <span className="text-2xl">{info.emoji}</span>
            <div className="flex-1">
              <p className={`font-display text-sm ${info.color}`}>{info.label}</p>
              <p className="text-foreground font-semibold">{player?.name || 'Unknown'}</p>
            </div>
            <Check className="w-5 h-5 text-green-400" />
          </div>
        );
      })}

      {/* Detected but unconfirmed (admin only) */}
      {isAdmin && detected.map(d => {
        const info = PRIZE_LABELS[d.prizeType];
        return (
          <div key={d.prizeType} className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-3 mb-2 animate-pulse-gold">
            <span className="text-2xl">{info.emoji}</span>
            <div className="flex-1">
              <p className={`font-display text-sm ${info.color}`}>{info.label} — Detected!</p>
              <p className="text-foreground font-semibold">{d.player.name}</p>
            </div>
            <Button
              onClick={() => confirmWinner(d)}
              disabled={loading === d.prizeType}
              size="sm"
              style={{ background: 'var(--gradient-gold)', color: 'hsl(20 40% 10%)' }}
              className="gap-1 font-bold"
            >
              {loading === d.prizeType ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Confirm
            </Button>
          </div>
        );
      })}
    </div>
  );
}
