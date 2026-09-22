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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            HostelHub
          </h1>
          <p className="text-slate-500 font-medium">Sign in to your account</p>
        </div>

        <div className="bg-white/90 border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl">
          {/* Role Tabs */}
          <div className="flex border-b border-slate-200 w-full bg-slate-50/50">
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setEmail(''); setPassword(''); setError(''); }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                activeTab === 'student' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <User size={18} />
              Student Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setEmail(''); setPassword(''); setError(''); }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                activeTab === 'admin' 
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Shield size={18} />
              Admin Portal
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 text-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 text-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full mt-2 flex items-center justify-center gap-2 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-md ${
                  activeTab === 'student'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/20'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20'
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">Quick Testing Access</p>
              <div className="flex justify-center">
                {activeTab === 'student' ? (
                  <button 
                    onClick={() => handleQuickFill('student')}
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-blue-600 py-1.5 px-4 rounded-full transition-colors border border-slate-200 font-semibold"
                  >
                    Use Demo Student
                  </button>
                ) : (
                  <button 
                    onClick={() => handleQuickFill('admin')}
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-indigo-600 py-1.5 px-4 rounded-full transition-colors border border-slate-200 font-semibold"
                  >
                    Use Demo Admin
                  </button>
                )}
              </div>
            </div>
            
            {activeTab === 'student' && (
              <div className="mt-6 text-center text-sm text-slate-500">
                Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline transition-colors">Register here</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
