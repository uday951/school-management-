import React from 'react';
import { ActivityInputSchema } from '@mahathi/validation';
import { CrudManager, FormField } from '../components/shared/CrudManager';
import { TableRow, TableCell } from '../components/shared/Table';
import { Button } from '../components/shared/Button';
import { Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { IActivity } from '@mahathi/types';

export const Activities: React.FC = () => {
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Activity Name',
      type: 'select',
      options: [
        { value: 'SPORTS', label: 'Sports / Athletics' },
        { value: 'YOGA', label: 'Yoga' },
        { value: 'KARATE', label: 'Karate / Self-Defense' },
        { value: 'DANCE', label: 'Dance' },
        { value: 'MUSIC', label: 'Music Vocal/Instrumental' },
        { value: 'ART', label: 'Fine Arts' },
        { value: 'ROBOTICS', label: 'Robotics & STEM' },
        { value: 'SWIMMING', label: 'Swimming' },
        { value: 'TABLE_TENNIS', label: 'Table Tennis' },
        { value: 'SKATING', label: 'Skating' },
      ],
    },
    { name: 'teacherId', label: 'Instructor User ID Reference', type: 'text' },
    { name: 'roomId', label: 'Location Room ID Reference', type: 'text' },
    { name: 'maxDailyClasses', label: 'Max Classes Allowed Daily', type: 'number' },
  ];

  const defaultValues = {
    name: 'SPORTS',
    teacherId: '',
    roomId: '',
    maxDailyClasses: 2,
  };

  const headers = ['Activity Scope', 'Dedicated Location', 'Coaching Instructor', 'Max Loads', 'Status', 'Actions'];

  const renderRow = (
    item: IActivity,
    onEdit: (item: IActivity) => void,
    onDelete: (item: IActivity) => void,
    onArchive: (item: IActivity) => void
  ) => {
    const instructorEmail = (item.teacherId as any)?.email || item.teacherId || 'Unassigned';
    const roomName = (item.roomId as any)?.name || item.roomId || 'Playground';

    return (
      <TableRow key={item._id}>
        <TableCell className="font-bold text-slate-200">{item.name}</TableCell>
        <TableCell className="font-semibold text-indigo-400">{roomName}</TableCell>
        <TableCell className="font-mono text-slate-400">{instructorEmail}</TableCell>
        <TableCell className="font-semibold">{item.maxDailyClasses} classes/day</TableCell>
        <TableCell>
          <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
            item.isArchived 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {item.isArchived ? 'ARCHIVED' : 'ACTIVE'}
          </span>
        </TableCell>
        <TableCell className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="h-8 w-8 !p-0">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onArchive(item)} className="h-8 w-8 !p-0">
            {item.isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(item)} className="h-8 w-8 !p-0">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="p-8">
      <CrudManager<IActivity>
        entityName="Activity"
        apiEndpoint="/api/v1/erp/activities"
        zodSchema={ActivityInputSchema}
        formFields={formFields}
        defaultValues={defaultValues}
        tableHeaders={headers}
        renderRow={renderRow}
      />
    </div>
  );
};
export default Activities;
