
import { supabase } from '../lib/clients';
import { User } from 'firebase/auth';

/**
 * Synchronizes a Firebase user object with the Supabase 'profiles' table.
 * Uses an upsert operation to either create a new profile or update an existing one.
 */
export const syncUserToSupabase = async (user: User) => {
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        firebase_uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        // We do not overwrite card_status or reelcoins here to preserve existing data
      }, { 
        onConflict: 'firebase_uid',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error("Supabase Sync Error:", error.message);
      return { error };
    }

    console.log("Supabase Sync Successful for:", user.email);
    return { data };
  } catch (err) {
    console.error("Auth Sync Exception:", err);
    return { error: err };
  }
};
