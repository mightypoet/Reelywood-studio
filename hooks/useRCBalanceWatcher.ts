
import { useState, useEffect } from 'react';

interface RCBalanceWatcherProps {
  currentBalance: number | undefined;
  storageKey: 'user_last_rc_balance' | 'brand_last_rc_balance';
  enabled?: boolean;
}

export const useRCBalanceWatcher = ({ currentBalance, storageKey, enabled = true }: RCBalanceWatcherProps) => {
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || currentBalance === undefined) return;

    const storedBalance = localStorage.getItem(storageKey);
    const balance = currentBalance || 0;

    if (storedBalance !== null) {
      const lastBalance = parseInt(storedBalance, 10);
      if (balance > lastBalance) {
        setRewardAmount(balance - lastBalance);
      }
    } else {
      // Initialize on first encounter without showing modal
      localStorage.setItem(storageKey, balance.toString());
    }
  }, [currentBalance, storageKey, enabled]);

  const clearReward = () => {
    if (currentBalance !== undefined) {
      localStorage.setItem(storageKey, currentBalance.toString());
    }
    setRewardAmount(null);
  };

  return { rewardAmount, clearReward };
};
