
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Target, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { MissionModal } from './MissionModal';

export const DashboardClient: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const fetchOperationalData = async (uid: string) => {
    if (!supabase) return;
    try {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', uid)
        .single();
      
      setProfile(profileData);

      // 2. Fetch Missions with Assignments Join
      // This implements the (is_assigned OR (is_global AND is_verified)) logic
      const { data: missionData, error: mError } = await supabase
        .from('missions')
        .select(`
          *,
          mission_assignments!left (user_id)
        `)
        .or(
          `mission_assignments.user_id.eq.${uid}${
            profileData?.is_verified ? ',type.eq.global_verified' : ''
          }`
        );

      if (mError) throw mError;
      setMissions(missionData || []);
    } catch (err) {
      console.error("GRID_SYNC_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchOperationalData(user.uid);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-[#834bf1] mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">Calculating Mission Grid...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
      {selectedMission && (
        <MissionModal 
          mission={selectedMission} 
          user={user} 
          onClose={() => setSelectedMission(null)} 
        />
      )}

      <div className="flex items-center justify-between border-b-4 border-black pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic uppercase font-display">Mission Grid</h2>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-[8px] font-black uppercase border-2 border-black ${profile?.is_verified ? 'bg-emerald-400' : 'bg-slate-200'}`}>
              {profile?.is_verified ? 'Verified Node' : 'Unverified Node'}
            </span>
          </div>
        </div>
        <div className="bg-black text-white p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] hidden md:block">
          <span className="text-[10px] font-black uppercase tracking-widest">Active Assignments: {missions.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {missions.length === 0 ? (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-black/10">
            <Target size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-xs font-black uppercase tracking-widest text-black/20">No active transmissions detected.</p>
          </div>
        ) : (
          missions.map(mission => (
            <div key={mission.id} className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-[#ffde59] border-2 border-black px-2 py-1 text-[8px] font-black uppercase tracking-widest">
                  {mission.type === 'global_verified' ? 'GLOBAL PROTOCOL' : 'DIRECT ASSIGNMENT'}
                </span>
                <div className="bg-black text-[#ffde59] px-2 py-1 border-2 border-black text-[10px] font-black italic">
                  +{mission.reward_amount} RC
                </div>
              </div>
              <h3 className="text-xl font-black uppercase italic font-display mb-4">{mission.title}</h3>
              <p className="text-[10px] font-bold text-black/50 uppercase leading-relaxed mb-8 line-clamp-2">
                {mission.description}
              </p>
              <button 
                onClick={() => setSelectedMission(mission)}
                className="w-full bg-[#834bf1] text-white py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-[0.2em] shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Access Brief
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
