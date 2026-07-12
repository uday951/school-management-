import React from 'react';
import { TeacherInputSchema } from '@mahathi/validation';
import { CrudManager, FormField } from '../components/shared/CrudManager';
import { TableRow, TableCell } from '../components/shared/Table';
import { Button } from '../components/shared/Button';
import { Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { ITeacher } from '@mahathi/types';

export const Teachers: React.FC = () => {
  const formFields: FormField[] = [
    { name: 'userId', label: 'User Reference ID', type: 'text' },
    { name: 'employeeId', label: 'Employee ID Roster', type: 'text' },
    { name: 'department', label: 'Academic Department', type: 'text' },
    { name: 'experienceYears', label: 'Years of Experience', type: 'number' },
    { name: 'maxDailyLoad', label: 'Max Daily Period Load', type: 'number' },
    { name: 'maxWeeklyLoad', label: 'Max Weekly Period Load', type: 'number' },
    { name: 'isPartTime', label: 'Part-Time Contract', type: 'checkbox' },
    { name: 'isShared', label: 'Shared / Visiting Teacher', type: 'checkbox' },
  ];

  const defaultValues = {
    userId: '',
    employeeId: '',
    department: 'Science',
    experienceYears: 5,
    maxDailyLoad: 6,
    maxWeeklyLoad: 30,
    isPartTime: false,
    isShared: false,
  };

  const headers = ['Employee ID', 'Name / User Email', 'Department', 'Weekly Load', 'Contract Type', 'Actions'];

  const renderRow = (
    item: ITeacher,
    onEdit: (item: ITeacher) => void,
    onDelete: (item: ITeacher) => void,
    onArchive: (item: ITeacher) => void
  ) => {
    const userEmail = (item.userId as any)?.email || item.userId || 'unassigned@school.com';
    const profile = (item.userId as any)?.profile;
    const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Unassigned Profile';

    return (
      <TableRow key={item._id}>
        <TableCell className="font-mono font-bold text-violet-400">{item.employeeId}</TableCell>
        <TableCell>
          <div>
            <h4 className="font-bold text-slate-200">{fullName}</h4>
            <span className="text-[10px] text-slate-500 font-semibold font-mono">{userEmail}</span>
          </div>
        </TableCell>
        <TableCell className="font-semibold">{item.department}</TableCell>
        <TableCell className="font-semibold">{item.maxWeeklyLoad} periods/wk</TableCell>
        <TableCell>
          <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
            item.isPartTime 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            {item.isPartTime ? 'PART TIME' : 'FULL TIME'}
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
      name: 'department',
      label: 'Department',
      options: [
        { value: 'Science', label: 'Science' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'English', label: 'English' },
        { value: 'Humanities', label: 'Humanities' },
      ],
    },
  ];

  return (
    <div className="p-8">
      <CrudManager<ITeacher>
        entityName="Teacher"
        apiEndpoint="/api/v1/erp/teachers"
        zodSchema={TeacherInputSchema}
        formFields={formFields}
        defaultValues={defaultValues}
        tableHeaders={headers}
        renderRow={renderRow}
        filterOptions={filterOptions}
      />
    </div>
  );
};
export default Teachers;
