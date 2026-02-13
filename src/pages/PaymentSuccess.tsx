import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<{ trees: number; coins: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) { setError('No session found'); return; }

    supabase.functions.invoke('verify-payment', { body: { sessionId } })
      .then(({ data, error: err }) => {
        if (err || !data?.success) {
          setError('Could not verify payment');
        } else {
          setResult({ trees: data.trees, coins: data.coins });
        }
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full p-8 text-center space-y-4">
        {error ? (
          <>
            <div className="text-4xl">❌</div>
            <h1 className="font-display text-xl font-bold text-foreground">{error}</h1>
          </>
        ) : !result ? (
          <>
            <div className="text-4xl animate-spin">⏳</div>
            <h1 className="font-display text-xl font-bold text-foreground">Verifying payment...</h1>
          </>
        ) : (
          <>
            <div className="text-6xl">🎉</div>
            <h1 className="font-display text-2xl font-bold text-foreground">Thank You!</h1>
            {result.trees > 0 && (
              <p className="font-body text-lg text-primary">
                🌳 You planted <strong>{result.trees}</strong> tree{result.trees > 1 ? 's' : ''}!
              </p>
            )}
            {result.coins > 0 && (
              <p className="font-body text-lg text-accent-foreground">
                🪙 <strong>{result.coins}</strong> coins added to your account!
              </p>
            )}
            <p className="font-body text-sm text-muted-foreground">
              {result.trees > 0 ? 'Every tree makes a difference. Thank you for helping our planet! 🌍' : 'Enjoy your coins in the Rose Garden shop!'}
            </p>
          </>
        )}
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-body font-bold text-sm hover:scale-105 transition-transform shadow-md"
        >
          🌹 Back to Garden
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
