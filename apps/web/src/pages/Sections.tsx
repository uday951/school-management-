import React from 'react';
import { SectionInputSchema } from '@mahathi/validation';
import { CrudManager, FormField } from '../components/shared/CrudManager';
import { TableRow, TableCell } from '../components/shared/Table';
import { Button } from '../components/shared/Button';
import { Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { ISection } from '@mahathi/types';

export const Sections: React.FC = () => {
  const formFields: FormField[] = [
    { name: 'gradeId', label: 'Grade Reference ID', type: 'text' },
    { name: 'name', label: 'Section Label', type: 'text' },
    { name: 'classTeacherId', label: 'Class Teacher User ID Reference', type: 'text' },
    { name: 'studentCount', label: 'Initial Student Count', type: 'number' },
    { name: 'schoolTimings.schoolStart', label: 'Daily Session Start (HH:MM)', type: 'text' },
    { name: 'schoolTimings.schoolEnd', label: 'Daily Session End (HH:MM)', type: 'text' },
  ];

  const defaultValues = {
    gradeId: '',
    name: '',
    classTeacherId: '',
    studentCount: 0,
    schoolTimings: {
      workingDays: [1, 2, 3, 4, 5],
      schoolStart: '08:30',
      schoolEnd: '15:30',
      periods: [],
    },
  };

  const headers = ['Section Name', 'Grade Folder ID', 'Class Teacher', 'Strength Roster', 'Hours', 'Actions'];

  const renderRow = (
    item: ISection,
    onEdit: (item: ISection) => void,
    onDelete: (item: ISection) => void,
    onArchive: (item: ISection) => void
  ) => {
    const teacherEmail = (item.classTeacherId as any)?.email || item.classTeacherId || 'Unassigned';
    const gradeName = (item.gradeId as any)?.name || item.gradeId || 'Unassigned';
    const timingLabel = item.schoolTimings ? `${item.schoolTimings.schoolStart} - ${item.schoolTimings.schoolEnd}` : 'none';

    return (
      <TableRow key={item._id}>
        <TableCell className="font-bold text-slate-200">{item.name}</TableCell>
        <TableCell className="font-mono text-xs text-slate-500">{gradeName}</TableCell>
        <TableCell className="font-semibold text-indigo-400">{teacherEmail}</TableCell>
        <TableCell className="font-semibold">{item.studentCount} students</TableCell>
        <TableCell className="font-semibold font-mono text-slate-400">{timingLabel}</TableCell>
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
      <CrudManager<ISection>
        entityName="Section"
        apiEndpoint="/api/v1/erp/sections"
        zodSchema={SectionInputSchema}
        formFields={formFields}
        defaultValues={defaultValues}
        tableHeaders={headers}
        renderRow={renderRow}
      />
    </div>
  );
};
export default Sections;
