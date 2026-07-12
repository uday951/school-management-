import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', containerClassName = '', type = 'text', ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-slate-400 select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`h-10 rounded-xl bg-slate-900/80 border text-slate-200 px-3.5 text-xs focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-rose-500/50 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-violet-500 focus:ring-violet-500/20'
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-[10px] text-rose-400 font-semibold">{error}</span>
        ) : helperText ? (
          <span className="text-[10px] text-slate-500 font-medium">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
