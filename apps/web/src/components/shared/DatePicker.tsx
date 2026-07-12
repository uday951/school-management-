import { InputHTMLAttributes, forwardRef } from 'react';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-400 select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          className={`h-10 rounded-xl bg-slate-900 border text-slate-200 px-3.5 text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer [color-scheme:dark] ${
            error
              ? 'border-rose-500/50 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-violet-500 focus:ring-violet-500/20'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-[10px] text-rose-400 font-semibold">{error}</span>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
