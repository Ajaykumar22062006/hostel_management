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
    <div className="flex bg-slate-950 text-slate-300 min-h-screen font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
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
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] glow-active' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
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
        <div className="p-4 border-t border-slate-800">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800/80">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'AW'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Admin Warden'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 bg-slate-950/50 border border-slate-700/50 text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-slate-600 text-slate-300 transition-all"
              />
            </div>
            
            <button className="relative text-slate-400 hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-800/50">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
                3
              </span>
            </button>

            <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center border-2 border-slate-800 shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-transform hover:scale-105">
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
