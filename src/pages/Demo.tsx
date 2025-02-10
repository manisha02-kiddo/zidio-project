import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-300 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
      
      <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-lg rounded-xl p-8">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-600/20 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
            <Play className="text-indigo-400 w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white">Product Demo</h1>
        </div>
        
        <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center mb-8">
          <p className="text-gray-400">Demo video coming soon!</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Key Features Overview</h2>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
              Task Management and Assignment
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
              Role-Based Access Control
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
              Real-Time Collaboration Tools
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}