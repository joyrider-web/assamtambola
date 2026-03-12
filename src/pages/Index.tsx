import { useState, useEffect } from 'react';
import bannerImg from '@/assets/banner.png';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/hooks/useGameStore';
import { TambolaTicket } from '@/components/TambolaTicket';
import { NumberBoard } from '@/components/NumberBoard';
import { BookingDashboard } from '@/components/BookingDashboard';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminPanel } from '@/components/AdminPanel';
import { WinnerPanel } from '@/components/WinnerPanel';
import { IconRow } from '@/components/IconRow';
import { StatusBar } from '@/components/StatusBar';
import { formatTime } from '@/lib/supabase-helpers';
import { announceNumber, announceGameStart, announceGameOver, announceWinner } from '@/hooks/useVoiceAnnouncer';
import { Users, Shield } from 'lucide-react';

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

  // Voice announcements
  useEffect(() => {
    if (!session) return;
    if (session.status === 'active' && prevSessionStatus.current !== 'active' && prevSessionStatus.current !== null) {
      announceGameStart();
    }
    if (session.status === 'completed' && prevSessionStatus.current === 'active') {
      announceGameOver();
    }
    prevSessionStatus.current = session.status;
  }, [session?.status]);

  useEffect(() => {
    if (drawnNumbers.length > prevDrawnCount.current && prevDrawnCount.current > 0) {
      const latestNum = drawnNumbers[drawnNumbers.length - 1];
      announceNumber(latestNum);
    }
    prevDrawnCount.current = drawnNumbers.length;
  }, [drawnNumbers.length]);

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
  const isGameOver = session?.status === 'completed';

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
      {/* Header */}
      <header className="relative">
        <img src={bannerImg} alt="Assam Tambola Banner" className="w-full h-auto object-cover rounded-b-xl" />

        {/* Admin button */}
        <button
          onClick={() => isAdmin ? setShowAdminPanel(true) : setShowAdminLogin(true)}
          className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all glow-interactive"
          style={{
            background: isAdmin ? 'hsl(280 60% 50% / 0.2)' : 'hsl(0 0% 100% / 0.08)',
            border: '1px solid hsl(var(--gold) / 0.3)',
            color: 'hsl(var(--gold))',
          }}
        >
          <Shield className="w-3 h-3" />
          {isAdmin ? 'Admin Panel' : 'Admin'}
        </button>
      </header>

      {/* Icon Row */}
      <IconRow />

      {/* Status Bar */}
      <StatusBar gameTime={gameTime} sessionStatus={session?.status} />

      {/* CHECK AVAILABLE TICKETS / GAME IS LIVE button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => !isGameActive && !isGameOver && setIsBookingOpen(true)}
          className={`w-full max-w-md mx-auto block rounded-xl px-4 py-3.5 font-body font-bold text-sm tracking-wider transition-all ${
            isGameActive ? 'animate-pulse-live cursor-default' : isGameOver ? 'cursor-default' : 'glow-interactive cursor-pointer hover:scale-[1.02]'
          }`}
          style={{
            background: isGameActive
              ? 'linear-gradient(135deg, hsl(120 70% 35%), hsl(150 60% 40%))'
              : isGameOver
              ? 'linear-gradient(135deg, hsl(0 70% 40%), hsl(20 60% 35%))'
              : 'var(--gradient-purple-btn)',
            color: isGameActive || isGameOver ? 'hsl(0 0% 100%)' : 'hsl(330 80% 80%)',
            boxShadow: isGameActive
              ? '0 0 20px hsl(120 80% 40% / 0.4)'
              : isGameOver
              ? '0 0 20px hsl(0 80% 40% / 0.4)'
              : 'var(--shadow-purple-glow)',
          }}
        >
          {isGameActive ? '🔴 GAME IS LIVE' : isGameOver ? '🏁 GAME IS OVER' : 'CHECK AVAILABLE TICKETS'}
        </button>
      </div>

      {isBookingOpen && (
        <BookingDashboard players={players} onClose={() => setIsBookingOpen(false)} />
      )}

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Current Number Banner */}
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
            {/* Left sidebar */}
            <div className="xl:col-span-1">
              <div className="xl:sticky xl:top-4">
                {(isGameActive || session?.status === 'completed') && (
                  <NumberBoard drawnNumbers={drawnNumbers} currentNumber={session?.current_number} />
                )}

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

            {/* Right: Players & Tickets OR Winners */}
            <div className="xl:col-span-3">
              {session?.status === 'completed' ? (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-2xl text-gold">🏆 Game Over — Winners</h2>
                    <div className="decorative-line flex-1" />
                  </div>
                  {winners.filter(w => w.confirmed).length > 0 ? (
                    <WinnerPanel
                      sessionId={session.id}
                      players={players}
                      tickets={tickets}
                      drawnNumbers={drawnNumbers}
                      winners={winners}
                      onRefetch={refetch}
                    />
                  ) : (
                    <div className="gradient-card border gold-border rounded-2xl p-12 max-w-md mx-auto shadow-card text-center">
                      <p className="text-muted-foreground text-sm">No winners this session.</p>
                    </div>
                  )}
                </div>
              ) : players.length === 0 ? (
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {players.map((player, idx) => {
                      const playerTickets = tickets.filter(t => t.player_id === player.id);
                      return (
                        <div key={player.id} className="space-y-3 animate-slide-up">
                          {playerTickets.map(ticket => (
                            <TambolaTicket
                              key={ticket.id}
                              ticket={ticket}
                              drawnNumbers={drawnNumbers}
                              playerName={player.name}
                              playerIndex={idx + 1}
                              isBooked={player.is_booked}
                              compact
                            />
                          ))}
                          {playerTickets.length === 0 && (
                            <p className="text-muted-foreground text-xs text-center py-2">No ticket assigned</p>
                          )}
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
