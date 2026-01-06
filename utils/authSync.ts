import { supabase } from '../lib/clients';
import { User } from 'firebase/auth';

/**
 * Robustly synchronizes a Firebase User to the Supabase 'profiles' table.
 * 
 * Logic:
 * 1. Log initiation.
 * 2. Check for existing profile by firebase_uid.
 * 3. If missing, insert new profile with default business values.
 * 4. Log outcomes for terminal debugging.
 */
export const syncUserToSupabase = async (user: User) => {
  if (!user) {
    console.log("SYNC: No user detected for synchronization.");
    return;
  }

  if (!supabase) {
    console.error("SYNC: Critical Error - Supabase client is not initialized.");
    return;
  }

  console.log(`SYNC: Starting sync for user... ${user.uid}`);

  try {
    // Check if user already exists in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('firebase_uid', user.uid)
      .single();

    if (data) {
      console.log("SYNC: User already exists.");
      return;
    }

    // PGRST116 means no rows were found, which is what we expect for a new user
    if (error && error.code !== 'PGRST116') {
      console.error("SYNC: Error querying Supabase profile node:", error.message);
      return;
    }

    // User does not exist, initiate creation protocol
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