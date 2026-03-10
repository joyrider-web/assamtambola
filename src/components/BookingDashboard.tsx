import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Player } from '@/hooks/useGameStore';

interface BookingDashboardProps {
  players: Player[];
  onClose: () => void;
}

export function BookingDashboard({ players, onClose }: BookingDashboardProps) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelect = (idx: number) => {
    if (players[idx]?.is_booked) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleBook = () => {
    if (!name.trim()) { alert('Please enter your name'); return; }
    if (selected.size === 0) { alert('Please select at least one ticket'); return; }
    const ticketNos = Array.from(selected).sort((a, b) => a - b).map(i => i + 1).join(', ');
    const msg = encodeURIComponent(`Hi! I am ${name.trim()} and I want to book these tickets [${ticketNos}] for your upcoming tambola game`);
    window.open(`https://wa.me/918638979028?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm max-h-[90vh] overflow-auto rounded-xl border-2"
        style={{ background: '#1a5c2a', borderColor: 'hsl(var(--gold))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#0d3b18' }}>
          <h2 className="font-display text-lg text-white">Booking dashboard</h2>
          <button onClick={onClose} className="text-white hover:text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Name input */}
          <div>
            <label className="text-white text-sm font-body mb-1 block">Your name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-6 gap-1">
            {players.map((player, idx) => {
              const isBooked = player.is_booked;
              const isSelected = selected.has(idx);
              let bg = 'white'; // available
              let textColor = '#000';
              if (isBooked) { bg = '#facc15'; textColor = '#000'; }
              if (isSelected) { bg = '#3b82f6'; textColor = '#fff'; }

              return (
                <button
                  key={player.id}
                  onClick={() => toggleSelect(idx)}
                  disabled={isBooked}
                  className="relative aspect-square flex items-center justify-center rounded text-xs font-bold transition-all border"
                  style={{
                    background: bg,
                    color: textColor,
                    borderColor: '#d946ef',
                    cursor: isBooked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {idx + 1}
                  {isSelected && (
                    <Check className="absolute w-3 h-3 top-0.5 right-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-xs text-white/80 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#facc15' }} /> Booked</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white" /> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#3b82f6' }} /> Selected</span>
          </div>

          {/* Book button */}
          <button
            onClick={handleBook}
            className="w-full rounded-lg py-3 font-body font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ background: '#dc2626' }}
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
}
