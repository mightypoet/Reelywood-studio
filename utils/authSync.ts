import { supabase } from '../lib/clients';
import { User } from 'firebase/auth';

/**
 * Synchronizes a Firebase user object with the Supabase 'profiles' table.
 * Ensures new users are created with default roles and statuses.
 */
export const syncUserToSupabase = async (user: User) => {
  if (!user) return;

  if (!supabase) {
    console.error("Supabase Sync Failed: Client not initialized. Check environment variables.");
    return { error: new Error("Supabase client not initialized") };
  }

  console.log(`Syncing user to Supabase... [${user.email}]`);

  try {
    // 1. Check if the user already exists in the profiles table
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('firebase_uid')
      .eq('firebase_uid', user.uid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is the "no rows found" error code, we ignore it
      console.error("Error checking existing profile:", fetchError.message);
    }

    if (!existingUser) {
      // 2. NEW USER: Perform full INSERT with defaults
      console.log("New user detected. Creating profile node...");
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          firebase_uid: user.uid,
          email: user.email,
          display_name: user.displayName,
          photo_url: user.photoURL,
          role: 'user',
          card_status: 'none',
          reelcoins: 0
        }]);

      if (error) {
        console.error("Supabase INSERT Error:", error.message, error.details, error.hint);
        return { error };
      }
      console.log("Supabase Profile Created Successfully.");
      return { data };
    } else {
      // 3. RETURNING USER: Perform UPDATE only for volatile data
      console.log("Returning user. Updating profile metadata...");
      const { data, error } = await supabase
        .from('profiles')
        .update({
          email: user.email,
          display_name: user.displayName,
          photo_url: user.photoURL
        })
        .eq('firebase_uid', user.uid);

      if (error) {
        console.error("Supabase UPDATE Error:", error.message);
        return { error };
      }
      console.log("Supabase Profile Updated Successfully.");
      return { data };
    }
  } catch (err) {
    console.error("Auth Sync Critical Exception:", err);
    return { error: err };
  }
};