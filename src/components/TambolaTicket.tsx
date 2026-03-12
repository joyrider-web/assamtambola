import { Ticket } from '@/hooks/useGameStore';

interface TambolaTicketProps {
  ticket: Ticket;
  drawnNumbers: number[];
  playerName: string;
  playerIndex: number;
  isBooked: boolean;
  compact?: boolean;
}

export function TambolaTicket({ ticket, drawnNumbers, playerName, playerIndex, isBooked, compact = false }: TambolaTicketProps) {
  const grid = ticket.numbers;

  return (
    <div>
      {/* Header - above the ticket box */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-number"
          style={{ background: 'hsl(120 40% 45%)' }}
        >
          {playerIndex}
        </div>
        <span
          className="text-sm font-bold text-white truncate flex-1 px-2 py-0.5 rounded-md"
          style={{ background: isBooked ? 'hsl(120 40% 40%)' : 'hsl(280 50% 50%)' }}
        >
          {isBooked ? playerName : 'UNSOLD'}
        </span>
        <span
          className="px-2.5 py-1 text-[10px] font-bold text-white rounded-md shrink-0"
          style={{ background: isBooked ? 'hsl(120 40% 40%)' : 'hsl(280 50% 50%)' }}
        >
          {isBooked ? '✅ BOOKED' : 'BOOK THIS'}
        </span>
      </div>

      {/* Ticket grid */}
      <div className="rounded-xl overflow-hidden" style={{ border: '2px solid hsl(120 55% 45%)', background: 'hsl(0 0% 100%)' }}>
        <div className="p-0.5">
          {grid.map((row, ri) => (
            <div key={ri} className="grid grid-cols-9">
              {row.map((cell, ci) => {
                const isCalled = cell !== null && drawnNumbers.includes(cell);
                return (
                  <div
                    key={ci}
                    className={`flex items-center justify-center font-bold ${compact ? 'h-8 text-sm' : 'h-10 text-base'}`}
                    style={{
                      background: isCalled ? 'hsl(45 100% 70%)' : 'hsl(0 0% 100%)',
                      border: '0.5px solid hsl(0 0% 85%)',
                      color: 'hsl(0 0% 10%)',
                    }}
                  >
                    {cell ?? ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
