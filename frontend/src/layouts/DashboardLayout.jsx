import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, Bed, MessageSquare, Search, Bell, Menu, User, LogOut, CheckCheck, Shield, Mail, X, ChevronRight, CreditCard } from 'lucide-react';

import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Mock system notifications with unread state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Complaint Filed', message: 'Room B101 reported a plumbing issue.', time: '10m ago', unread: true, type: 'complaint' },
    { id: 2, title: 'Room Allocation Success', message: 'Alice Brown assigned to Block A - Room 102.', time: '1h ago', unread: true, type: 'allocation' },
    { id: 3, title: 'Fee Payment Received', message: 'Receipt #8904 generated for STU2023002.', time: '3h ago', unread: true, type: 'fee' }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'WARDEN', 'STUDENT'] },
    { path: '/students', label: 'Students', icon: Users, roles: ['ADMIN', 'WARDEN'] },
    { path: '/rooms', label: 'Rooms & Allocations', icon: Bed, roles: ['ADMIN', 'WARDEN'] },
    { path: '/fees', label: 'Fee Management', icon: CreditCard, roles: ['ADMIN', 'WARDEN', 'STUDENT'] },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare, roles: ['ADMIN', 'WARDEN', 'STUDENT'] },
  ];


  return (
    <div className="flex bg-slate-100/70 text-slate-800 min-h-screen font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-center h-16 border-b border-slate-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            HostelHub
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.filter(link => link.roles.includes(user?.role || 'ADMIN')).map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} className="shrink-0" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200/60 hover:border-red-200 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-600 hover:text-slate-900 p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 bg-slate-50 border border-slate-200 text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 text-slate-800 transition-all"
              />
            </div>
            
            {/* 1. NOTIFICATION BELL WITH DROPDOWN */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="relative text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck size={14} />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No notifications.
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div 
                          key={item.id} 
                          className={`p-4 hover:bg-slate-50 transition-colors ${item.unread ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                    <button 
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/complaints');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold py-1 px-3 rounded-lg hover:bg-indigo-50 transition-colors inline-flex items-center gap-1"
                    >
                      <span>View all complaints & updates</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. USER AVATAR WITH DROPDOWN MENU */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center border-2 border-white shadow-sm transition-all hover:scale-105 hover:shadow-indigo-500/20"
                title="Account Menu"
              >
                <span className="text-white text-sm font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'User Profile'}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || 'admin@university.edu'}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {user?.role || 'ADMIN'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                    >
                      <User size={16} className="text-slate-400" />
                      <span>View Account Profile</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} className="text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* --- PROFILE DETAILS MODAL --- */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-slate-900 font-bold text-base">Account Information</span>
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto shadow-md shadow-indigo-500/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900">{user?.name || 'Administrator'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'admin@university.edu'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-left border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Shield size={14} className="text-indigo-600" /> System Role:
                  </span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-600" /> Account Status:
                  </span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  onClick={() => setProfileModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

