import React from 'react';
import { SubjectInputSchema } from '@mahathi/validation';
import { CrudManager, FormField } from '../components/shared/CrudManager';
import { TableRow, TableCell } from '../components/shared/Table';
import { Button } from '../components/shared/Button';
import { Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { ISubject } from '@mahathi/types';

export const Subjects: React.FC = () => {
  const formFields: FormField[] = [
    { name: 'name', label: 'Subject Name', type: 'text' },
    { name: 'code', label: 'Subject Code', type: 'text' },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'THEORY', label: 'Theory' },
        { value: 'PRACTICAL', label: 'Practical' },
        { value: 'LAB', label: 'Laboratory' },
      ],
    },
    { name: 'weeklyPeriodCount', label: 'Weekly Period Count', type: 'number' },
    { name: 'maxDailyPeriods', label: 'Max Daily Periods', type: 'number' },
    { name: 'doublePeriod', label: 'Contiguous Double Period Required', type: 'checkbox' },
    { name: 'isOptional', label: 'Optional Subject', type: 'checkbox' },
    { name: 'isElective', label: 'Elective Course', type: 'checkbox' },
  ];

  const defaultValues = {
    name: '',
    code: '',
    type: 'THEORY',
    weeklyPeriodCount: 4,
    maxDailyPeriods: 1,
    doublePeriod: false,
    isOptional: false,
    isElective: false,
  };

  const headers = ['Subject Code', 'Subject Name', 'Type', 'Weekly Periods', 'Status', 'Actions'];

  const renderRow = (
    item: ISubject,
    onEdit: (item: ISubject) => void,
    onDelete: (item: ISubject) => void,
    onArchive: (item: ISubject) => void
  ) => {
    return (
      <TableRow key={item._id}>
        <TableCell className="font-mono font-bold text-indigo-400">{item.code}</TableCell>
        <TableCell className="font-semibold text-slate-200">{item.name}</TableCell>
        <TableCell>
          <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded font-medium">
            {item.type}
          </span>
        </TableCell>
        <TableCell className="font-semibold">{item.weeklyPeriodCount} periods/wk</TableCell>
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

  const filterOptions = [
    {
      name: 'type',
      label: 'Type',
      options: [
        { value: 'THEORY', label: 'Theory' },
        { value: 'PRACTICAL', label: 'Practical' },
        { value: 'LAB', label: 'Laboratory' },
      ],
    },
  ];

  return (
    <div className="p-8">
      <CrudManager<ISubject>
        entityName="Subject"
        apiEndpoint="/api/v1/erp/subjects"
        zodSchema={SubjectInputSchema}
        formFields={formFields}
        defaultValues={defaultValues}
        tableHeaders={headers}
        renderRow={renderRow}
        filterOptions={filterOptions}
      />
    </div>
  );
};
export default Subjects;
