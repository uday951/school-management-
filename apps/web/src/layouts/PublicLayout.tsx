import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-slate-100 flex flex-col justify-between">
      {/* Public Header */}
      <header className="h-16 border-b border-slate-800/40 bg-[#0d111e]/20 px-8 flex items-center justify-between backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white">Mahathi Timetable</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            Login
          </Link>
          <Link to="/register" className="text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-violet-600/10">
            Get Started
          </Link>
        </div>
      </header>

      {/* Content wrapper */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-[#06080e]/60 text-center text-[10px] text-slate-500 font-medium select-none">
        &copy; {new Date().getFullYear()} Mahathi School Timetable Engine. All rights reserved.
      </footer>
    </div>
  );
};
export default PublicLayout;
