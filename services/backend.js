
import { supabase } from '../lib/clients';
import { auth } from '../lib/firebase';

// --- ADMIN ACTIONS ---

/**
 * 1. Fetch Pending Requests
 * Retrieves all users from Supabase with a 'pending' card status.
 */
export const fetchPendingUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('card_status', 'pending');
  if (error) throw error;
  return data;
};

/**
 * 2. Approve User (Secure)
 * Uses the PostgreSQL RPC function to verify admin authority and issue a card.
 */
export const approveUser = async (targetUid) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required: No admin session found.");

  const cardPayload = {
    number: "RW-" + Math.floor(1000 + Math.random() * 9000),
    tier: "Elite",
    issued: new Date().toISOString()
  };

  const { data, error } = await supabase.rpc('approve_card_secure', {
    requester_uid: currentUser.uid,
    target_uid: targetUid,
    new_card_details: cardPayload
  });

  if (error) throw error;
  return data;
};

// --- USER ACTIONS ---

/**
 * 3. Apply for Card
 * Initiates the application process for the authenticated user.
 */
export const applyForCard = async (userUid) => {
  const { error } = await supabase
    .from('profiles')
    .update({ card_status: 'pending' })
    .eq('firebase_uid', userUid);
  if (error) throw error;
};

/**
 * 4. Get My Profile
 * Fetches the current user's profile including coins and card status.
 */
export const getMyProfile = async (userUid) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('firebase_uid', userUid)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows returned'
  return data;
};

/**
 * 5. Create Mission (Admin)
 */
export const createAndAssignMission = async (missionData, targetUserUid = null) => {
  const { data: mission, error } = await supabase
    .from('missions')
    .insert([{
      title: missionData.title,
      reward_amount: missionData.reward,
      assigned_type: targetUserUid ? 'individual' : 'all'
    }])
    .select()
    .single();

  if (error) throw error;

  if (targetUserUid) {
    await supabase
      .from('user_missions')
      .insert([{ user_id: targetUserUid, mission_id: mission.id }]);
  } 

  return mission;
};
