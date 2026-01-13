import { supabase } from '../lib/clients';
import { User } from 'firebase/auth';

/**
 * Robustly synchronizes a Firebase User to the Supabase 'profiles' table.
 */
// Fixed: User type is correctly imported from firebase/auth
export const syncUserToSupabase = async (user: User) => {
  if (!user) {
    console.log("SYNC: No user detected for synchronization.");
    return;
  }

  if (!supabase) {
    console.error("SYNC: Critical Error - Supabase client is not initialized.");
    return;
  }

  console.log(`SYNC: Starting sync for user... UID: ${user.uid}`);

  try {
    // 1. Query Supabase for existing profile
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('firebase_uid', user.uid)
      .single();

    // 2. If the user exists: Log and return
    if (existingUser) {
      console.log("SYNC: User already exists.");
      return;
    }

    // 3. Handle specific fetch errors (excluding 'no rows found')
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("SYNC: Error checking profile:", fetchError.message);
      return;
    }

    // 4. If the user does NOT exist: Execute INSERT
    console.log("SYNC: User missing from database. Initiating INSERT protocol...");
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{
        firebase_uid: user.uid,
        email: user.email || "no-email",
        role: 'user',
        card_status: 'none',
        reelcoins: 0,
        display_name: user.displayName || 'Agent ' + user.uid.substring(0, 5),
        photo_url: user.photoURL || null
      }]);

    if (insertError) {
      console.error("SYNC: Failed to create new user in Supabase:", insertError.message);
    } else {
      console.log("SYNC: Created new user in Supabase!");
    }
  } catch (err) {
    console.error("SYNC: Unexpected critical failure in sync logic:", err);
  }
};