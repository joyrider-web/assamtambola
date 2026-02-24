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
      <div className="flex items-center justify-between mb-2 rounded-t-md px-2 py-1 -mx-3 -mt-3"
        style={{ background: 'hsl(var(--primary))' }}>
        <span className="text-primary-foreground font-body font-semibold text-xs truncate max-w-[120px]">{playerName}</span>
        <span className="text-primary-foreground/80 text-xs font-bold">T{ticket.ticket_number}</span>
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
                    style={{ background: 'hsl(0 0% 97%)' }}
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
