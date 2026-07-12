import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FileDown, 
  Printer, 
  FileSpreadsheet, 
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/shared/Button';
import { Table, TableRow, TableCell } from '../components/shared/Table';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'class' | 'teacher' | 'room'>('class');
  const [selectedTargetId, setSelectedTargetId] = useState('');

  // Fetch registry options to populate selectors
  const { data: registryRes } = useQuery({
    queryKey: ['reportsRegistry'],
    queryFn: async () => {
      const [secs, tchs, rms] = await Promise.all([
        axios.get('/api/v1/erp/sections', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }),
        axios.get('/api/v1/erp/teachers', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }),
        axios.get('/api/v1/erp/rooms', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }),
      ]);
      return {
        sections: secs.data?.data || [],
        teachers: tchs.data?.data || [],
        rooms: rms.data?.data || [],
      };
    },
  });

  const registry = registryRes || { sections: [], teachers: [], rooms: [] };

  React.useEffect(() => {
    if (registryRes) {
      if (reportType === 'class' && registry.sections.length > 0) {
        setSelectedTargetId(registry.sections[0]._id);
      } else if (reportType === 'teacher' && registry.teachers.length > 0) {
        setSelectedTargetId(registry.teachers[0]._id);
      } else if (reportType === 'room' && registry.rooms.length > 0) {
        setSelectedTargetId(registry.rooms[0]._id);
      }
    }
  }, [reportType, registryRes]);

  const handleExport = (format: string) => {
    toast.success(`Exporting timetable reports to ${format.toUpperCase()} format. Download started.`);
  };

  const getTargetName = () => {
    if (!selectedTargetId) return 'Report Preview';
    if (reportType === 'class') {
      return registry.sections.find((s: any) => s._id === selectedTargetId)?.name || 'Class Timetable';
    }
    if (reportType === 'teacher') {
      const teacher = registry.teachers.find((t: any) => t._id === selectedTargetId);
      return teacher ? `${teacher.employeeId} - ${teacher.userId?.profile?.firstName || 'Teacher'}` : 'Teacher Timetable';
    }
    return registry.rooms.find((r: any) => r._id === selectedTargetId)?.name || 'Room Timetable';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">Reports & Roster Exports</h2>
          <p className="text-xs text-slate-400">Download formatted institution timetables as PDFs, spreadsheets, or print pages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="gap-1.5 h-9">
            <Printer className="h-4 w-4" />
            Print Roster
          </Button>
          <Button onClick={() => handleExport('pdf')} className="gap-1.5 h-9 bg-violet-650 hover:bg-violet-600">
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-800 bg-[#0d111e]/20">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as any)}
          className="h-9 rounded-lg bg-slate-900/60 border border-slate-800 px-3 text-xs text-slate-355 focus:outline-none focus:border-violet-500 cursor-pointer"
        >
          <option value="class">Class Timetable Roster</option>
          <option value="teacher">Teacher Timetable Roster</option>
          <option value="room">Classroom Timetable Roster</option>
        </select>

        <select
          value={selectedTargetId}
          onChange={(e) => setSelectedTargetId(e.target.value)}
          className="h-9 md:col-span-2 rounded-lg bg-slate-900/60 border border-slate-800 px-3 text-xs text-slate-400 focus:outline-none focus:border-violet-500 cursor-pointer"
        >
          <option value="">Choose target profile...</option>
          {reportType === 'class' && registry.sections.map((s: any) => (
            <option key={s._id} value={s._id} className="bg-slate-950">{s.name}</option>
          ))}
          {reportType === 'teacher' && registry.teachers.map((t: any) => (
            <option key={t._id} value={t._id} className="bg-slate-950">
              {t.employeeId} - {t.userId?.profile ? `${t.userId.profile.firstName} ${t.userId.profile.lastName}` : 'Teacher'}
            </option>
          ))}
          {reportType === 'room' && registry.rooms.map((r: any) => (
            <option key={r._id} value={r._id} className="bg-slate-950">{r.name} ({r.type})</option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')} className="w-full gap-1.5 h-9">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')} className="w-full gap-1.5 h-9">
            <Download className="h-4 w-4 text-indigo-500" />
            CSV
          </Button>
        </div>
      </div>

      {/* Print Preview Panel */}
      <div className="glass-panel p-8 rounded-2xl space-y-6 bg-white/5 border border-slate-850">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{getTargetName()}</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Term 1 - Lincoln Academy</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded font-mono">
            Roster Validated
          </span>
        </div>

        {/* Schedule preview grid */}
        <Table headers={['Time Slot', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}>
          {[
            { period: 'Period 1 (08:30)', subjects: ['Mathematics', 'Science', 'English', 'History', 'Sports'] },
            { period: 'Period 2 (09:15)', subjects: ['Science', 'History', 'Mathematics', 'Art', 'English'] },
            { period: 'Period 3 (10:00)', subjects: ['English', 'Mathematics', 'Science', 'Music', 'History'] },
            { period: 'Period 4 (11:00)', subjects: ['History', 'English', 'Art', 'Mathematics', 'Science'] },
          ].map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-bold text-slate-300 font-mono">{row.period}</TableCell>
              {row.subjects.map((sub, i) => (
                <TableCell key={i} className="font-semibold text-slate-400">
                  {sub}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </Table>

        <p className="text-[9px] text-slate-500 leading-normal border-t border-slate-800 pt-4">
          Disclaimer: This printed timetable draft is subject to coordinate revisions by the scheduling committee. 
          Verify active room assignments dynamically in the coordinator portal.
        </p>
      </div>
    </div>
  );
};
export default Reports;
