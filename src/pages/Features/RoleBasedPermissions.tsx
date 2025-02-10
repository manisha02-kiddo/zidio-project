import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Users, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  user_profile: {
    full_name: string;
    job_title: string;
    department: string;
  };
}

export function RoleBasedPermissions() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    checkCurrentUserRole();
  }, []);

  const checkCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setCurrentUserRole(data.role);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          user_profile:user_profiles(
            full_name,
            job_title,
            department
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const roleColors = {
    admin: 'text-red-400',
    editor: 'text-yellow-400',
    viewer: 'text-green-400'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-300 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="bg-indigo-600/20 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
            <Shield className="text-indigo-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Role-Based Permissions</h1>
            <p className="text-gray-400 mt-1">Manage user roles and access levels</p>
          </div>
        </div>

        {currentUserRole !== 'admin' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center text-yellow-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>You need admin privileges to manage user roles.</p>
            </div>
          </div>
        )}
        
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-indigo-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Team Members</h2>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Job Title</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Role</th>
                    {currentUserRole === 'admin' && <th className="pb-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((user) => (
                    <tr key={user.id} className="text-gray-300">
                      <td className="py-4">{user.user_profile.full_name}</td>
                      <td className="py-4">{user.user_profile.job_title}</td>
                      <td className="py-4">{user.user_profile.department}</td>
                      <td className="py-4">
                        <span className={roleColors[user.role]}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      {currentUserRole === 'admin' && (
                        <td className="py-4">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.user_id, e.target.value as any)}
                            className="bg-gray-800 text-white rounded-lg px-3 py-1"
                            disabled={currentUserRole !== 'admin'}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}