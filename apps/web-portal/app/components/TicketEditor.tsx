'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TicketSchema, type TicketContract } from '@shared/contracts';
import { AlertTriangle, ZoomIn, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

type Props = {
  imageUrl: string;
  value: TicketContract;
  onChange: (next: TicketContract) => void;
  onContinue: () => void;
};

export function TicketEditor({ imageUrl, value, onChange, onContinue }: Props) {
  const form = useForm<TicketContract>({
    resolver: zodResolver(TicketSchema),
    defaultValues: value,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const watched = form.watch();
  const itemsSum = useMemo(
    () => watched.items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0),
    [watched.items]
  );
  const total = Number(watched.total || 0);
  const isMismatch = Math.abs(itemsSum - total) > 0.01;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ZoomIn className="mr-2 h-4 w-4" /> Zoom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <div className="relative h-[70vh] w-full">
                <Image src={imageUrl} alt="Ticket" fill className="object-contain" />
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative h-[420px] w-full overflow-hidden rounded-lg border bg-slate-50">
            <Image src={imageUrl} alt="Ticket preview" fill className="object-contain" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Validar extracción OCR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="Comercio" {...form.register('merchant')} />
            <Input placeholder="Fecha ISO" {...form.register('date')} />
            <Input placeholder="Moneda" {...form.register('currency')} />
            <Input type="number" step="0.01" placeholder="Total" {...form.register('total', { valueAsNumber: true })} />
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-24">Cant.</TableHead>
                  <TableHead className="w-32">Precio</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input {...form.register(`items.${index}.description`)} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={1} {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" {...form.register(`items.${index}.price`, { valueAsNumber: true })} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            variant="outline"
            onClick={() => append({ description: '', quantity: 1, price: 0 })}
            className="border-blue-500 text-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar ítem
          </Button>

          {isMismatch && (
            <div className="flex items-center rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mr-2 h-4 w-4" />
              La suma de ítems ({itemsSum.toFixed(2)}) no coincide con el total ({total.toFixed(2)}).
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="bg-slate-900 hover:bg-slate-800"
              onClick={form.handleSubmit((data) => {
                onChange(data);
                onContinue();
              })}
            >
              Continuar a reparto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
