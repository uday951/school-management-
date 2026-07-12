import React from 'react';
import { 
  Building, 
  Sparkles, 
  TrendingUp,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Table, TableRow, TableCell } from '../components/shared/Table';

export const Analytics: React.FC = () => {
  return (
    <div className="p-8 space-y-8 flex-1">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-white leading-tight">Optimization Analytics Dashboard</h2>
        <p className="text-xs text-slate-400">Evaluate teacher workloads, room saturation curves, and optimization coefficients.</p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Timetable Health', value: '94.2%', desc: 'Soft constraints satisf.', icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/5' },
          { label: 'Teacher Load Balance', value: '88.5%', desc: 'Min workload dispersion', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Room Utilization', value: '72.4%', desc: 'Roster active seats ratio', icon: Building, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
          { label: 'Resolved Conflicts', value: '14 Clashes', desc: 'Auto-resolved in v2.0', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5' },
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
                <p className="text-[9px] text-slate-500 font-semibold">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart and Heatmaps grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Load Dispersion Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Teacher Workload Utilization</h3>
              <p className="text-[10px] text-slate-500">Scheduled teaching loads vs maximum weekly caps (periods/wk)</p>
            </div>
            <span className="text-[10px] text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              Active Term
              <TrendingUp className="h-3 w-3" />
            </span>
          </div>

          {/* SVG Load Bar Dispersion Chart */}
          <div className="space-y-4 pt-2">
            {[
              { name: 'Dr. Clara (Physics)', actual: 24, max: 30, color: 'bg-violet-500' },
              { name: 'Prof. John (Maths)', actual: 28, max: 30, color: 'bg-indigo-500' },
              { name: 'Mrs. Ravi (English)', actual: 18, max: 24, color: 'bg-emerald-500' },
              { name: 'Mr. David (Chemistry)', actual: 22, max: 30, color: 'bg-rose-500' },
            ].map((t, idx) => {
              const percentage = (t.actual / t.max) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-350">
                    <span>{t.name}</span>
                    <span>{t.actual} / {t.max} periods</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-850">
                    <div className={`h-full rounded-full ${t.color}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classroom Saturation Heatmap Grid */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Classroom Utilization Heatmap</h3>
            <p className="text-[10px] text-slate-500">Period slot occupancy rates across rooms</p>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {/* mock 25 cells for heatmap (5 days x 5 rooms) */}
            {Array.from({ length: 25 }).map((_, idx) => {
              // generate mock intensity colors
              const colors = [
                'bg-slate-900 border-slate-850', // empty
                'bg-violet-950/20 border-violet-900/10 text-violet-400', // low
                'bg-violet-900/35 border-violet-800/10 text-violet-300', // medium
                'bg-violet-750/50 border-violet-600/20 text-violet-200', // high
                'bg-violet-500 border-violet-400/25 text-white', // full
              ];
              const intensity = (idx % 3) + 1;
              return (
                <div 
                  key={idx} 
                  className={`h-9 rounded-lg border flex items-center justify-center font-mono text-[9px] font-bold select-none ${colors[intensity]}`}
                  title={`Occupancy: ${intensity * 25}%`}
                >
                  {intensity * 25}%
                </div>
              );
            })}
          </div>
          <p className="text-[8px] text-slate-600 text-center select-none pt-2">
            Low (25%) ─── Medium (50%) ─── High (75%) ─── Full (100%)
          </p>
        </div>
      </div>

      {/* Constraints Statistics table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Soft Constraints Quality Log</h3>
          <p className="text-[10px] text-slate-500">Penalty metrics computed by OR-Tools branch evaluations</p>
        </div>

        <Table headers={['Constraint Metric', 'Penalty Weight', 'Occurrences', 'Normalized Status']}>
          {[
            { metric: 'Teacher idle period gap (window hour)', weight: 10, count: 4, status: 'Satisfactory' },
            { metric: 'Subject sequence contiguous double-period', weight: 8, count: 2, status: 'Excellent' },
            { metric: 'Mathematics taught before lunch', weight: 5, count: 1, status: 'Excellent' },
            { metric: 'Sports held in afternoon slots', weight: 4, count: 3, status: 'Excellent' },
          ].map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-semibold text-slate-200">{row.metric}</TableCell>
              <TableCell className="font-bold text-amber-500 font-mono">-{row.weight * row.count} pts</TableCell>
              <TableCell className="font-semibold">{row.count} instances</TableCell>
              <TableCell>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </div>
  );
};
export default Analytics;
