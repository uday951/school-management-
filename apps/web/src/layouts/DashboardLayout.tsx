import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  Sliders, 
  Sparkles, 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  Building2,
  BookOpen,
  Activity,
  CalendarDays, ClipboardCheck, GraduationCap, CalendarOff, PackageCheck, Layers3
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { CommandPalette } from '../components/CommandPalette';
import { Toaster, toast } from 'react-hot-toast';

export const DashboardLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    toast.success('Successfully logged out.');
    navigate('/login');
  };
  const goTo = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Map route path to clean header label
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  let u = null;
  try {
    const userRaw = localStorage.getItem('user');
    u = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    u = null;
  }
  const role = u?.role || 'TEACHER';

  const canManage = ['COORDINATOR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'].includes(role);
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ...(canManage ? [
      { label: 'Rooms', icon: Building2, path: '/dashboard/rooms' },
      { label: 'Sections', icon: Users, path: '/dashboard/sections' },
      { label: 'Subjects', icon: BookOpen, path: '/dashboard/subjects' },
      { label: 'Teachers', icon: Users, path: '/dashboard/teachers' },
      { label: 'Students', icon: Users, path: '/dashboard/students' },
      { label: 'Activities', icon: Activity, path: '/dashboard/activities' },
      { label: 'Constraints', icon: Sliders, path: '/dashboard/constraints' },
    ] : []),
    { label: 'Scheduler', icon: CalendarRange, path: '/dashboard/scheduler' },
  ];
  const operationalItems = [
    { label: 'Campus', icon: Building2, path: '/dashboard/branches' },
    { label: 'Subject Groups', icon: Layers3, path: '/dashboard/subject-groups' },
    { label: 'Class Batches', icon: Users, path: '/dashboard/batches' },
    { label: 'Holidays', icon: CalendarOff, path: '/dashboard/holidays' },
    { label: 'Events', icon: CalendarDays, path: '/dashboard/events' },
    { label: 'Absences', icon: ClipboardCheck, path: '/dashboard/absences' },
    { label: 'Exams', icon: GraduationCap, path: '/dashboard/exams' },
    { label: 'Attendance', icon: ClipboardCheck, path: '/dashboard/attendance' },
    { label: 'Homework', icon: BookOpen, path: '/dashboard/homework' },
    { label: 'Bookings', icon: PackageCheck, path: '/dashboard/bookings' },
  ];

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-background text-foreground font-sans">
      <Toaster position="top-right" toastOptions={{
        className: 'glass-panel text-slate-200 text-xs border border-slate-800',
        style: { background: 'rgba(13, 17, 30, 0.9)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.05)' }
      }} />

      {/* Command Palette spotlight */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
        onNavigate={(route) => navigate(`/dashboard/${route === 'dashboard' ? '' : route}`)}
      />

      {sidebarOpen && <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-[1px] md:hidden" />}

      {/* Sidebar Nav */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] min-h-0 shrink-0 flex-col border-r border-slate-800/50 bg-[#0d111e]/95 p-5 shadow-2xl transition-all duration-300 md:relative md:z-30 md:shadow-none ${
        sidebarOpen ? 'w-72 translate-x-0 md:w-64' : '-translate-x-full md:w-20 md:translate-x-0'
      }`}>
        <div className="space-y-8 min-h-0 flex flex-col flex-1">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg text-white hover:scale-[1.03] transition-all shrink-0"
            >
              <Sparkles className="h-5 w-5" />
            </button>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide text-white">Mahathi</h2>
                <span className="text-[10px] text-indigo-400 font-medium">Timetable System</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
              return (
                <button
                  key={item.label}
                  onClick={() => goTo(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
            {canManage && (
              <>
                <button onClick={() => setOperationsOpen((open) => !open)} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800/40 hover:text-slate-200">
                  <PackageCheck className="h-4.5 w-4.5 shrink-0" />
                  {sidebarOpen && <><span className="flex-1 text-left">Operations</span><ChevronDown className={`h-3.5 w-3.5 transition-transform ${operationsOpen ? 'rotate-180' : ''}`} /></>}
                </button>
                {(operationsOpen || !sidebarOpen) && operationalItems.map((item) => {
                  const Icon = item.icon; const isActive = location.pathname === item.path;
                  return <button key={item.label} title={item.label} onClick={() => goTo(item.path)} className={`flex w-full items-center gap-3 rounded-xl py-2 text-xs font-semibold transition-all ${sidebarOpen ? 'pl-9 pr-3.5' : 'justify-center px-3'} ${isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}><Icon className="h-4 w-4 shrink-0" />{sidebarOpen && <span>{item.label}</span>}</button>;
                })}
              </>
            )}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-3.5">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            {sidebarOpen && <span>Toggle Theme</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 text-rose-400" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main workspace content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/50 bg-[#0d111e]/40 px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} aria-label="Open navigation" className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-300 md:hidden"><Menu className="h-4 w-4" /></button>
            <span className="text-xs text-slate-400 font-medium">Home</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex items-center gap-4.5">
            {/* Search Bar / Ctrl+K badge */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center justify-between h-9 w-60 rounded-xl bg-slate-900 border border-slate-850 px-3 text-[10px] text-slate-500 hover:border-slate-800 transition-colors text-left"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Search className="h-3.5 w-3.5" />
                Spotlight Search...
              </span>
              <kbd className="h-5 rounded bg-slate-850 border border-slate-800 px-1.5 font-mono text-[9px] text-slate-400 flex items-center justify-center">
                Ctrl K
              </kbd>
            </button>

            {/* Notification bell popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="h-9 w-9 rounded-xl border border-slate-800/80 hover:bg-slate-800/30 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-72 glass-panel border border-slate-850 rounded-2xl shadow-2xl p-4 z-40 text-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white">System Notifications</span>
                    <button onClick={() => setNotificationsOpen(false)} className="text-[10px] text-indigo-400 font-semibold hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { title: 'Schedule Published', desc: 'Draft v2.2 made active for Term 1.', date: '10m ago' },
                      { title: 'Absence Cover Requested', desc: 'Mrs. Jane on sick leave cover.', date: '1h ago' },
                    ].map((n, i) => (
                      <div key={i} className="p-2 bg-slate-900/30 rounded-lg space-y-0.5">
                        <h4 className="font-bold text-slate-200">{n.title}</h4>
                        <p className="text-[10px] text-slate-400 leading-normal">{n.desc}</p>
                        <span className="text-[9px] text-slate-600 block">{n.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            {(() => {
              const initials = u?.profile?.firstName 
                ? `${u.profile.firstName[0]}${u.profile.lastName?.[0] || ''}`.toUpperCase() 
                : 'U';
              return (
                <div 
                  className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none"
                  title={u?.email || 'User Profile'}
                >
                  {initials}
                </div>
              );
            })()}
          </div>
        </header>

        {/* Dashboard inner routes placeholder */}
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
