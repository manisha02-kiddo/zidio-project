import React from 'react';
import { motion } from 'framer-motion';
import { AuthForm } from '../components/AuthForm';
import { CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface AuthProps {
  type?: 'login' | 'register';
}

export function Auth({ type: propType }: AuthProps) {
  const location = useLocation();
  const isLogin = propType === 'login' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center space-x-2"
      >
        <CheckCircle2 className="w-8 h-8 text-indigo-400" />
        <Link to="/" className="text-2xl font-bold text-white">Zidio</Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-900/50 backdrop-blur-lg p-8 rounded-xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-400 text-center mb-8">
          {isLogin
            ? 'Sign in to continue to your account'
            : 'Sign up to get started with Zidio'}
        </p>

        <AuthForm type={isLogin ? 'login' : 'register'} />

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}