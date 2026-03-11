import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/supabase-helpers';

interface StatusBarProps {
  gameTime: string;
  sessionStatus?: string;
}

export function StatusBar({ gameTime, sessionStatus }: StatusBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const isActive = sessionStatus === 'active';
  const elapsed = isActive
    ? `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    : '0:0:0';

  const boxes = [
    { label: 'Date', value: dateStr },
    { label: 'Timer', value: elapsed },
    { label: 'Game Time', value: formatTime(gameTime) },
  ];

  return (
    <div className="flex items-center justify-center gap-3 py-3 px-4">
      {boxes.map((box) => (
        <div
          key={box.label}
          className="flex-1 max-w-[120px] rounded-lg px-2 py-2.5 text-center glow-interactive"
          style={{
            background: 'hsl(220 60% 18%)',
            border: '1.5px solid hsl(45 100% 50%)',
          }}
        >
          <p className="text-[9px] uppercase tracking-wider font-body" style={{ color: 'hsl(45 100% 50%)' }}>
            {box.label}
          </p>
          <p className="text-white font-bold text-xs font-body mt-0.5">{box.value}</p>
        </div>
      ))}
    </div>
  );
}
