import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'admin'
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check credentials.');
      setIsLoading(false);
    }
  };

  const handleQuickFill = (type) => {
    if (type === 'admin') {
      setEmail('admin@university.edu');
      setPassword('password123');
    } else {
      setEmail('john.doe@student.edu');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">
            HostelHub
          </h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Role Tabs */}
          <div className="flex border-b border-slate-800 w-full">
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setEmail(''); setPassword(''); setError(''); }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                activeTab === 'student' 
                  ? 'bg-slate-800/80 text-blue-400 border-b-2 border-blue-500 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <User size={18} />
              Student Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setEmail(''); setPassword(''); setError(''); }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                activeTab === 'admin' 
                  ? 'bg-slate-800/80 text-indigo-400 border-b-2 border-indigo-500 shadow-[inset_0_-2px_10px_rgba(99,102,241,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <Shield size={18} />
              Admin Portal
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email"
                    className="w-full bg-slate-950/50 border border-slate-700/50 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-600 text-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Enter your password"
                    className="w-full bg-slate-950/50 border border-slate-700/50 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-600 text-slate-200 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full mt-2 flex items-center justify-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                  activeTab === 'student'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]'
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-center text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">Quick Testing Access</p>
              <div className="flex justify-center">
                {activeTab === 'student' ? (
                  <button 
                    onClick={() => handleQuickFill('student')}
                    className="text-sm bg-slate-800 hover:bg-slate-700 text-blue-400 py-1.5 px-4 rounded-full transition-colors border border-slate-700 hover:border-slate-600"
                  >
                    Use Demo Student
                  </button>
                ) : (
                  <button 
                    onClick={() => handleQuickFill('admin')}
                    className="text-sm bg-slate-800 hover:bg-slate-700 text-indigo-400 py-1.5 px-4 rounded-full transition-colors border border-slate-700 hover:border-slate-600"
                  >
                    Use Demo Admin
                  </button>
                )}
              </div>
            </div>
            
            {activeTab === 'student' && (
              <div className="mt-6 text-center text-sm text-slate-500">
                Don't have an account? <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Register here</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
