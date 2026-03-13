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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-lg border-[3px] flex flex-col"
        style={{
          background: '#00c800',
          borderColor: 'hsl(var(--gold))',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ background: '#009000' }}>
          <h2 className="font-display text-xl text-white font-bold">Booking dashboard</h2>
          <button onClick={onClose} className="text-white hover:text-red-400 transition-colors text-xl font-bold">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Name input */}
        <div className="px-4 pt-2 pb-1 shrink-0">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Ticket grid */}
        <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
          <div
            className="border-2 rounded"
            style={{ borderColor: '#d946ef' }}
          >
            <div className="grid grid-cols-6">
              {players.map((player, idx) => {
                const isBooked = player.is_booked;
                const isSelected = selected.has(idx);
                let bg = '#facc15';
                let textColor = '#000';
                if (!isBooked && !isSelected) { bg = '#facc15'; }
                if (isBooked) { bg = '#facc15'; textColor = '#000'; }
                if (isSelected) { bg = '#3b82f6'; textColor = '#fff'; }

                return (
                  <button
                    key={player.id}
                    onClick={() => toggleSelect(idx)}
                    disabled={isBooked}
                    className="flex items-center justify-center font-bold text-sm transition-all border"
                    style={{
                      background: bg,
                      color: textColor,
                      borderColor: '#d946ef',
                      borderWidth: '1.5px',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      height: '38px',
                    }}
                  >
                    {idx + 1}
                    {isSelected && (
                      <Check className="absolute w-3 h-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Book button */}
        <div className="px-4 pb-3 pt-1 shrink-0">
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
