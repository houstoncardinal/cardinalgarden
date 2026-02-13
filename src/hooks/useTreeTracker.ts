import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Donation {
  id: string;
  donor_name: string;
  trees_planted: number;
  created_at: string;
}

export function useTreeTracker() {
  const [totalTrees, setTotalTrees] = useState(0);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentDonations(data);
      // Sum all trees
      const { data: sumData } = await supabase
        .from('donations')
        .select('trees_planted');
      if (sumData) {
        setTotalTrees(sumData.reduce((acc, d) => acc + d.trees_planted, 0));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();

    // Real-time subscription
    const channel = supabase
      .channel('donations-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload) => {
        const newDonation = payload.new as Donation;
        setRecentDonations(prev => [newDonation, ...prev.slice(0, 9)]);
        setTotalTrees(prev => prev + newDonation.trees_planted);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { totalTrees, recentDonations, loading, refetch: fetchDonations };
}
