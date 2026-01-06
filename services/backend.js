
import { supabase } from '../lib/clients';
import { auth } from '../lib/firebase';

const checkClient = () => {
  if (!supabase) {
    throw new Error("Database connection unavailable. Check your Supabase environment variables.");
  }
};

// --- ADMIN ACTIONS ---

export const fetchPendingUsers = async () => {
  checkClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('card_status', 'pending');
  if (error) throw error;
  return data;
};

export const approveUser = async (targetUid) => {
  checkClient();
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

export const applyForCard = async (userUid) => {
  checkClient();
  const { error } = await supabase
    .from('profiles')
    .update({ card_status: 'pending' })
    .eq('firebase_uid', userUid);
  if (error) throw error;
};

export const getMyProfile = async (userUid) => {
  checkClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('firebase_uid', userUid)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createAndAssignMission = async (missionData, targetUserUid = null) => {
  checkClient();
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
