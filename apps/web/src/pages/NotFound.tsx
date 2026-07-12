import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#0a0d16] text-slate-100 p-6 relative">
      <div className="absolute inset-0 bg-radial-glow from-violet-900/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center space-y-6 z-10 border border-slate-800/80 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 mx-auto">
          <Sparkles className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-200">Page not found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page you are looking for does not exist or has been moved to a new address.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition-all shadow-md shadow-violet-600/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
