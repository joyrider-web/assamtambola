import { Player, Ticket } from '@/hooks/useGameStore';
import { ticketToFlat } from '@/lib/supabase-helpers';

export interface DetectedWinner {
  player: Player;
  ticket: Ticket;
  prizeType: 'first_full_house' | 'full_sheet_bonus_2' | 'full_sheet_bonus_3';
}

export interface Winner {
  id: string;
  session_id: string;
  player_id: string;
  ticket_id: string;
  prize_type: string;
  confirmed: boolean;
  created_at: string;
}

/**
 * Check which tickets have achieved full house (all 15 numbers drawn).
 * Returns tickets that qualify but haven't been awarded yet.
 */
export function detectFullHouseWinners(
  players: Player[],
  tickets: Ticket[],
  drawnNumbers: number[],
  existingWinners: Winner[]
): DetectedWinner[] {
  const drawnSet = new Set(drawnNumbers);
  const awardedPrizes = new Set(existingWinners.map(w => w.prize_type));
  const awardedTickets = new Set(existingWinners.map(w => w.ticket_id));

  // Find all tickets with full house
  const fullHouseTickets: { player: Player; ticket: Ticket }[] = [];

  for (const ticket of tickets) {
    if (awardedTickets.has(ticket.id)) continue;
    const nums = ticketToFlat(ticket.numbers);
    if (nums.length === 0) continue;
    const allCalled = nums.every(n => drawnSet.has(n));
    if (allCalled) {
      const player = players.find(p => p.id === ticket.player_id);
      if (player) fullHouseTickets.push({ player, ticket });
    }
  }

  if (fullHouseTickets.length === 0) return [];

  const result: DetectedWinner[] = [];

  // Assign prizes in order
  const prizeOrder: ('first_full_house' | 'full_sheet_bonus_2' | 'full_sheet_bonus_3')[] = [
    'first_full_house', 'full_sheet_bonus_2', 'full_sheet_bonus_3'
  ];

  for (const prize of prizeOrder) {
    if (awardedPrizes.has(prize)) continue;
    const candidate = fullHouseTickets.shift();
    if (!candidate) break;
    result.push({ ...candidate, prizeType: prize });
    awardedPrizes.add(prize);
  }

  return result;
}
