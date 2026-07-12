import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Upload, 
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Modal } from './Modal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { Table } from './Table';
import { EmptyState, Skeleton } from './FeedbackStates';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: { value: string; label: string }[];
}

export interface CrudManagerProps<T> {
  entityName: string;
  apiEndpoint: string;
  zodSchema: any;
  formFields: FormField[];
  defaultValues: any;
  tableHeaders: string[];
  renderRow: (item: T, onEdit: (item: T) => void, onDelete: (item: T) => void, onArchive: (item: T) => void) => React.ReactNode;
  filterOptions?: { name: string; label: string; options: { value: string; label: string }[] }[];
}

export function CrudManager<T extends { _id: string; isArchived?: boolean }>({
  entityName,
  apiEndpoint,
  zodSchema,
  formFields,
  defaultValues,
  tableHeaders,
  renderRow,
  filterOptions = [],
}: CrudManagerProps<T>) {
  const queryClient = useQueryClient();
  
  // State management
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  
  const [importOpen, setImportOpen] = useState(false);
  const [csvString, setCsvString] = useState('');

  // Form hook setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zodSchema as any),
    defaultValues,
  });

  // Reset form when editing item changes
  useEffect(() => {
    if (editingItem) {
      reset(editingItem as any);
    } else {
      reset(defaultValues);
    }
  }, [editingItem, reset, defaultValues]);

  // Fetch items list query
  const { data, isLoading, error } = useQuery({
    queryKey: [entityName, page, search, selectedFilters],
    queryFn: async () => {
      const params = {
        page,
        limit: 8,
        search,
        ...selectedFilters,
      };
      // Axios request with credentials header configured
      const response = await axios.get(apiEndpoint, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      return response.data;
    },
  });

  // Mutators: Create, Edit, Delete, Archive, Import
  const createMutation = useMutation({
    mutationFn: (payload: any) =>
      axios.post(apiEndpoint, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }),
    onSuccess: () => {
      toast.success(`${entityName} created successfully.`);
      queryClient.invalidateQueries({ queryKey: [entityName] });
      setFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Error occurred.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      axios.put(`${apiEndpoint}/${id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }),
    onSuccess: () => {
      toast.success(`${entityName} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: [entityName] });
      setFormOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Error occurred.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${apiEndpoint}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }),
    onSuccess: () => {
      toast.success(`${entityName} soft-deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: [entityName] });
      setDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Error occurred.');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      axios.post(`${apiEndpoint}/${id}/${archive ? 'archive' : 'restore'}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }),
    onSuccess: (_, variables) => {
      toast.success(`${entityName} ${variables.archive ? 'archived' : 'restored'} successfully.`);
      queryClient.invalidateQueries({ queryKey: [entityName] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Error occurred.');
    },
  });

  const importMutation = useMutation({
    mutationFn: (items: any[]) =>
      axios.post(`${apiEndpoint}/import`, { items }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'Imported successfully.');
      queryClient.invalidateQueries({ queryKey: [entityName] });
      setImportOpen(false);
      setCsvString('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Import failed.');
    },
  });

  // Action handlers
  const handleFormSubmit = (values: any) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEditClick = (item: T) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
    setDeleteOpen(true);
  };

  const handleArchiveToggle = (item: T) => {
    archiveMutation.mutate({ id: item._id, archive: !item.isArchived });
  };

  const handleImportSubmit = () => {
    // Parse CSV rows into objects
    try {
      const rows = csvString.trim().split('\n');
      if (rows.length < 2) {
        toast.error('CSV must contain header and at least one data row.');
        return;
      }
      const headers = rows[0].split(',').map((h) => h.trim());
      const items = rows.slice(1).map((row) => {
        const values = row.split(',').map((v) => v.trim());
        const obj: any = {};
        headers.forEach((header, idx) => {
          const val = values[idx];
          // Try parse numbers
          if (!isNaN(Number(val)) && val !== '') {
            obj[header] = Number(val);
          } else if (val === 'true' || val === 'false') {
            obj[header] = val === 'true';
          } else {
            obj[header] = val;
          }
        });
        return obj;
      });

      importMutation.mutate(items);
    } catch (e: any) {
      toast.error(`Format error: ${e.message}`);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const itemsList = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">{entityName} Manager</h2>
          <p className="text-xs text-slate-400">Perform CRUD edits and bulk CSV uploads on {entityName} profiles.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5 h-9">
            <Upload className="h-3.5 w-3.5" />
            Bulk Import
          </Button>
          <Button onClick={() => { setEditingItem(null); setFormOpen(true); }} className="gap-1.5 h-9">
            <Plus className="h-4 w-4" />
            Add {entityName}
          </Button>
        </div>
      </div>

      {/* Advanced Filter + Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-800 bg-[#0d111e]/20">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${entityName.toLowerCase()}s...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-full rounded-lg bg-slate-900/60 border border-slate-800 pl-9 pr-4 text-xs focus:outline-none focus:border-violet-500 text-slate-300"
          />
        </div>

        {filterOptions.map((filter) => (
          <select
            key={filter.name}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            className="h-9 rounded-lg bg-slate-900/60 border border-slate-800 px-3 text-xs text-slate-400 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-950">
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-rose-400 border border-rose-950/20 bg-rose-950/5 rounded-xl">
          Error retrieving {entityName.toLowerCase()} listings. Verify database states.
        </div>
      ) : itemsList.length === 0 ? (
        <EmptyState
          title={`No ${entityName.toLowerCase()}s matched`}
          description={`Click Add ${entityName} or upload a CSV template to seed initial registries.`}
          icon={<Info className="h-6 w-6 text-slate-500" />}
        />
      ) : (
        <div className="space-y-4">
          <Table headers={tableHeaders}>
            {itemsList.map((item: T) =>
              renderRow(item, () => handleEditClick(item), handleDeleteClick, handleArchiveToggle)
            )}
          </Table>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs select-none">
              <span className="text-slate-400 font-medium">
                Showing <strong className="text-slate-200">{itemsList.length}</strong> items (Total: {pagination.total})
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-8 w-8 !p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-slate-200 font-bold px-2">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={page === pagination.totalPages}
                  className="h-8 w-8 !p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <Modal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingItem(null); }} title={editingItem ? `Edit ${entityName}` : `Create New ${entityName}`}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formFields.map((field) => {
            if (field.type === 'select') {
              return (
                <Select
                  key={field.name}
                  label={field.label}
                  options={field.options || []}
                  error={errors[field.name]?.message as string}
                  {...register(field.name)}
                />
              );
            }
            if (field.type === 'checkbox') {
              return (
                <div key={field.name} className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id={field.name}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-violet-600 focus:ring-violet-500/20"
                    {...register(field.name)}
                  />
                  <label htmlFor={field.name} className="text-xs font-semibold text-slate-400 select-none">
                    {field.label}
                  </label>
                </div>
              );
            }
            return (
              <Input
                key={field.name}
                label={field.label}
                type={field.type}
                error={errors[field.name]?.message as string}
                {...register(field.name, {
                  valueAsNumber: field.type === 'number',
                })}
              />
            );
          })}

          <div className="flex items-center gap-3.5 pt-4 border-t border-slate-800/60">
            <Button
              variant="outline"
              type="button"
              onClick={() => { setFormOpen(false); setEditingItem(null); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} className="flex-1">
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => itemToDelete && deleteMutation.mutate(itemToDelete._id)}
        title={`Delete ${entityName}`}
        message={`Are you sure you want to delete this ${entityName.toLowerCase()}? This will move it to the system trash bins.`}
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* CSV Bulk Import Modal */}
      <Modal isOpen={importOpen} onClose={() => setImportOpen(false)} title={`Bulk Import ${entityName}s`}>
        <div className="space-y-4">
          <p className="text-[11px] text-slate-400 leading-normal">
            Paste comma-separated rows here. The first row must exactly contain matching schema attributes.
            Example: <strong className="text-slate-350">{formFields.map(f => f.name).join(',')}</strong>
          </p>

          <textarea
            value={csvString}
            onChange={(e) => setCsvString(e.target.value)}
            rows={6}
            placeholder={`name,type,capacity\nRoom 101,CLASSROOM,40\nPhysics Lab,SCIENCE_LAB,30`}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-violet-500"
          />

          <div className="flex items-center gap-3 pt-3">
            <Button variant="outline" onClick={() => setImportOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleImportSubmit} isLoading={importMutation.isPending} className="flex-1">
              Run Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
