import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ArrowLeft, 
  Calendar,
  Bell,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Deadline {
  id: string;
  task_id: string;
  title: string;
  due_date: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  assigned_to: string;
}

function DeadlineCard({ deadline }: { deadline: Deadline }) {
  const dueDate = new Date(deadline.due_date);
  const today = new Date();
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusColor = () => {
    if (deadline.status === 'completed') return 'bg-green-500/20 text-green-400';
    if (daysUntil < 0) return 'bg-red-500/20 text-red-400';
    if (daysUntil <= 2) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  const getDeadlineStatus = () => {
    if (deadline.status === 'completed') return 'Completed';
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Due Today';
    if (daysUntil === 1) return 'Due Tomorrow';
    return `Due in ${daysUntil} days`;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{deadline.title}</h3>
          <p className="text-gray-400 text-sm">{deadline.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor()}`}>
          {getDeadlineStatus()}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(deadline.due_date).toLocaleDateString()}
          </span>
          <span className={`text-sm ${
            deadline.priority === 'high' ? 'text-red-400' :
            deadline.priority === 'medium' ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)} Priority
          </span>
        </div>
      </div>
    </div>
  );
}

export function DeadlineTracking() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, status, priority, description, assigned_to')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const formattedDeadlines = data.map(task => ({
        id: task.id,
        task_id: task.id,
        title: task.title,
        due_date: task.due_date,
        status: task.status === 'completed' ? 'completed' : 'pending',
        priority: task.priority,
        description: task.description,
        assigned_to: task.assigned_to
      }));

      setDeadlines(formattedDeadlines);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeadlines = deadlines.filter(deadline => {
    const dueDate = new Date(deadline.due_date);
    const today = new Date();
    
    switch (filter) {
      case 'upcoming':
        return deadline.status !== 'completed' && dueDate >= today;
      case 'overdue':
        return deadline.status !== 'completed' && dueDate < today;
      case 'completed':
        return deadline.status === 'completed';
      default:
        return true;
    }
  });

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
            <Clock className="text-indigo-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Deadline Tracking</h1>
            <p className="text-gray-400 mt-1">Monitor and manage task deadlines</p>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Deadlines
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'upcoming'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'overdue'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredDeadlines.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No deadlines found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDeadlines.map(deadline => (
                <DeadlineCard key={deadline.id} deadline={deadline} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeadlineTracking;