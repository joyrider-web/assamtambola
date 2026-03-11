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
    <div className="rounded-xl overflow-hidden" style={{ border: '2.5px solid hsl(120 55% 45%)', background: 'hsl(0 0% 100%)' }}>
      {/* Header */}
      <div className="flex items-center gap-0 px-0 py-0">
        {/* Number circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 -ml-1 z-10"
          style={{ background: 'hsl(120 40% 45%)' }}
        >
          {playerIndex}
        </div>
        {/* Status banner */}
        <div
          className="flex-1 py-2 px-3 text-sm font-bold text-white tracking-wide"
          style={{ background: 'hsl(120 40% 45%)' }}
        >
          {isBooked ? 'BOOKED' : 'UNSOLD'}
        </div>
        {/* Book button */}
        <button
          className="px-3 py-2 text-xs font-bold text-white shrink-0"
          style={{ background: 'hsl(120 40% 40%)' }}
        >
          {isBooked ? '✅ BOOKED' : 'BOOK THIS'}
        </button>
      </div>

      {/* Ticket grid */}
      <div className="p-1">
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
  );
}
