import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Sparkles, Play, Building, GraduationCap, Calendar, AlertTriangle,
  Lock, Unlock, MessageSquare, History, CheckCircle, RefreshCw,
  XCircle, Plus, Trash2, Edit3,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { Skeleton } from '../components/shared/FeedbackStates';

const API_HEADERS = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });
const DRAFT_ID = '668f12a4b89f2d1a3c7e9999';

const DAYS = [
  { num: 1, label: 'Monday' },
  { num: 2, label: 'Tuesday' },
  { num: 3, label: 'Wednesday' },
  { num: 4, label: 'Thursday' },
  { num: 5, label: 'Friday' },
];
const PERIODS = [0, 1, 2, 3, 4, 5, 6, 7];

// ─── Slot Editor Modal ─────────────────────────────────────────────────────────
interface SlotEditorProps {
  isOpen: boolean;
  onClose: () => void;
  day: number | null;
  period: number | null;
  existingSlot: any | null;
  registry: { sections: any[]; teachers: any[]; rooms: any[]; subjects: any[] };
  onSave: (data: any) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

const SlotEditor: React.FC<SlotEditorProps> = ({
  isOpen, onClose, day, period, existingSlot, registry, onSave, onDelete, isSaving, isDeleting,
}) => {
  const [form, setForm] = useState({
    sectionId: existingSlot?.sectionId?._id || existingSlot?.sectionId || '',
    teacherId: existingSlot?.teacherId?._id || existingSlot?.teacherId || '',
    subjectId: existingSlot?.subjectId?._id || existingSlot?.subjectId || '',
    classroomId: existingSlot?.classroomId?._id || existingSlot?.classroomId || '',
  });

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        sectionId: existingSlot?.sectionId?._id || existingSlot?.sectionId || '',
        teacherId: existingSlot?.teacherId?._id || existingSlot?.teacherId || '',
        subjectId: existingSlot?.subjectId?._id || existingSlot?.subjectId || '',
        classroomId: existingSlot?.classroomId?._id || existingSlot?.classroomId || '',
      });
    }
  }, [isOpen, existingSlot]);

  const dayLabel = DAYS.find((d) => d.num === day)?.label || '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingSlot ? 'Edit Period Slot' : 'Add Period Slot'}>
      <div className="space-y-4">
        <p className="text-[11px] text-slate-500 font-semibold">
          {dayLabel} — Period {(period ?? 0) + 1}
        </p>

        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Section / Class', key: 'sectionId', opts: registry.sections.map((s: any) => ({ value: s._id, label: s.name })) },
            { label: 'Subject', key: 'subjectId', opts: registry.subjects.map((s: any) => ({ value: s._id, label: `${s.name} (${s.code})` })) },
            { label: 'Teacher', key: 'teacherId', opts: registry.teachers.map((t: any) => ({ value: t.userId?._id || t._id, label: t.userId?.profile ? `${t.userId.profile.firstName} ${t.userId.profile.lastName}` : 'Teacher' })) },
            { label: 'Classroom / Room', key: 'classroomId', opts: registry.rooms.map((r: any) => ({ value: r._id, label: `${r.name} (${r.type})` })) },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
              <select
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full h-9 rounded-lg bg-slate-900/80 border border-slate-800 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="">Select {label}…</option>
                {opts.map((o) => <option key={o.value} value={o.value} className="bg-slate-950">{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          {existingSlot && (
            <Button
              onClick={onDelete}
              isLoading={isDeleting}
              className="h-9 gap-1.5 bg-rose-700 hover:bg-rose-600 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Slot
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} className="h-9 text-xs">Cancel</Button>
          <Button
            onClick={() => onSave(form)}
            isLoading={isSaving}
            disabled={!form.sectionId || !form.teacherId || !form.subjectId || !form.classroomId}
            className="h-9 gap-1.5 text-xs"
          >
            <Edit3 className="h-3.5 w-3.5" /> Save Slot
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Subject colour palette ────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {};
const PALETTE = [
  'border-violet-700 bg-violet-950/40 text-violet-300',
  'border-indigo-700 bg-indigo-950/40 text-indigo-300',
  'border-emerald-700 bg-emerald-950/40 text-emerald-300',
  'border-amber-700 bg-amber-950/40 text-amber-300',
  'border-rose-700 bg-rose-950/40 text-rose-300',
  'border-cyan-700 bg-cyan-950/40 text-cyan-300',
  'border-pink-700 bg-pink-950/40 text-pink-300',
  'border-teal-700 bg-teal-950/40 text-teal-300',
];
let colorIdx = 0;
const getSubjectColor = (subjectId: string) => {
  if (!SUBJECT_COLORS[subjectId]) {
    SUBJECT_COLORS[subjectId] = PALETTE[colorIdx++ % PALETTE.length];
  }
  return SUBJECT_COLORS[subjectId];
};

// ─── Main Scheduler Component ─────────────────────────────────────────────────
export const Scheduler: React.FC = () => {
  const queryClient = useQueryClient();

  let loggedInUser = null;
  try {
    const uRaw = localStorage.getItem('user');
    loggedInUser = uRaw ? JSON.parse(uRaw) : null;
  } catch { loggedInUser = null; }
  const isTeacher = loggedInUser?.role === 'TEACHER';

  // ── UI state ──
  const [solverOpen, setSolverOpen] = useState(false);
  const [solverMode, setSolverMode] = useState<'fast' | 'balanced' | 'optimal'>('balanced');
  const [viewType, setViewType] = useState<'section' | 'teacher' | 'room'>('section');
  const [selectedId, setSelectedId] = useState('');
  const [lockedCells, setLockedCells] = useState<Record<string, boolean>>({});
  const [nlpPrompt, setNlpPrompt] = useState('');
  const [aiWorking, setAiWorking] = useState(false);
  const [versions] = useState([
    { version: 1, name: 'Initial draft v1.0', time: '10:00 AM' },
    { version: 2, name: 'AI Swapped v2.0', time: '11:15 AM' },
  ]);

  // ── Drag-and-drop state ──
  const dragSlotRef = useRef<any>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // ── Slot editor state ──
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDay, setEditorDay] = useState<number | null>(null);
  const [editorPeriod, setEditorPeriod] = useState<number | null>(null);
  const [editorSlot, setEditorSlot] = useState<any | null>(null);

  // ── Queries ──
  const { data: statusRes, isLoading: isStatusLoading } = useQuery({
    queryKey: ['draftStatus', DRAFT_ID],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/erp/schedules/drafts/${DRAFT_ID}/status`, { headers: API_HEADERS() });
      return res.data;
    },
    refetchInterval: (q) => q.state?.data?.data?.status === 'GENERATING' ? 2000 : false,
  });

  const { data: slotsRes, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['draftSlots', DRAFT_ID],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/erp/schedules/drafts/${DRAFT_ID}/slots`, { headers: API_HEADERS() });
      return res.data;
    },
  });

  const { data: registryRes } = useQuery({
    queryKey: ['schedulerRegistry'],
    queryFn: async () => {
      const [secs, tchs, rms, subs] = await Promise.all([
        axios.get('/api/v1/erp/sections',  { headers: API_HEADERS() }),
        axios.get('/api/v1/erp/teachers',  { headers: API_HEADERS() }),
        axios.get('/api/v1/erp/rooms',     { headers: API_HEADERS() }),
        axios.get('/api/v1/erp/subjects',  { headers: API_HEADERS() }),
      ]);
      return {
        sections: secs.data?.data || [],
        teachers: tchs.data?.data || [],
        rooms:    rms.data?.data  || [],
        subjects: subs.data?.data || [],
      };
    },
  });

  // ── Auto-select first item ──
  React.useEffect(() => {
    if (!registryRes) return;
    if (isTeacher) {
      const myProfile = registryRes.teachers.find(
        (t: any) => t.userId?._id === loggedInUser?.userId || t.userId === loggedInUser?.userId
      );
      // Slots use User IDs for teachers; select the linked user rather than the profile ID.
      if (myProfile) { setViewType('teacher'); setSelectedId(myProfile.userId?._id || myProfile.userId); }
    } else {
      if (viewType === 'section' && registryRes.sections.length > 0) setSelectedId(registryRes.sections[0]._id);
      else if (viewType === 'teacher' && registryRes.teachers.length > 0) setSelectedId(registryRes.teachers[0].userId?._id || registryRes.teachers[0].userId);
      else if (viewType === 'room' && registryRes.rooms.length > 0) setSelectedId(registryRes.rooms[0]._id);
    }
  }, [viewType, registryRes, isTeacher, loggedInUser?.userId]);

  // ── Mutations ──
  const runSolverMutation = useMutation({
    mutationFn: async () => axios.post('/api/v1/erp/schedules/generate', { draftId: DRAFT_ID, mode: solverMode }, { headers: API_HEADERS() }),
    onSuccess: () => { toast.success('Optimization engine spawned.'); queryClient.invalidateQueries({ queryKey: ['draftStatus', DRAFT_ID] }); setSolverOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed to spawn solver.'),
  });

  const resetDraftMutation = useMutation({
    mutationFn: async () => axios.patch(`/api/v1/erp/schedules/drafts/${DRAFT_ID}/reset`, {}, { headers: API_HEADERS() }),
    onSuccess: () => { toast.success('Draft reset — grid restored.'); queryClient.invalidateQueries({ queryKey: ['draftStatus', DRAFT_ID] }); queryClient.invalidateQueries({ queryKey: ['draftSlots', DRAFT_ID] }); },
    onError: () => toast.error('Auto-reset failed. Run: npm run seed'),
  });

  const swapMutation = useMutation({
    mutationFn: async ({ slotAId, slotBId }: { slotAId: string; slotBId: string }) =>
      axios.post('/api/v1/erp/schedules/slots/swap', { draftId: DRAFT_ID, slotAId, slotBId }, { headers: API_HEADERS() }),
    onSuccess: () => { toast.success('Slots swapped!'); queryClient.invalidateQueries({ queryKey: ['draftSlots', DRAFT_ID] }); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Swap failed.'),
  });

  const upsertSlotMutation = useMutation({
    mutationFn: async (data: any) =>
      axios.put('/api/v1/erp/schedules/slots', { draftId: DRAFT_ID, ...data }, { headers: API_HEADERS() }),
    onSuccess: () => { toast.success('Slot saved!'); setEditorOpen(false); queryClient.invalidateQueries({ queryKey: ['draftSlots', DRAFT_ID] }); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Save failed.'),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) =>
      axios.delete(`/api/v1/erp/schedules/slots/${slotId}`, { headers: API_HEADERS() }),
    onSuccess: () => { toast.success('Slot cleared.'); setEditorOpen(false); queryClient.invalidateQueries({ queryKey: ['draftSlots', DRAFT_ID] }); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Delete failed.'),
  });

  const lockMutation = useMutation({
    mutationFn: async (locks: any[]) =>
      axios.post('/api/v1/erp/schedules/slots/lock', { draftId: DRAFT_ID, lockedSlots: locks }, { headers: API_HEADERS() }),
    onSuccess: () => toast.success('Grid locks saved.'),
  });

  // ── Helpers ──
  const draftStatus = statusRes?.data?.status || 'DRAFT';
  const slots: any[] = slotsRes?.data || [];
  const registry = registryRes || { sections: [], teachers: [], rooms: [], subjects: [] };

  const getCellSlot = (day: number, period: number): any | null => {
    return slots.find((s) => {
      if (s.dayOfWeek !== day || s.periodIndex !== period) return false;
      if (viewType === 'section') return s.sectionId?._id === selectedId;
      if (viewType === 'teacher') return s.teacherId?._id === selectedId;
      if (viewType === 'room')    return s.classroomId?._id === selectedId;
      return false;
    }) || null;
  };

  const openEditor = (day: number, period: number, slot: any | null) => {
    if (isTeacher) return;
    setEditorDay(day); setEditorPeriod(period); setEditorSlot(slot); setEditorOpen(true);
  };

  const toggleLock = (day: number, period: number, sectionId: string) => {
    if (isTeacher) return;
    const key = `${day}-${period}-${sectionId}`;
    const newLocks = { ...lockedCells, [key]: !lockedCells[key] };
    setLockedCells(newLocks);
    const lockArray = Object.keys(newLocks).filter((k) => newLocks[k]).map((k) => {
      const [d, p, s] = k.split('-');
      return { dayOfWeek: Number(d), periodIndex: Number(p), sectionId: s };
    });
    lockMutation.mutate(lockArray);
  };

  const handleNlpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpPrompt) return;
    setAiWorking(true);
    const t = toast.loading('Gemini parsing…');
    try {
      await axios.post('/api/v1/erp/schedules/nlp-command', { draftId: DRAFT_ID, prompt: nlpPrompt }, { headers: API_HEADERS() });
      toast.dismiss(t); toast.success('AI command applied!');
      queryClient.invalidateQueries({ queryKey: ['draftSlots', DRAFT_ID] });
      setNlpPrompt('');
    } catch (err: any) {
      toast.dismiss(t); toast.error(err.response?.data?.error?.message || 'AI command failed.');
    } finally { setAiWorking(false); }
  };

  // Conflict detector
  const teacherKeys = new Set<string>();
  const roomKeys = new Set<string>();
  const localConflicts: string[] = [];
  slots.forEach((s: any) => {
    const tKey = `${s.dayOfWeek}-${s.periodIndex}-${s.teacherId?._id}`;
    const rKey = `${s.dayOfWeek}-${s.periodIndex}-${s.classroomId?._id}`;
    if (teacherKeys.has(tKey)) {
      const name = s.teacherId?.profile ? `${s.teacherId.profile.firstName} ${s.teacherId.profile.lastName}` : 'Teacher';
      localConflicts.push(`Double-Booking: ${name} — Day ${s.dayOfWeek}, Period ${s.periodIndex + 1}`);
    } else { teacherKeys.add(tKey); }
    if (roomKeys.has(rKey)) {
      localConflicts.push(`Room Clash: ${s.classroomId?.name} — Day ${s.dayOfWeek}, Period ${s.periodIndex + 1}`);
    } else { roomKeys.add(rKey); }
  });

  // ─── Drag-and-drop handlers ───────────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, slot: any) => {
    dragSlotRef.current = slot;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverKey(key);
  };

  const onDrop = (e: React.DragEvent, targetDay: number, targetPeriod: number) => {
    e.preventDefault();
    setDragOverKey(null);
    const src = dragSlotRef.current;
    if (!src) return;
    if (src.dayOfWeek === targetDay && src.periodIndex === targetPeriod) return;

    // Find the slot already occupying the target cell (if any) for the same view filter
    const targetSlot = getCellSlot(targetDay, targetPeriod);

    if (targetSlot) {
      // Swap the two slots
      swapMutation.mutate({ slotAId: src._id, slotBId: targetSlot._id });
    } else {
      // Move: upsert the dragged slot at the new position
      upsertSlotMutation.mutate({
        dayOfWeek: targetDay,
        periodIndex: targetPeriod,
        sectionId:   src.sectionId?._id  || src.sectionId,
        teacherId:   src.teacherId?._id  || src.teacherId,
        subjectId:   src.subjectId?._id  || src.subjectId,
        classroomId: src.classroomId?._id || src.classroomId,
      });
      // Remove old slot
      deleteSlotMutation.mutate(src._id);
    }
    dragSlotRef.current = null;
  };

  const onDragLeave = () => setDragOverKey(null);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">AI Timetable Grid</h2>
          <p className="text-xs text-slate-400">
            {isTeacher
              ? 'Your personal teaching schedule — read-only.'
              : 'Drag to swap periods · Click empty cell to add · Click slot to edit · Lock slots for protection.'}
          </p>
        </div>
        {!isTeacher && (
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
              draftStatus === 'SUCCESS'   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              draftStatus === 'GENERATING'? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse' :
              draftStatus === 'FAILED'   ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>{draftStatus}</span>

            {draftStatus === 'GENERATING' ? (
              <Button onClick={() => resetDraftMutation.mutate()} isLoading={resetDraftMutation.isPending} className="gap-1.5 h-9 bg-rose-600 hover:bg-rose-500">
                <XCircle className="h-3.5 w-3.5" /> Cancel &amp; Reset
              </Button>
            ) : (
              <Button onClick={() => setSolverOpen(true)} className="gap-1.5 h-9">
                <Play className="h-3.5 w-3.5" /> Trigger AI Solver
              </Button>
            )}
          </div>
        )}
      </div>

      {/* GENERATING banner */}
      {draftStatus === 'GENERATING' && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-indigo-800/40 bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin" />
            <div>
              <p className="text-xs font-bold text-indigo-300">AI Solver Running…</p>
              <p className="text-[10px] text-indigo-500 mt-0.5">
                The Python optimizer is running in the background (max 30s). Click <strong>Cancel &amp; Reset</strong> to restore the pre-built grid immediately.
              </p>
            </div>
          </div>
          <Button onClick={() => resetDraftMutation.mutate()} isLoading={resetDraftMutation.isPending} className="shrink-0 gap-1.5 h-9 bg-rose-600 hover:bg-rose-500 text-xs">
            <XCircle className="h-3.5 w-3.5" /> Cancel &amp; Reset
          </Button>
        </div>
      )}

      {/* NLP Command bar */}
      {!isTeacher && (
        <form onSubmit={handleNlpSubmit} className="flex gap-2 p-3 rounded-xl border border-violet-900/30 bg-violet-950/5">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-violet-400" />
            <input
              type="text" value={nlpPrompt}
              onChange={(e) => setNlpPrompt(e.target.value)}
              disabled={aiWorking}
              placeholder='AI command: e.g. "Move PHYS to Monday morning" or "Swap Math with Chemistry"…'
              className="h-9 w-full rounded-lg bg-slate-900/80 border border-slate-850 pl-9 pr-4 text-xs focus:outline-none focus:border-violet-500 text-slate-300"
            />
          </div>
          <Button type="submit" isLoading={aiWorking} className="h-9 gap-1.5 bg-violet-650 hover:bg-violet-600 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Execute AI Command
          </Button>
        </form>
      )}

      {/* View filter toolbar */}
      {isTeacher ? (
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d111e]/20 text-xs font-bold text-slate-400 flex items-center gap-2">
          <GraduationCap className="h-4.5 w-4.5 text-indigo-400" />
          Schedule for: {loggedInUser?.profile ? `${loggedInUser.profile.firstName} ${loggedInUser.profile.lastName}` : loggedInUser?.email}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-800 bg-[#0d111e]/20">
          <select value={viewType} onChange={(e) => setViewType(e.target.value as any)}
            className="h-9 rounded-lg bg-slate-900/60 border border-slate-800 px-3 text-xs text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer">
            <option value="section">Class view</option>
            <option value="teacher">Teacher view</option>
            <option value="room">Classroom view</option>
          </select>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
            className="h-9 md:col-span-2 rounded-lg bg-slate-900/60 border border-slate-800 px-3 text-xs text-slate-400 focus:outline-none focus:border-violet-500 cursor-pointer">
            <option value="">Select profile…</option>
            {viewType === 'section' && registry.sections.map((s: any) => <option key={s._id} value={s._id} className="bg-slate-950">{s.name}</option>)}
            {viewType === 'teacher' && registry.teachers.map((t: any) => <option key={t._id} value={t.userId?._id || t.userId} className="bg-slate-950">{t.employeeId} — {t.userId?.profile ? `${t.userId.profile.firstName} ${t.userId.profile.lastName}` : 'Teacher'}</option>)}
            {viewType === 'room'    && registry.rooms.map((r: any) => <option key={r._id} value={r._id} className="bg-slate-950">{r.name} ({r.type})</option>)}
          </select>
          <p className="text-[10px] text-slate-600 flex items-center gap-1.5 col-span-1">
            <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />Drag to swap · Click to edit
          </p>
        </div>
      )}

      {/* Main content */}
      {isSlotsLoading || isStatusLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Calendar grid */}
          <div className={`${isTeacher ? 'lg:col-span-4' : 'lg:col-span-3'} overflow-x-auto rounded-2xl border border-slate-800 bg-[#0d111e]/10`}>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none">
                  <th className="p-4 border-r border-slate-800 w-20">Period</th>
                  {DAYS.map((day) => <th key={day.num} className="p-4">{day.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {PERIODS.map((period) => (
                  <tr key={period} className="hover:bg-slate-900/10 transition-colors">
                    <td className="p-4 border-r border-slate-850 font-mono text-[10px] font-bold text-slate-500 align-middle whitespace-nowrap">
                      P{period + 1}
                    </td>
                    {DAYS.map((day) => {
                      const cell = getCellSlot(day.num, period);
                      const cellKey = `${day.num}-${period}`;
                      const isLocked = cell ? lockedCells[`${day.num}-${period}-${cell.sectionId?._id}`] : false;
                      const isDragTarget = dragOverKey === cellKey;
                      const colorClass = cell ? getSubjectColor(cell.subjectId?._id || cell.subjectId) : '';

                      return (
                        <td
                          key={day.num}
                          className={`p-2 text-xs align-top h-24 max-w-[150px] transition-all ${isDragTarget ? 'bg-violet-950/20' : ''}`}
                          onDragOver={(e) => !isTeacher && onDragOver(e, cellKey)}
                          onDrop={(e) => !isTeacher && onDrop(e, day.num, period)}
                          onDragLeave={onDragLeave}
                        >
                          {cell ? (
                            <div
                              draggable={!isTeacher && !isLocked}
                              onDragStart={(e) => !isTeacher && !isLocked && onDragStart(e, cell)}
                              onClick={() => !isLocked && openEditor(day.num, period, cell)}
                              className={`h-full rounded-xl border p-2.5 space-y-1 relative group transition-all duration-200 ${colorClass} ${
                                isLocked ? 'opacity-60 cursor-not-allowed' :
                                isTeacher ? 'cursor-default' :
                                'hover:scale-[1.02] cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-black/30'
                              }`}
                            >
                              <span className="block font-bold truncate text-[11px]">
                                {cell.subjectId?.name || 'Subject'}
                              </span>
                              <div className="flex flex-col gap-0.5 text-[9px] opacity-80 font-medium">
                                {viewType !== 'teacher' && (
                                  <span className="truncate flex items-center gap-1">
                                    <GraduationCap className="h-3 w-3 shrink-0" />
                                    {cell.teacherId?.profile ? `${cell.teacherId.profile.firstName} ${cell.teacherId.profile.lastName}` : 'Teacher'}
                                  </span>
                                )}
                                {viewType !== 'room' && (
                                  <span className="truncate flex items-center gap-1">
                                    <Building className="h-3 w-3 shrink-0" />
                                    {cell.classroomId?.name || 'Room'}
                                  </span>
                                )}
                                {viewType !== 'section' && (
                                  <span className="truncate flex items-center gap-1">
                                    <Calendar className="h-3 w-3 shrink-0" />
                                    {cell.sectionId?.name || 'Section'}
                                  </span>
                                )}
                              </div>

                              {/* Lock toggle */}
                              {!isTeacher && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleLock(day.num, period, cell.sectionId?._id); }}
                                  className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {isLocked
                                    ? <Lock className="h-3 w-3 text-amber-400" />
                                    : <Unlock className="h-3 w-3 opacity-50 hover:opacity-100" />}
                                </button>
                              )}
                            </div>
                          ) : (
                            /* Empty cell — click to add */
                            <div
                              onClick={() => !isTeacher && openEditor(day.num, period, null)}
                              className={`h-full flex items-center justify-center border border-dashed rounded-xl transition-all ${
                                isDragTarget
                                  ? 'border-violet-500 bg-violet-950/30'
                                  : isTeacher
                                  ? 'border-slate-900 text-slate-800'
                                  : 'border-slate-900 text-slate-700 hover:border-slate-700 hover:text-slate-500 cursor-pointer'
                              }`}
                            >
                              {!isTeacher && (
                                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                                  {isDragTarget ? '↓ Drop here' : <><Plus className="h-3 w-3" /> Add</>}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sidebar */}
          {!isTeacher && (
            <div className="space-y-6">
              {/* Conflicts */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Live Conflicts
                </h3>
                {localConflicts.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-emerald-950/10 border border-emerald-950/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> 100% Conflict Free
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {localConflicts.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-rose-950/15 border border-rose-950/20 text-[10px] text-rose-350 leading-normal flex gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-white">Subject Legend</h3>
                <div className="space-y-2">
                  {registry.subjects.map((s: any) => (
                    <div key={s._id} className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded shrink-0 border ${getSubjectColor(s._id).split(' ')[0]} ${getSubjectColor(s._id).split(' ')[1]}`} />
                      <span className="text-[10px] text-slate-400 font-medium">{s.name}</span>
                      <span className="text-[9px] text-slate-600 font-mono ml-auto">{s.code}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Versions */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <History className="h-4 w-4 text-indigo-400" /> Version Rollbacks
                </h3>
                <div className="space-y-2">
                  {versions.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-colors">
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-200">{v.name}</h4>
                        <span className="text-[9px] text-slate-500 font-semibold">{v.time}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold">Restore</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slot Editor Modal */}
      <SlotEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        day={editorDay}
        period={editorPeriod}
        existingSlot={editorSlot}
        registry={registry}
        onSave={(data) => upsertSlotMutation.mutate({ dayOfWeek: editorDay, periodIndex: editorPeriod, ...data })}
        onDelete={() => editorSlot && deleteSlotMutation.mutate(editorSlot._id)}
        isSaving={upsertSlotMutation.isPending}
        isDeleting={deleteSlotMutation.isPending}
      />

      {/* Solver Modal */}
      <Modal isOpen={solverOpen} onClose={() => setSolverOpen(false)} title="Run AI Scheduler Optimization">
        <div className="space-y-4">
          <p className="text-[11px] text-slate-400 leading-normal">
            Choose solver search intensity. Locked slots will be held constant. The solver runs as a background Python process.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'fast', title: 'Fast', desc: '5s / 1 thread' },
              { id: 'balanced', title: 'Balanced', desc: '15s / 4 threads' },
              { id: 'optimal', title: 'Optimal', desc: '30s / 8 threads' },
            ].map((m) => (
              <button key={m.id} type="button" onClick={() => setSolverMode(m.id as any)}
                className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${solverMode === m.id ? 'border-violet-500 bg-violet-600/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'}`}>
                <h4 className="text-xs font-bold text-white">{m.title}</h4>
                <span className="block text-[9px] text-slate-500 font-mono">{m.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Button variant="outline" onClick={() => setSolverOpen(false)} className="flex-1 h-9">Cancel</Button>
            <Button onClick={() => runSolverMutation.mutate()} isLoading={runSolverMutation.isPending} className="flex-1 h-9">Run optimization</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Scheduler;
