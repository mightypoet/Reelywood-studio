
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface DashboardData {
  status: 'LOCKED' | 'UNLOCKED';
  cardStatus: 'PENDING' | 'ACTIVE' | 'REJECTED';
  message?: string;
  walletBalance?: number;
  missions?: any[];
  vouchers?: any[];
}

export const useCreatorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/user/dashboard?userId=${user.uid}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  return { data, loading, error, refetch: fetchDashboard };
};
