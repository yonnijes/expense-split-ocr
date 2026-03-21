import * as React from 'react';

type Variant = 'default' | 'outline' | 'ghost';
type Size = 'default' | 'sm' | 'icon';

function cls(...arr: Array<string | false | undefined>) {
  return arr.filter(Boolean).join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'default', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cls(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50',
        variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-800',
        variant === 'outline' && 'border border-slate-300 bg-white hover:bg-slate-50',
        variant === 'ghost' && 'hover:bg-slate-100',
        size === 'default' && 'h-10 px-4 py-2',
        size === 'sm' && 'h-9 px-3',
        size === 'icon' && 'h-9 w-9',
        className
      )}
      {...props}
    />
  );
});
