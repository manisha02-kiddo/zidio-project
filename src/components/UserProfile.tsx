import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfileData {
  full_name: string;
  avatar_url: string | null;
  job_title: string;
  department: string;
}

export function UserProfile() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!profile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-indigo-400" />
          )}
        </div>
        <span className="hidden md:inline">{profile.full_name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">{profile.full_name}</h3>
              <p className="text-sm text-gray-400">{profile.job_title}</p>
              <p className="text-sm text-gray-400">{profile.department}</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}