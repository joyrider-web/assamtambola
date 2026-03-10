import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/hooks/useGameStore';
import { TambolaTicket } from '@/components/TambolaTicket';
import { NumberBoard } from '@/components/NumberBoard';
import { BookingDashboard } from '@/components/BookingDashboard';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminPanel } from '@/components/AdminPanel';
import { WinnerPanel } from '@/components/WinnerPanel';
import { formatTime } from '@/lib/supabase-helpers';
import { announceNumber, announceGameStart, announceGameOver, announceWinner } from '@/hooks/useVoiceAnnouncer';
import { Users, Clock, Trophy, Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { players, tickets, session, drawnNumbers, winners, gameTime, loading, refetch, prevSessionStatus, prevDrawnCount, prevWinnerCount } = useGameStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAdmin(true);
    });
    supabase.auth.onAuthStateChange((_, session) => {
      setIsAdmin(!!session);
    });
  }, []);

  // Voice announcements for public page (non-admin players)
  useEffect(() => {
    if (!session) return;
    
    // Announce game start
    if (session.status === 'active' && prevSessionStatus.current !== 'active' && prevSessionStatus.current !== null) {
      announceGameStart();
    }
    // Announce game over
    if (session.status === 'completed' && prevSessionStatus.current === 'active') {
      announceGameOver();
    }
    prevSessionStatus.current = session.status;
  }, [session?.status]);

  // Announce new drawn numbers
  useEffect(() => {
    if (drawnNumbers.length > prevDrawnCount.current && prevDrawnCount.current > 0) {
      const latestNum = drawnNumbers[drawnNumbers.length - 1];
      announceNumber(latestNum);
    }
    prevDrawnCount.current = drawnNumbers.length;
  }, [drawnNumbers.length]);

  // Announce new confirmed winners
  useEffect(() => {
    const confirmed = winners.filter(w => w.confirmed);
    if (confirmed.length > prevWinnerCount.current && prevWinnerCount.current > 0) {
      const latest = confirmed[confirmed.length - 1];
      const player = players.find(p => p.id === latest.player_id);
      if (player) {
        setTimeout(() => announceWinner(player.name, latest.prize_type), 1000);
      }
    }
    prevWinnerCount.current = confirmed.length;
  }, [winners]);

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
        winners={winners}
        gameTime={gameTime}
        onLogout={handleLogout}
        onRefetch={refetch}
      />
    );
  }

  const isGameActive = session?.status === 'active';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="gradient-hero py-8 md:py-12 px-4 text-center">
          {/* Decorative top */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(42 85% 55%) 0%, transparent 60%), radial-gradient(circle at 80% 50%, hsl(0 75% 50%) 0%, transparent 60%)'
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="decorative-line w-12 md:w-20" />
              <span className="text-gold text-sm font-body tracking-widest uppercase">Est. Daily Game</span>
              <div className="decorative-line w-12 md:w-20" />
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground glow-text mb-1">
              ASSAM
            </h1>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl"
              style={{ color: 'hsl(var(--gold))' }}>
              TAMBOLA
            </h2>

            <div className="decorative-line w-40 md:w-60 mx-auto mt-4 mb-6" />

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                <span className="text-foreground/80">{players.length} Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" />
                <span className="text-foreground/80">Daily at {formatTime(gameTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span className={isGameActive ? 'text-green-400 font-semibold' : 'text-foreground/80'}>
                  {isGameActive ? '🔴 LIVE NOW' : session?.status === 'completed' ? '✅ Completed' : '⏳ Upcoming'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin button */}
        <button
          onClick={() => isAdmin ? setShowAdminPanel(true) : setShowAdminLogin(true)}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all"
          style={{
            background: isAdmin ? 'hsl(var(--gold) / 0.15)' : 'hsl(var(--foreground) / 0.05)',
            border: '1px solid hsl(var(--gold) / 0.3)',
            color: 'hsl(var(--gold))',
          }}
        >
          <Shield className="w-3 h-3" />
          {isAdmin ? 'Admin Panel' : 'Admin'}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Current Number Banner (when game active) */}
        {isGameActive && session?.current_number && (
          <div className="mb-8 text-center animate-bounce-in">
            <div className="inline-block">
              <div className="gradient-card border rounded-2xl px-8 py-5 shadow-card animate-pulse-gold"
                style={{ borderColor: 'hsl(var(--gold))' }}>
                <p className="text-muted-foreground text-sm font-body mb-1">Current Number</p>
                <p className="font-display text-7xl md:text-8xl text-gold glow-text font-black">
                  {session.current_number}
                </p>
                <p className="text-muted-foreground text-xs mt-1">{drawnNumbers.length} numbers drawn</p>
              </div>
            </div>
          </div>
        )}

        {/* Winners Display */}
        {session && winners.filter(w => w.confirmed).length > 0 && (
          <div className="mb-6 max-w-md mx-auto">
            <WinnerPanel
              sessionId={session.id}
              players={players}
              tickets={tickets}
              drawnNumbers={drawnNumbers}
              winners={winners}
              onRefetch={refetch}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin border-2 border-transparent"
              style={{ borderTopColor: 'hsl(var(--gold))' }} />
            <p className="text-muted-foreground">Loading game data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left: Number Board (sticky) */}
            <div className="xl:col-span-1">
              <div className="xl:sticky xl:top-4">
                <NumberBoard drawnNumbers={drawnNumbers} currentNumber={session?.current_number} players={players} />

                {/* Drawn history */}
                {drawnNumbers.length > 0 && (
                  <div className="mt-4 gradient-card border gold-border rounded-xl p-4 shadow-card">
                    <h3 className="font-display text-gold text-sm mb-3">Recently Drawn</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {[...drawnNumbers].reverse().slice(0, 20).map((num, i) => (
                        <span
                          key={i}
                          className={`text-xs font-bold px-2 py-1 rounded ${i === 0 ? 'animate-pulse-gold text-background' : 'text-foreground/70 bg-muted'}`}
                          style={i === 0 ? { background: 'var(--gradient-gold)' } : {}}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: All Players & Tickets */}
            <div className="xl:col-span-3">
              {players.length === 0 ? (
                <div className="text-center py-20">
                  <div className="gradient-card border gold-border rounded-2xl p-12 max-w-md mx-auto shadow-card">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gold opacity-50" />
                    <h3 className="font-display text-2xl text-gold mb-2">No Players Yet</h3>
                    <p className="text-muted-foreground text-sm">
                      The admin will add players before the game starts.
                    </p>
                    <div className="decorative-line w-20 mx-auto mt-4" />
                    <p className="text-muted-foreground text-xs mt-3">
                      Game starts at {formatTime(gameTime)} daily
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-2xl text-gold">Players & Tickets</h2>
                    <div className="decorative-line flex-1" />
                    <span className="text-muted-foreground text-sm">{players.length} players</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player, idx) => {
                      const playerTickets = tickets.filter(t => t.player_id === player.id);
                      return (
                        <div key={player.id} className="gradient-card border gold-border rounded-xl p-4 shadow-card animate-slide-up">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: 'var(--gradient-gold)', color: 'hsl(20 40% 10%)' }}>
                              {idx + 1}
                            </span>
                            <h3 className="font-body font-semibold text-foreground truncate">{player.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ml-auto ${
                              player.is_booked
                                ? 'bg-green-900/50 text-green-400 border border-green-700'
                                : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                            }`}>
                              {player.is_booked ? '✅ BOOKED' : 'BOOK THIS'}
                            </span>
                          </div>
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
                            {playerTickets.length === 0 && (
                              <p className="text-muted-foreground text-xs text-center py-2">No ticket assigned</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12 py-6 text-center">
        <p className="text-muted-foreground text-xs">
          ASSAM TAMBOLA — Up to 250 players • Daily at {formatTime(gameTime)}
        </p>
        <div className="decorative-line w-24 mx-auto mt-2" />
      </footer>
    </div>
  );
}
