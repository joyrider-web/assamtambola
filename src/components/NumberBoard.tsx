interface NumberBoardProps {
  drawnNumbers: number[];
  currentNumber?: number | null;
}

export function NumberBoard({ drawnNumbers, currentNumber }: NumberBoardProps) {
  const rows = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
    [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
    [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
  ];

  return (
    <div className="gradient-card rounded-xl gold-border p-3 shadow-card">
      <div className="space-y-1">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-10 gap-1">
            {row.map(num => {
              const isCalled = drawnNumbers.includes(num);
              const isCurrent = currentNumber === num;
              return (
                <div
                  key={num}
                  className={`
                    flex items-center justify-center rounded text-xs font-bold w-full aspect-square transition-all duration-300
                    ${isCurrent ? 'number-called animate-pulse-gold scale-110 z-10 relative' : isCalled ? 'number-called' : 'number-uncalled'}
                  `}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 justify-center text-xs text-muted-foreground font-body">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: 'var(--gradient-number-called)' }} />
          Called ({drawnNumbers.length})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-muted" />
          Remaining ({90 - drawnNumbers.length})
        </span>
      </div>
    </div>
  );
}
