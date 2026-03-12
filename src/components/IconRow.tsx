import { Phone, MessageCircle, User, Lock } from 'lucide-react';

interface IconRowProps {
  onAdminClick?: () => void;
  isAdmin?: boolean;
}

export function IconRow({ onAdminClick, isAdmin }: IconRowProps) {
  const icons = [
    { Icon: Phone, color: 'hsl(30 100% 50%)', label: 'Phone' },
    { Icon: MessageCircle, color: 'hsl(210 100% 55%)', label: 'WhatsApp' },
    { Icon: User, color: 'hsl(45 100% 50%)', label: 'Profile' },
    { Icon: Lock, color: isAdmin ? 'hsl(120 70% 50%)' : 'hsl(0 0% 100%)', label: 'Lock', onClick: onAdminClick },
  ];

  return (
    <div className="flex items-center justify-center gap-6 py-3 px-4" style={{ background: 'hsl(270 40% 10% / 0.8)' }}>
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
    </div>
  );
}
