import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTreeTracker } from '@/hooks/useTreeTracker';

const COIN_PACKS = [
  { key: 'coins_100', name: '100 Coins', price: '$1.00', emoji: '🪙', description: 'Starter pack' },
  { key: 'coins_600', name: '600 Coins', price: '$4.99', emoji: '💰', description: '20% bonus!' },
];

interface Props {
  onClose: () => void;
}

export function DonationPanel({ onClose }: Props) {
  const { totalTrees, recentDonations, loading } = useTreeTracker();
  const [donorName, setDonorName] = useState('');
  const [treeCount, setTreeCount] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleCheckout = async (productKey: string, quantity?: number) => {
    setProcessing(productKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { productKey, quantity, donorName: donorName || 'Anonymous' },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e) {
      console.error('Checkout error:', e);
    } finally {
      setProcessing(null);
    }
  };

  const timeSince = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[85vh] overflow-auto animate-bounce-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-border text-center">
          <h2 className="font-display text-xl font-bold text-foreground">🌳 Plant Trees & Buy Coins</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">Every $1 = 1 tree planted around the world</p>
        </div>

        {/* Live Tree Counter */}
        <div className="bg-primary/10 p-6 text-center">
          <div className="text-5xl font-display font-bold text-primary">
            {loading ? '...' : totalTrees.toLocaleString()}
          </div>
          <p className="font-body text-sm text-primary/80 mt-1">🌍 Trees Planted Globally</p>
        </div>

        {/* Donate Section */}
        <div className="p-4 border-b border-border space-y-3">
          <h3 className="font-display font-bold text-foreground">🌱 Plant a Tree ($1 each)</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-body text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTreeCount(Math.max(1, treeCount - 1))}
              className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold hover:bg-muted/80"
            >−</button>
            <span className="font-display text-lg font-bold text-foreground w-12 text-center">{treeCount}</span>
            <button
              onClick={() => setTreeCount(treeCount + 1)}
              className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold hover:bg-muted/80"
            >+</button>
            <span className="font-body text-sm text-muted-foreground">trees = ${treeCount}.00</span>
            <button
              onClick={() => handleCheckout('donate', treeCount)}
              disabled={processing === 'donate'}
              className="ml-auto px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body font-bold text-sm hover:scale-105 transition-transform shadow-md disabled:opacity-50"
            >
              {processing === 'donate' ? '...' : '🌳 Donate'}
            </button>
          </div>
        </div>

        {/* Coin Packs */}
        <div className="p-4 border-b border-border space-y-3">
          <h3 className="font-display font-bold text-foreground">🪙 Buy Coins</h3>
          {COIN_PACKS.map(pack => (
            <div key={pack.key} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
              <span className="text-3xl">{pack.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-foreground text-sm">{pack.name}</p>
                <p className="font-body text-xs text-muted-foreground">{pack.description}</p>
              </div>
              <button
                onClick={() => handleCheckout(pack.key)}
                disabled={processing === pack.key}
                className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-body font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {processing === pack.key ? '...' : pack.price}
              </button>
            </div>
          ))}
        </div>

        {/* Recent Donations Feed */}
        <div className="p-4 space-y-2">
          <h3 className="font-display font-bold text-foreground">🌍 Recent Trees Planted</h3>
          {recentDonations.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground text-center py-4">Be the first to plant a tree! 🌱</p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {recentDonations.map(d => (
                <div key={d.id} className="flex items-center gap-2 text-sm font-body">
                  <span>🌳</span>
                  <span className="font-semibold text-foreground">{d.donor_name}</span>
                  <span className="text-muted-foreground">planted {d.trees_planted} tree{d.trees_planted > 1 ? 's' : ''}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{timeSince(d.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close */}
        <div className="p-4 border-t border-border text-center">
          <button onClick={onClose} className="font-body text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>
      </div>
    </div>
  );
}
