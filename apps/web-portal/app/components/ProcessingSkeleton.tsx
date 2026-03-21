'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  message: string;
};

export function ProcessingSkeleton({ message }: Props) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">Procesando ticket...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="space-y-2 rounded-lg border border-slate-200 p-4">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-slate-200" />
        </div>
        <p className="text-sm text-blue-600">{message}</p>
      </CardContent>
    </Card>
  );
}
