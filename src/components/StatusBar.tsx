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

  // Calculate countdown to game time
  const getCountdown = () => {
    if (isActive) return 'LIVE';
    const [h, m] = gameTime.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const countdown = getCountdown();

  const boxes = [
    { label: 'Date', value: dateStr },
    { label: 'Timer', value: countdown },
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
