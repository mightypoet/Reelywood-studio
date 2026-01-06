import { supabase } from '../lib/clients';
import { User } from 'firebase/auth';

/**
 * Robustly synchronizes a Firebase User to the Supabase 'profiles' table.
 * 
 * Step 1: Logs "SYNC: Starting sync for user..." with the user's UID.
 * Step 2: Checks if the user already exists.
 * Step 3: If missing, inserts them with default values.
 */
export const syncUserToSupabase = async (firebaseUser: User) => {
  if (!firebaseUser) {
    console.log("SYNC: No user object detected. Skipping sync.");
    return;
  }

  if (!supabase) {
    console.error("SYNC ERROR: Supabase client is null. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.");
    return;
  }

  const { uid, email } = firebaseUser;
  // Handle case where email might be null (e.g., anonymous or phone auth)
  const safeEmail = email || "no-email@provided.com";

  console.log(`SYNC: Starting sync for user [${uid}]`);

  try {
    console.log("Checking user...");
    // 1. Check if the user exists in Supabase
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('firebase_uid')
      .eq('firebase_uid', uid);

    if (fetchError) {
      console.error("SYNC ERROR during profile check:", fetchError.message);
      return;
    }

    // 2. If the user is found, exit
    if (data && data.length > 0) {
      console.log("SYNC: User already exists.");
      return;
    }

    // 3. If the user is missing, perform INSERT
    console.log("User missing, creating...");
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{
        firebase_uid: uid,
        email: safeEmail,
        role: 'user',
        card_status: 'none',
        reelcoins: 0,
        display_name: firebaseUser.displayName || 'Agent ' + uid.substring(0, 5),
        photo_url: firebaseUser.photoURL || null
      }]);

    if (insertError) {
      console.error("SYNC ERROR during profile creation:", insertError.message);
      console.log("Error Detail:", insertError);
    } else {
      console.log("User created!");
    }
  } catch (err) {
    console.error("SYNC CRITICAL EXCEPTION:", err);
  }
};