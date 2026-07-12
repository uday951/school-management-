import React from 'react';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-900/10 ${className}`}>
      <table className="w-full min-w-[640px] text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-900/50 text-slate-400 font-semibold border-b border-slate-800">
            {headers.map((h, i) => (
              <th key={i} className="px-5 py-3 select-none">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <tr className={`hover:bg-slate-800/10 transition-colors ${className}`}>
      {children}
    </tr>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <td className={`px-5 py-3.5 align-middle ${className}`}>
      {children}
    </td>
  );
};
export default Table;
