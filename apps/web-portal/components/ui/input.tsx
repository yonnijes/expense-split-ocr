import * as React from 'react';

function cls(...arr: Array<string | false | undefined>) {
  return arr.filter(Boolean).join(' ');
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cls(
          'h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        {...props}
      />
    );
  }
);
