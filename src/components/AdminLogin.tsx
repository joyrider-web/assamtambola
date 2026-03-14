import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, User, X } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Try signup first (first time)
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError('Invalid credentials. Access denied.');
        } else {
          onSuccess();
        }
      } else {
        setError(signInError.message);
      }
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="gradient-card border gold-border rounded-2xl p-8 shadow-card animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse-gold"
              style={{ background: 'var(--gradient-gold)' }}>
              <Lock className="w-8 h-8" style={{ color: 'hsl(20 40% 10%)' }} />
            </div>
            <h2 className="font-display text-3xl text-gold glow-text">Admin Access</h2>
            <p className="text-muted-foreground text-sm mt-1">ASSAM TAMBOLA Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground focus:border-gold"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground focus:border-gold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-crimson text-sm text-center animate-slide-up">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold text-base py-6"
              style={{
                background: 'var(--gradient-gold)',
                color: 'hsl(20 40% 10%)',
              }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Enter Admin Panel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
