import * as React from 'react';

function cls(...arr: Array<string | false | undefined>) {
  return arr.filter(Boolean).join(' ');
}

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cls('relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200', className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cls('text-xs font-semibold text-slate-700', className)} {...props} />;
}
