'use client';

import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TicketContract } from '@shared/contracts';
import { computeSplitSummary, Participant, SplitMode } from '../stores/useTicketStore';

type Props = {
  ticket: TicketContract;
  participants: Participant[];
  splitMode: SplitMode;
  allocations: Record<number, string[]>;
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: string) => void;
  onSetMode: (mode: SplitMode) => void;
  onAssignItem: (itemIndex: number, ids: string[]) => void;
};

export function SplitManager(props: Props) {
  const [name, setName] = useState('');

  const summary = useMemo(
    () =>
      computeSplitSummary({
        step: 'splitting',
        imageFile: null,
        imagePreviewUrl: null,
        progressMessage: '',
        ticket: props.ticket,
        splitMode: props.splitMode,
        participants: props.participants,
        allocations: props.allocations,
        error: null,
      }),
    [props]
  );

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Reparto de gastos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre participante" />
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              props.onAddParticipant(name);
              setName('');
            }}
          >
            Añadir
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {props.participants.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{p.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-700">{p.name}</span>
              <button className="text-xs text-red-500" onClick={() => props.onRemoveParticipant(p.id)}>
                x
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={props.splitMode === 'equal' ? 'default' : 'outline'}
            onClick={() => props.onSetMode('equal')}
            className={props.splitMode === 'equal' ? 'bg-slate-900 hover:bg-slate-800' : ''}
          >
            Equitativo
          </Button>
          <Button
            variant={props.splitMode === 'by-item' ? 'default' : 'outline'}
            onClick={() => props.onSetMode('by-item')}
            className={props.splitMode === 'by-item' ? 'bg-slate-900 hover:bg-slate-800' : ''}
          >
            Por ítem
          </Button>
        </div>

        {props.splitMode === 'by-item' && (
          <div className="space-y-3 rounded-lg border p-3">
            {props.ticket.items.map((item, idx) => (
              <div key={`${item.description}-${idx}`} className="space-y-2">
                <p className="text-sm font-medium text-slate-800">
                  {item.description} · {(item.price * (item.quantity ?? 1)).toFixed(2)} {props.ticket.currency}
                </p>
                <div className="flex flex-wrap gap-2">
                  {props.participants.map((p) => {
                    const active = (props.allocations[idx] ?? []).includes(p.id);
                    return (
                      <Button
                        key={p.id}
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        onClick={() => {
                          const current = props.allocations[idx] ?? [];
                          const next = active ? current.filter((x) => x !== p.id) : [...current, p.id];
                          props.onAssignItem(idx, next);
                        }}
                      >
                        {p.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-900">Saldos finales</p>
          <div className="space-y-1 text-sm">
            {props.participants.map((p) => (
              <p key={p.id} className="text-slate-700">
                {p.name}: <span className="font-semibold">{(summary[p.id] ?? 0).toFixed(2)} {props.ticket.currency}</span>
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
