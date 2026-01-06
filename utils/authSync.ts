
import { supabase } from '../lib/clients';
import { User } from 'firebase/auth';

/**
 * Synchronizes a Firebase user object with the Supabase 'profiles' table.
 */
export const syncUserToSupabase = async (user: User) => {
  if (!user) return;

  if (!supabase) {
    console.error("Supabase Sync Failed: Client not initialized. Check environment variables.");
    return { error: new Error("Supabase client not initialized") };
  }

  try {
    const payload = {
      firebase_uid: user.uid,
      email: user.email,
      display_name: user.displayName,
      photo_url: user.photoURL,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { 
        onConflict: 'firebase_uid',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error("Supabase Sync Error [Profiles]:", error.message, error.details, error.hint);
      return { error };
    }

    console.log("Supabase Sync Successful for:", user.email);
    return { data };
  } catch (err) {
    console.error("Auth Sync Critical Exception:", err);
    return { error: err };
  }
};
