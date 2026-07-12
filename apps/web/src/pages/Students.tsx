import React from 'react';
import { StudentInputSchema } from '@mahathi/validation';
import { CrudManager, FormField } from '../components/shared/CrudManager';
import { TableRow, TableCell } from '../components/shared/Table';
import { Button } from '../components/shared/Button';
import { Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { IStudent } from '@mahathi/types';

export const Students: React.FC = () => {
  const formFields: FormField[] = [
    { name: 'admissionNumber', label: 'Admission Number', type: 'text' },
    { name: 'rollNumber', label: 'Roll Number', type: 'text' },
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'sectionId', label: 'Section Reference ID', type: 'text' },
    { name: 'guardian.name', label: 'Guardian Full Name', type: 'text' },
    { name: 'guardian.relation', label: 'Relation to Student', type: 'text' },
    { name: 'guardian.phone', label: 'Guardian Contact Phone', type: 'text' },
  ];

  const defaultValues = {
    admissionNumber: '',
    rollNumber: '',
    firstName: '',
    lastName: '',
    sectionId: '',
    guardian: {
      name: '',
      relation: 'Father',
      phone: '',
    },
  };

  const headers = ['Adm. No.', 'Roll No.', 'Student Name', 'Grade & Section', 'Guardian Contact', 'Actions'];

  const renderRow = (
    item: IStudent,
    onEdit: (item: IStudent) => void,
    onDelete: (item: IStudent) => void,
    onArchive: (item: IStudent) => void
  ) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    const sectionName = (item.sectionId as any)?.name || 'Unassigned';
    const gradeName = (item.sectionId as any)?.gradeId?.name || '';
    const classLabel = gradeName ? `${gradeName} - ${sectionName}` : sectionName;

    return (
      <TableRow key={item._id}>
        <TableCell className="font-mono font-bold text-indigo-400">{item.admissionNumber}</TableCell>
        <TableCell className="font-semibold">{item.rollNumber}</TableCell>
        <TableCell className="font-bold text-slate-200">{fullName}</TableCell>
        <TableCell className="font-semibold text-slate-400">{classLabel}</TableCell>
        <TableCell>
          <div>
            <h4 className="font-semibold text-slate-300">{item.guardian?.name || 'Unassigned'}</h4>
            <span className="text-[10px] text-slate-500 font-mono">{item.guardian?.phone || 'none'}</span>
          </div>
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
      <CrudManager<IStudent>
        entityName="Student"
        apiEndpoint="/api/v1/erp/students"
        zodSchema={StudentInputSchema}
        formFields={formFields}
        defaultValues={defaultValues}
        tableHeaders={headers}
        renderRow={renderRow}
      />
    </div>
  );
};
export default Students;
