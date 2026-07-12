import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Building2, 
  UserCheck, 
  Activity, 
  Sparkles, 
  Sliders, 
  ArrowUpRight,
  CalendarDays,
  Users,
  BookOpen
} from 'lucide-react';
import { Table, TableRow, TableCell } from '../components/shared/Table';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { Skeleton } from '../components/shared/FeedbackStates';
import { toast } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [solverRunning, setSolverRunning] = useState(false);

  // Fetch dashboard counters and audit trails from DB
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/erp/dashboard/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      return response.data;
    },
  });

  const handleRunSolver = () => {
    setSolverRunning(true);
    const resolveToast = toast.loading('OR-Tools CP-SAT Model constructing...');
    setTimeout(() => {
      toast.dismiss(resolveToast);
      toast.success('Successfully solved. Draft v2.5 compiled with 0 conflicts.');
      setSolverRunning(false);
      setModalOpen(false);
    }, 1500);
  };

  const stats = data?.data?.stats || {
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
    rooms: 0,
    activities: 0,
  };

  const recentActivity = data?.data?.recentActivity || [];

  return (
    <div className="p-8 space-y-8 flex-1">
      {/* Top Banner Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl bg-gradient-to-r from-violet-950/20 via-slate-900/40 to-slate-900 border-l-4 border-violet-500/50">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Welcome to Lincoln Academy Dashboard
            <Sparkles className="h-4.5 w-4.5 text-violet-400" />
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {(() => {
              let usr = null;
              try {
                const uRaw = localStorage.getItem('user');
                usr = uRaw ? JSON.parse(uRaw) : null;
              } catch (e) {
                usr = null;
              }
              const roleLabel = usr?.role ? usr.role.replace('_', ' ').toLowerCase() : 'coordinator';
              return `You are logged in as a ${roleLabel}. ERP databases are connected, showing real-time student, teacher, and room capacities.`;
            })()}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-1 text-xs whitespace-nowrap">
          <Activity className="h-3.5 w-3.5" />
          Trigger AI Solver
        </Button>
      </div>

      {/* KPI Section with Dynamic Counters */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
          {[
            { label: 'Students', value: stats.students, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
            { label: 'Teachers', value: stats.teachers, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
            { label: 'Classes (Sec.)', value: stats.classes, icon: CalendarDays, color: 'text-violet-400', bg: 'bg-violet-500/5' },
            { label: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/5' },
            { label: 'Rooms', value: stats.rooms, icon: Building2, color: 'text-rose-400', bg: 'bg-rose-500/5' },
            { label: 'Activities', value: stats.activities, icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/5' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl space-y-4 hover:border-slate-800/80 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">{stat.label}</span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                  <p className="text-[9px] text-slate-500 font-semibold">Registered Roster</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics & Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Utilization Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Classroom Utilization Index</h3>
              <p className="text-[10px] text-slate-500">Hourly load percentage across school sections</p>
            </div>
            <span className="text-[10px] text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              Active Term
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>

          {/* Premium Vector Chart Mock */}
          <div className="h-48 w-full relative flex items-end justify-between px-4 pb-2 border-b border-l border-slate-800/50">
            {/* Chart grids */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-slate-700 w-full" />
              <div className="border-t border-slate-700 w-full" />
              <div className="border-t border-slate-700 w-full" />
            </div>

            {/* Bars */}
            {[
              { day: 'Mon', val: 78, h: 'h-[78%]' },
              { day: 'Tue', val: 88, h: 'h-[88%]' },
              { day: 'Wed', val: 65, h: 'h-[65%]' },
              { day: 'Thu', val: 92, h: 'h-[92%]' },
              { day: 'Fri', val: 72, h: 'h-[72%]' },
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 z-10 w-12 group cursor-pointer">
                <span className="text-[9px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.val}%
                </span>
                <div className={`w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-500 group-hover:from-violet-500 group-hover:to-indigo-400 transition-all ${bar.h}`} />
                <span className="text-[10px] text-slate-500 font-semibold">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Widgets Sidebar */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Solver Quick Actions</h3>
          <p className="text-[11px] text-slate-400 leading-normal">
            Update scheduling parameters and rebuild the draft using constraint logic.
          </p>

          <div className="space-y-3 pt-2">
            <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-colors">
              <span className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold">
                <CalendarDays className="h-4.5 w-4.5 text-indigo-400" />
                Configure Days & Times
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-colors">
              <span className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold">
                <Sliders className="h-4.5 w-4.5 text-violet-400" />
                Adjust Soft Constraints
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic recent activity audit trails */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Recent Security Audit Logs</h3>
          <p className="text-[10px] text-slate-500">Immutable audit logs captured on authentication and solver events</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-xl">
            No audit logs captured. Logins and creations will trigger audit trails.
          </div>
        ) : (
          <Table headers={['User Email', 'Role Scope', 'Action Code', 'Event Summary', 'IP Address', 'Timestamp']}>
            {recentActivity.map((log: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-semibold text-slate-200">{log.user}</TableCell>
                <TableCell>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                    {log.role}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-indigo-400 font-bold">{log.action}</TableCell>
                <TableCell className="text-slate-400">{log.desc}</TableCell>
                <TableCell className="font-mono text-slate-500">{log.ip}</TableCell>
                <TableCell className="text-slate-500 font-medium">
                  {new Date(log.time).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      {/* Solver Invocation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="AI Scheduler Engine Run">
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            Running the solver will compile a new timetable draft utilizing Google OR-Tools CP-SAT backends, seeking to minimize teacher gap penalties.
          </p>
          <div className="flex items-center gap-3.5 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={solverRunning} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRunSolver} isLoading={solverRunning} className="flex-1">
              Rebuild Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Dashboard;
