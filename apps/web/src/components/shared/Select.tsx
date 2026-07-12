import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-slate-400 select-none">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`h-10 rounded-xl bg-slate-900 border text-slate-200 px-3.5 text-xs focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
            error
              ? 'border-rose-500/50 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-violet-500 focus:ring-violet-500/20'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[10px] text-rose-400 font-semibold">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
