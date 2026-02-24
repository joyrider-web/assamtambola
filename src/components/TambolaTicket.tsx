import { Ticket } from '@/hooks/useGameStore';

interface TambolaTicketProps {
  ticket: Ticket;
  drawnNumbers: number[];
  playerName: string;
  compact?: boolean;
}

export function TambolaTicket({ ticket, drawnNumbers, playerName, compact = false }: TambolaTicketProps) {
  const grid = ticket.numbers;

  return (
    <div className={`tambola-ticket p-3 ${compact ? 'text-xs' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gold font-body font-semibold text-xs truncate max-w-[120px]">{playerName}</span>
        <span className="text-muted-foreground text-xs">T{ticket.ticket_number}</span>
      </div>
      <div className="space-y-1">
        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-9 gap-0.5">
            {row.map((cell, ci) => {
              if (cell === null) {
                return (
                  <div
                    key={ci}
                    className="number-cell"
                    style={{ background: 'hsl(20 15% 8%)' }}
                  />
                );
              }
              const isCalled = drawnNumbers.includes(cell);
              return (
                <div
                  key={ci}
                  className={`number-cell ${isCalled ? 'number-called animate-bounce-in' : 'number-uncalled'} ${compact ? 'w-7 h-7 text-xs' : ''}`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
