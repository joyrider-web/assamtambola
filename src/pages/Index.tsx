import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/hooks/useGameStore';
import { TambolaTicket } from '@/components/TambolaTicket';
import { NumberBoard } from '@/components/NumberBoard';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminPanel } from '@/components/AdminPanel';
import { formatTime } from '@/lib/supabase-helpers';
import { Users, Clock, Trophy, Shield, Phone, MessageCircle, Ticket, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { players, tickets, session, drawnNumbers, gameTime, loading, refetch } = useGameStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showNumberBoard, setShowNumberBoard] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAdmin(true);
    });
    supabase.auth.onAuthStateChange((_, session) => {
      setIsAdmin(!!session);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setShowAdminPanel(false);
  };

  if (showAdminLogin) {
    return (
      <AdminLogin
        onSuccess={() => {
          setIsAdmin(true);
          setShowAdminLogin(false);
          setShowAdminPanel(true);
        }}
      />
    );
  }

  if (showAdminPanel && isAdmin) {
    return (
      <AdminPanel
        players={players}
        tickets={tickets}
        session={session}
        drawnNumbers={drawnNumbers}
        gameTime={gameTime}
        onLogout={handleLogout}
        onRefetch={refetch}
      />
    );
  }

  const isGameActive = session?.status === 'active';
  const isCompleted = session?.status === 'completed';

  return (
    <div className="min-h-screen bg-deep">
      {/* Header Banner */}
      <header className="relative overflow-hidden gradient-hero pb-6">
        {/* Decorative glow */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, hsl(280 80% 60%) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(220 80% 50%) 0%, transparent 40%)'
          }}
        />

        <div className="relative z-10 px-4 pt-6 text-center">
          {/* Admin button */}
          <button
            onClick={() => isAdmin ? setShowAdminPanel(true) : setShowAdminLogin(true)}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all z-20"
            style={{
              background: isAdmin ? 'hsl(var(--gold) / 0.15)' : 'hsl(var(--foreground) / 0.05)',
              border: '1px solid hsl(var(--gold) / 0.3)',
              color: 'hsl(var(--gold))',
            }}
          >
            <Shield className="w-3 h-3" />
            {isAdmin ? 'Admin' : 'Login'}
          </button>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground glow-text leading-none mt-4">
            ASSAM
          </h1>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-none"
            style={{ color: 'hsl(var(--gold))' }}>
            TAMBOLA
          </h2>

          {/* Status Badge */}
          <div className="mt-4">
            {isGameActive ? (
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white animate-pulse"
                style={{ background: 'hsl(0 80% 50%)' }}>
                🔴 LIVE NOW
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: 'hsl(120 60% 35%)', color: 'white' }}>
                ✅ Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: 'hsl(var(--purple))', color: 'white' }}>
                ⏳ Daily at {formatTime(gameTime)}
              </span>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <a href="tel:+918638979028"
              className="btn-action gradient-blue text-foreground rounded-xl shadow-lg"
              style={{ minWidth: 70 }}>
              <Phone className="w-5 h-5" />
              Call
            </a>
            <a href="https://wa.me/918638979028?text=I%20want%20to%20buy%20tickets"
              target="_blank" rel="noopener noreferrer"
              className="btn-action text-foreground rounded-xl shadow-lg"
              style={{ background: 'hsl(142 70% 40%)', minWidth: 70 }}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <button onClick={() => isAdmin ? setShowAdminPanel(true) : setShowAdminLogin(true)}
              className="btn-action gradient-purple text-foreground rounded-xl shadow-lg"
              style={{ minWidth: 70 }}>
              <Shield className="w-5 h-5" />
              Admin
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 mt-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gold" />
              <span>{players.length} Players</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-gold" />
              <span>{tickets.length} Tickets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold" />
              <span>{formatTime(gameTime)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* CHECK AVAILABLE TICKET / BOOK NOW Big Button */}
      <div className="px-4 -mt-1">
        <a
          href="https://wa.me/918638979028?text=I%20want%20to%20buy%20tickets"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-big block text-center text-white shadow-purple"
          style={{ background: 'var(--gradient-purple)' }}
        >
          📲 BOOK TICKET NOW
        </a>
      </div>

      {/* Current Number Banner */}
      {isGameActive && session?.current_number && (
        <div className="px-4 mt-6 text-center animate-bounce-in">
          <div className="inline-block">
            <div className="gradient-card rounded-2xl px-8 py-5 shadow-card"
              style={{ border: '2px solid hsl(var(--gold))' }}>
              <p className="text-muted-foreground text-sm font-body mb-1">Current Number</p>
              <p className="font-display text-7xl md:text-8xl text-gold glow-gold font-black">
                {session.current_number}
              </p>
              <p className="text-muted-foreground text-xs mt-1">{drawnNumbers.length} / 90 drawn</p>
            </div>
          </div>
        </div>
      )}

      {/* Recently Drawn Scroll */}
      {drawnNumbers.length > 0 && (
        <div className="px-4 mt-5">
          <div className="gradient-card rounded-xl p-3 gold-border shadow-card">
            <p className="text-gold font-display text-sm mb-2">Recently Drawn</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[...drawnNumbers].reverse().slice(0, 30).map((num, i) => (
                <span
                  key={i}
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'animate-pulse-gold' : ''}`}
                  style={i === 0
                    ? { background: 'var(--gradient-gold)', color: 'hsl(var(--deep-bg))' }
                    : { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground) / 0.7)' }}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Number Board */}
      <div className="px-4 mt-5">
        <button
          onClick={() => setShowNumberBoard(!showNumberBoard)}
          className="w-full flex items-center justify-between gradient-card rounded-xl px-4 py-3 gold-border shadow-card text-gold font-display text-lg"
        >
          <span>Number Board ({drawnNumbers.length}/90)</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showNumberBoard ? 'rotate-180' : ''}`} />
        </button>
        {showNumberBoard && (
          <div className="mt-2 animate-slide-up">
            <NumberBoard drawnNumbers={drawnNumbers} currentNumber={session?.current_number} />
          </div>
        )}
      </div>

      <main className="px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin border-2 border-transparent"
              style={{ borderTopColor: 'hsl(var(--gold))' }} />
            <p className="text-muted-foreground font-body">Loading game data...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-16">
            <div className="gradient-card rounded-2xl p-10 max-w-sm mx-auto shadow-card gold-border">
              <Users className="w-14 h-14 mx-auto mb-3 text-gold opacity-50" />
              <h3 className="font-display text-3xl text-gold mb-2">No Players Yet</h3>
              <p className="text-muted-foreground text-sm font-body">
                The admin will add players before the game starts.
              </p>
              <p className="text-muted-foreground text-xs mt-3 font-body">
                Game starts at {formatTime(gameTime)} daily
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Section Title */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-2xl text-gold">Tickets For Coming Game</h2>
              <div className="decorative-line flex-1" />
            </div>

            {/* Player Tickets */}
            <div className="space-y-4">
              {players.map((player, idx) => {
                const playerTickets = tickets.filter(t => t.player_id === player.id);
                if (playerTickets.length === 0) return null;
                return (
                  <div key={player.id} className="gradient-card rounded-xl p-4 shadow-card gold-border animate-slide-up">
                    {/* Player header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--gradient-purple)', color: 'white' }}>
                        {idx + 1}
                      </span>
                      <h3 className="font-body font-bold text-foreground truncate text-base">{player.name}</h3>
                      <span className="text-muted-foreground text-xs shrink-0 ml-auto font-body">
                        {playerTickets.length} ticket{playerTickets.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {/* Tickets */}
                    <div className="space-y-2">
                      {playerTickets.map(ticket => (
                        <TambolaTicket
                          key={ticket.id}
                          ticket={ticket}
                          drawnNumbers={drawnNumbers}
                          playerName={player.name}
                          compact
                        />
                      ))}
                    </div>
                    {/* Book button per player */}
                    <a
                      href={`https://wa.me/918638979028?text=I%20want%20to%20book%20ticket%20for%20${encodeURIComponent(player.name)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-3 block w-full text-center py-2 rounded-lg text-sm font-bold font-body text-white transition-all"
                      style={{ background: 'hsl(var(--crimson))' }}
                    >
                      BOOK
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Floating BOOK button */}
      <a
        href="https://wa.me/918638979028?text=I%20want%20to%20buy%20tickets"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 px-6 py-3 rounded-full text-sm font-bold font-body text-white shadow-lg animate-pulse"
        style={{ background: 'var(--gradient-purple)' }}
      >
        📲 BOOK NOW
      </a>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-8 py-6 text-center">
        <p className="text-muted-foreground text-xs font-body">
          ASSAM TAMBOLA — Up to 250 players • Daily at {formatTime(gameTime)}
        </p>
        <div className="decorative-line w-24 mx-auto mt-2" />
      </footer>
    </div>
  );
}
