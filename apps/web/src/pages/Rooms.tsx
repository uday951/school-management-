import React from 'react';
import { RoomInputSchema } from '@mahathi/validation';
import { CrudManager, FormField } from '../components/shared/CrudManager';
import { TableRow, TableCell } from '../components/shared/Table';
import { Button } from '../components/shared/Button';
import { Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { IRoom } from '@mahathi/types';

export const Rooms: React.FC = () => {
  const formFields: FormField[] = [
    { name: 'name', label: 'Room Name', type: 'text' },
    {
      name: 'type',
      label: 'Room Type',
      type: 'select',
      options: [
        { value: 'CLASSROOM', label: 'Classroom' },
        { value: 'SCIENCE_LAB', label: 'Science Lab' },
        { value: 'COMPUTER_LAB', label: 'Computer Lab' },
        { value: 'LANGUAGE_LAB', label: 'Language Lab' },
        { value: 'LIBRARY', label: 'Library' },
        { value: 'AUDITORIUM', label: 'Auditorium' },
        { value: 'GROUND', label: 'Ground' },
        { value: 'SPORTS_AREA', label: 'Sports Area' },
      ],
    },
    { name: 'capacity', label: 'Seating Capacity', type: 'number' },
  ];

  const defaultValues = {
    name: '',
    type: 'CLASSROOM',
    capacity: 30,
  };

  const headers = ['Room Name', 'Type', 'Capacity', 'Status', 'Actions'];

  const renderRow = (
    item: IRoom,
    onEdit: (item: IRoom) => void,
    onDelete: (item: IRoom) => void,
    onArchive: (item: IRoom) => void
  ) => {
    return (
      <TableRow key={item._id}>
        <TableCell className="font-bold text-slate-200">{item.name}</TableCell>
        <TableCell>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium font-mono">
            {item.type}
          </span>
        </TableCell>
        <TableCell className="font-semibold">{item.capacity} seats</TableCell>
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
        { value: 'CLASSROOM', label: 'Classroom' },
        { value: 'SCIENCE_LAB', label: 'Science Lab' },
        { value: 'COMPUTER_LAB', label: 'Computer Lab' },
        { value: 'LIBRARY', label: 'Library' },
      ],
    },
  ];

  return (
    <div className="p-8">
      <CrudManager<IRoom>
        entityName="Room"
        apiEndpoint="/api/v1/erp/rooms"
        zodSchema={RoomInputSchema}
        formFields={formFields}
        defaultValues={defaultValues}
        tableHeaders={headers}
        renderRow={renderRow}
        filterOptions={filterOptions}
      />
    </div>
  );
};
export default Rooms;
