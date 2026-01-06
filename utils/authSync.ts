import { supabase } from '../lib/clients';
import { User } from 'firebase/auth';

/**
 * Synchronizes a Firebase user object with the Supabase 'profiles' table.
 * This is a critical function to ensure every logged-in user is synced to Supabase immediately.
 */
export const syncUserToSupabase = async (user: User) => {
  if (!user) return;

  if (!supabase) {
    console.error("Supabase Sync Failed: Database client not found. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    return;
  }

  console.log("Syncing user to Supabase...");
  console.log(`Checking user [${user.email}] in Supabase 'profiles' table...`);

  try {
    // 1. Check if the user already exists in the profiles table
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('firebase_uid')
      .eq('firebase_uid', user.uid)
      .single();

    // PGRST116 means "no rows found", which is expected for new users
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error checking existing profile:", fetchError.message);
      return;
    }

    if (!existingUser) {
      console.log("User missing from Supabase, creating new profile node...");
      
      // 2. NEW USER: Perform INSERT with mandatory fields
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          firebase_uid: user.uid,
          email: user.email,
          display_name: user.displayName || 'Anonymous Agent',
          photo_url: user.photoURL || null,
          role: 'user',
          card_status: 'none',
          reelcoins: 0
        }]);

      if (insertError) {
        console.error("Supabase Create Error (INSERT):", insertError.message);
        console.log("Error details:", insertError.details);
        console.log("Error hint:", insertError.hint);
      } else {
        console.log("User created in Supabase successfully!");
      }
    } else {
      console.log("User already exists in Supabase. Profile verified.");
      
      // Optional: Update existing user data to keep emails/names in sync
      await supabase
        .from('profiles')
        .update({
          email: user.email,
          display_name: user.displayName,
          photo_url: user.photoURL
        })
        .eq('firebase_uid', user.uid);
    }
  } catch (err) {
    console.error("Auth Sync Critical Exception:", err);
  }
};