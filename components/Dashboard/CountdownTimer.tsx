import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const CountdownTimer: React.FC<{ expiry: string | null }> = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!expiry) return;

    const calculate = () => {
      const difference = +new Date(expiry) - +new Date();
      if (difference <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      setIsUrgent(difference < 86400000); // Less than 24h
      setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m left`);
    };

    calculate();
    const timer = setInterval(calculate, 60000);
    return () => clearInterval(timer);
  }, [expiry]);

  if (!expiry || !timeLeft) return null;

  return (
    <div className={`flex items-center gap-1.5 font-mono font-black text-[9px] uppercase tracking-tighter px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isUrgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-black'}`}>
      <Clock size={10} strokeWidth={3} />
      <span>{timeLeft}</span>
    </div>
  );
};