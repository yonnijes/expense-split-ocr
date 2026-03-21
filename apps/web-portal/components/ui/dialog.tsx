import * as React from 'react';

type DialogContextType = { open: boolean; setOpen: (v: boolean) => void };
const DialogCtx = React.createContext<DialogContextType | null>(null);

export function Dialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <DialogCtx.Provider value={{ open, setOpen }}>{children}</DialogCtx.Provider>;
}

export function DialogTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement<any>;
}) {
  const ctx = React.useContext(DialogCtx)!;
  if (asChild) {
    const childProps = (children.props ?? {}) as { onClick?: () => void };
    return React.cloneElement(children, {
      onClick: () => {
        childProps.onClick?.();
        ctx.setOpen(true);
      },
    });
  }
  return <button onClick={() => ctx.setOpen(true)}>{children}</button>;
}

export function DialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(DialogCtx)!;
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => ctx.setOpen(false)}>
      <div className={`w-full rounded-xl bg-white p-4 ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
