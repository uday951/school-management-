import React from 'react';
import { z } from 'zod';
import { Archive, Edit2, RotateCcw, Trash2 } from 'lucide-react';
import { CrudManager, FormField } from '../components/shared/CrudManager';
import { Button } from '../components/shared/Button';
import { TableCell, TableRow } from '../components/shared/Table';

export interface OperationalPageProps { title: string; endpoint: string; fields: FormField[]; headers?: string[]; defaults?: Record<string, any>; }
type Entity = { _id: string; isArchived?: boolean; [key: string]: any };

/** Reusable admin screen for operational ERP modules. Relationship IDs are accepted as Mongo IDs. */
export const OperationalPage: React.FC<OperationalPageProps> = ({ title, endpoint, fields, headers = ['Name', 'Details', 'Status', 'Actions'], defaults }) => {
  const values = defaults ?? Object.fromEntries(fields.map((field) => [field.name, field.type === 'number' ? 0 : field.type === 'checkbox' ? false : '']));
  return <div className="p-8"><CrudManager<Entity>
    entityName={title} apiEndpoint={endpoint} zodSchema={z.object({}).passthrough()} formFields={fields} defaultValues={values} tableHeaders={headers}
    renderRow={(item, onEdit, onDelete, onArchive) => <TableRow key={item._id}>
      <TableCell className="font-bold text-slate-200">{item.name || item.title || item.resourceName || item.code || 'Record'}</TableCell>
      <TableCell className="max-w-[26rem] truncate">{item.type || item.status || item.reason || item.description || item.email || '—'}</TableCell>
      <TableCell><span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${item.isArchived ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{item.isArchived ? 'ARCHIVED' : item.status || 'ACTIVE'}</span></TableCell>
      <TableCell className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="h-8 w-8 !p-0"><Edit2 className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => onArchive(item)} className="h-8 w-8 !p-0">{item.isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}</Button><Button variant="destructive" size="sm" onClick={() => onDelete(item)} className="h-8 w-8 !p-0"><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
    </TableRow>}
  /></div>;
};

export const operationalConfigs: Record<string, OperationalPageProps> = {
  branches: { title: 'Branch', endpoint: '/api/v1/erp/branches', fields: [{ name: 'name', label: 'Branch name', type: 'text' }, { name: 'code', label: 'Branch code', type: 'text' }, { name: 'address', label: 'Address', type: 'text' }] },
  buildings: { title: 'Building', endpoint: '/api/v1/erp/buildings', fields: [{ name: 'name', label: 'Building name', type: 'text' }, { name: 'branchId', label: 'Branch ID', type: 'text' }, { name: 'code', label: 'Building code', type: 'text' }] },
  floors: { title: 'Floor', endpoint: '/api/v1/erp/floors', fields: [{ name: 'name', label: 'Floor name', type: 'text' }, { name: 'number', label: 'Floor number', type: 'number' }, { name: 'buildingId', label: 'Building ID', type: 'text' }] },
  subjectGroups: { title: 'Subject Group', endpoint: '/api/v1/erp/subject-groups', fields: [{ name: 'name', label: 'Group name', type: 'text' }, { name: 'code', label: 'Group code', type: 'text' }, { name: 'selectionRule', label: 'Selection rule', type: 'select', options: [{ value: 'ONE', label: 'Choose one' }, { value: 'ALL', label: 'All subjects' }, { value: 'MIN_MAX', label: 'Minimum / maximum' }] }] },
  batches: { title: 'Class Batch', endpoint: '/api/v1/erp/batches', fields: [{ name: 'name', label: 'Batch name', type: 'text' }, { name: 'sectionId', label: 'Section ID', type: 'text' }, { name: 'capacity', label: 'Capacity', type: 'number' }, { name: 'purpose', label: 'Purpose', type: 'select', options: [{ value: 'LAB', label: 'Lab' }, { value: 'LANGUAGE', label: 'Language' }, { value: 'ELECTIVE', label: 'Elective' }, { value: 'CUSTOM', label: 'Custom' }] }] },
  holidays: { title: 'Holiday', endpoint: '/api/v1/erp/holidays', fields: [{ name: 'name', label: 'Holiday name', type: 'text' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'endDate', label: 'End date', type: 'date' }, { name: 'type', label: 'Type', type: 'select', options: [{ value: 'SCHOOL', label: 'School' }, { value: 'NATIONAL', label: 'National' }, { value: 'WEATHER', label: 'Weather' }, { value: 'EMERGENCY', label: 'Emergency' }] }] },
  events: { title: 'Event', endpoint: '/api/v1/erp/events', fields: [{ name: 'name', label: 'Event name', type: 'text' }, { name: 'type', label: 'Event type', type: 'select', options: [{ value: 'SPORTS_DAY', label: 'Sports day' }, { value: 'WORKSHOP', label: 'Workshop' }, { value: 'GUEST_LECTURE', label: 'Guest lecture' }, { value: 'OTHER', label: 'Other' }] }, { name: 'startAt', label: 'Starts', type: 'date' }, { name: 'endAt', label: 'Ends', type: 'date' }] },
  absences: { title: 'Teacher Absence', endpoint: '/api/v1/erp/teacher-absences', fields: [{ name: 'teacherId', label: 'Teacher ID', type: 'text' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'endDate', label: 'End date', type: 'date' }, { name: 'reason', label: 'Reason', type: 'text' }] },
  homework: { title: 'Homework', endpoint: '/api/v1/erp/homework', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'sectionId', label: 'Section ID', type: 'text' }, { name: 'teacherId', label: 'Teacher ID', type: 'text' }, { name: 'dueAt', label: 'Due date', type: 'date' }] },
  attendance: { title: 'Attendance', endpoint: '/api/v1/erp/attendance', fields: [{ name: 'sectionId', label: 'Section ID', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'periodIndex', label: 'Period index', type: 'number' }, { name: 'markedBy', label: 'Marked by user ID', type: 'text' }] },
  exams: { title: 'Exam Timetable', endpoint: '/api/v1/erp/exam-timetables', fields: [{ name: 'name', label: 'Exam name', type: 'text' }, { name: 'termId', label: 'Academic term ID', type: 'text' }] },
  bookings: { title: 'Resource Booking', endpoint: '/api/v1/erp/resource-bookings', fields: [{ name: 'resourceName', label: 'Resource name', type: 'text' }, { name: 'resourceType', label: 'Type', type: 'select', options: [{ value: 'PROJECTOR', label: 'Projector' }, { value: 'SMARTBOARD', label: 'Smartboard' }, { value: 'VEHICLE', label: 'Vehicle' }, { value: 'EQUIPMENT', label: 'Equipment' }, { value: 'ROOM', label: 'Room' }] }, { name: 'startsAt', label: 'Starts', type: 'date' }, { name: 'endsAt', label: 'Ends', type: 'date' }, { name: 'requestedBy', label: 'Requested by user ID', type: 'text' }] },
};
