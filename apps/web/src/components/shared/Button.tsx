import React, { ButtonHTMLAttributes } from 'react';
import { Spinner } from '@mahathi/ui';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/10',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/50',
    outline: 'border border-slate-700 hover:bg-slate-800/40 text-slate-300',
    ghost: 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200',
    destructive: 'bg-rose-600/15 border border-rose-500/20 hover:bg-rose-600/35 text-rose-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4.5 py-2.5 text-xs',
    lg: 'px-6 py-3.5 text-sm',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
      {children}
    </button>
  );
};
export default Button;
