import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Real-time subscription for notifications
export const subscribeToNotifications = (userId: number, callback: (payload: any) => void) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = (subscription: any) => {
  supabase.removeChannel(subscription);
};
