
import { useCallback, useRef } from 'react';

const NOTIFICATION_SOUND_URL = "https://gkaffrpzczamnawhmlph.supabase.co/storage/v1/object/public/brand-assets/notification.mp3";

export const useSoundNotification = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      }
      
      // Attempt to play the sound
      audioRef.current.play().catch(error => {
        console.warn("SOUND_NOTIFICATION_ERROR: Autoplay might be blocked by browser policy.", error);
      });

      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    } catch (err) {
      console.warn("SOUND_NOTIFICATION_CRITICAL_FAILURE:", err);
    }
  }, []);

  return { playSound };
};
