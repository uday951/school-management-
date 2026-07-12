import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0d16] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[50vh] w-[50vw] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50vh] w-[50vw] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main card box */}
      <div className="w-full max-w-md space-y-6 z-10">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/25 mb-4 hover:scale-[1.03] transition-transform">
            <Sparkles className="h-6 w-6 text-white" />
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Mahathi Scheduler</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            AI-Driven School Timetable Optimization
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
