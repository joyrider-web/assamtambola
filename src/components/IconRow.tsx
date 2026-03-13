import { useState } from 'react';
import { Phone, MessageCircle, User, Lock, X } from 'lucide-react';

interface IconRowProps {
  onAdminClick?: () => void;
  isAdmin?: boolean;
  onAdminLogout?: () => void;
}

export function IconRow({ onAdminClick, isAdmin, onAdminLogout }: IconRowProps) {
  const [showPopup, setShowPopup] = useState(false);

  const icons = [
    { Icon: Phone, color: 'hsl(30 100% 50%)', label: 'Phone' },
    { Icon: MessageCircle, color: 'hsl(210 100% 55%)', label: 'WhatsApp' },
    { Icon: User, color: 'hsl(45 100% 50%)', label: 'Profile' },
    { Icon: Lock, color: isAdmin ? 'hsl(120 70% 50%)' : 'hsl(0 0% 100%)', label: 'Lock', onClick: () => setShowPopup(true) },
  ];

  return (
    <div className="relative flex items-center justify-center gap-6 py-3 px-4" style={{ background: 'hsl(270 40% 10% / 0.8)' }}>
      {icons.map(({ Icon, color, label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="w-10 h-10 rounded-full flex items-center justify-center glow-interactive transition-transform hover:scale-110"
          style={{ background: 'hsl(270 30% 18%)', border: `1.5px solid ${color}` }}
          title={label}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </button>
      ))}

      {/* Admin logout X button */}
      {isAdmin && onAdminLogout && (
        <button
          onClick={onAdminLogout}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'hsl(0 70% 50%)', border: '1.5px solid hsl(0 0% 100%)' }}
          title="Exit Admin Access"
        >
          <X className="w-4 h-4" style={{ color: 'hsl(0 0% 100%)' }} />
        </button>
      )}

      {/* Login type popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPopup(false)}>
          <div
            className="rounded-2xl p-6 w-[260px] shadow-2xl flex flex-col items-center gap-4"
            style={{ background: 'hsl(220 100% 50%)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-extrabold text-xl text-center leading-tight">
              Select login<br />type
            </h3>
            <button
              onClick={() => { setShowPopup(false); onAdminClick?.(); }}
              className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:opacity-90"
              style={{ background: 'hsl(0 0% 93%)', color: 'hsl(220 100% 50%)' }}
            >
              Login as admin
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:opacity-90"
              style={{ background: 'hsl(0 0% 93%)', color: 'hsl(220 100% 50%)' }}
            >
              Login as agent
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="text-white font-semibold text-base mt-1 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
