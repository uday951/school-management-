import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const getRangeStart = () => (currentPage - 1) * (itemsPerPage || 10) + 1;
  const getRangeEnd = () => Math.min(currentPage * (itemsPerPage || 10), totalItems || 0);

  return (
    <div className="flex items-center justify-between px-2 py-4 text-xs select-none">
      <div className="text-slate-400 font-medium">
        {totalItems && itemsPerPage ? (
          <>
            Showing <strong className="text-slate-200">{getRangeStart()}</strong> to{' '}
            <strong className="text-slate-200">{getRangeEnd()}</strong> of{' '}
            <strong className="text-slate-200">{totalItems}</strong> entries
          </>
        ) : (
          `Page ${currentPage} of ${totalPages}`
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 !p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const isCurrent = pageNum === currentPage;
          return (
            <Button
              key={pageNum}
              variant={isCurrent ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 !p-0 ${
                !isCurrent ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : ''
              }`}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 !p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export default Pagination;
