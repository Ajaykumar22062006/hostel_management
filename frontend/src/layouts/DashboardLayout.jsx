import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, Bed, MessageSquare, Search, Bell, Menu } from 'lucide-react';
import './DashboardLayout.css'; // Keep existing for any legacy overwrites

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'WARDEN', 'STUDENT'] },
    { path: '/students', label: 'Students', icon: Users, roles: ['ADMIN', 'WARDEN'] },
    { path: '/rooms', label: 'Rooms & Allocations', icon: Bed, roles: ['ADMIN', 'WARDEN'] },
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
                {user?.name ? user.name.charAt(0).toUpperCase() : 'AW'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Admin Warden'}</p>
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
            
            <button className="relative text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </button>

            <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center border border-white shadow-sm transition-transform hover:scale-105">
              <span className="text-white text-xs font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
