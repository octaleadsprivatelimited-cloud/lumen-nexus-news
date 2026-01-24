import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * AutoKeepAlive Component
 * Automatically calls the keep-alive function every 12 hours
 * to prevent database from sleeping on free tier
 */
export const AutoKeepAlive = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  useEffect(() => {
    const callKeepAlive = async () => {
      try {
        await supabase.functions.invoke('keep-alive');
        lastCallRef.current = Date.now();
        console.log('✅ Keep-alive ping sent successfully');
      } catch (error) {
        console.error('❌ Keep-alive ping failed:', error);
      }
    };

    // Call immediately on mount
    callKeepAlive();

    // Set up interval to call every 12 hours (43200000 ms)
    const INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours
    
    intervalRef.current = setInterval(() => {
      callKeepAlive();
    }, INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AutoKeepAlive;

